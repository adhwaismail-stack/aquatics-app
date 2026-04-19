import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

export const runtime = 'nodejs'
export const maxDuration = 60

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const ARTICLE_HEADERS: Record<string, string> = {
  '1': 'DEFINITIONS AND GENERAL RULES',
  '2': 'OFFICIALS',
  '3': 'EQUIPMENT AND FACILITIES',
  '4': 'THE START',
  '5': 'THE FINISH',
  '6': 'BACKSTROKE',
  '7': 'BREASTSTROKE',
  '8': 'BUTTERFLY',
  '9': 'FREESTYLE',
  '10': 'INDIVIDUAL MEDLEY',
  '11': 'RELAY EVENTS',
  '12': 'OPEN WATER SWIMMING',
  '13': 'MASTERS SWIMMING',
  '14': 'PARA SWIMMING',
  '15': 'FACILITIES AND EQUIPMENT',
  '16': 'COMPETITION REGULATIONS',
  '17': 'TIMING AND RESULTS',
  '18': 'DOPING CONTROL',
  '19': 'APPEALS AND PROTESTS',
  '20': 'GENERAL PROVISIONS',
}

function getArticleLabel(articleNum: string): string {
  const main = articleNum.split('.')[0]
  const header = ARTICLE_HEADERS[main]
  return header ? `[${header} - Article ${articleNum}] ` : `[Article ${articleNum}] `
}

function removeTOC(text: string): string {
  // Remove table of contents pages — lines that are mostly dots and numbers
  const lines = text.split('\n')
  const filtered = lines.filter(line => {
    const dotRatio = (line.match(/\./g) || []).length / (line.length || 1)
    const isTOCLine = dotRatio > 0.3 && /\d+$/.test(line.trim())
    return !isTOCLine
  })
  return filtered.join('\n')
}

function cleanText(text: string): string {
  return text
    .replace(/\f/g, '\n\n')           // form feed = new page = paragraph break
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\.{4,}/g, ' ')          // remove dot leaders (.......)
    .replace(/_{4,}/g, ' ')           // remove underscores
    .replace(/[ \t]{2,}/g, ' ')       // collapse multiple spaces
    .replace(/\n{3,}/g, '\n\n')       // max 2 newlines
    .trim()
}

function smartChunk(text: string): string[] {
  // Remove TOC before processing
  const noTOC = removeTOC(text)
  const cleaned = cleanText(noTOC)
  const chunks: string[] = []

  // Split by article number patterns
  // Matches: "4.1 ", "4.1.1 ", "SW 4.1 ", "WP 2.5.3 " etc.
  const articlePattern = /(?=(?:SW\s+|WP\s+|AS\s+|DV\s+|HD\s+|MS\s+)?(\d+)\.(\d+)(?:\.(\d+))?\s+[A-Z][a-z])/g

  const parts = cleaned.split(articlePattern)

  const contentParts: string[] = []
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]
    if (part && part.trim().length > 50 && !/^\d+$/.test(part.trim())) {
      contentParts.push(part.trim())
    }
  }

  for (const part of contentParts) {
    const numMatch = part.match(/^(?:SW\s+|WP\s+|AS\s+|DV\s+|HD\s+|MS\s+)?(\d+\.\d+(?:\.\d+)?)/)
    const articleNum = numMatch ? numMatch[1] : ''
    const label = articleNum ? getArticleLabel(articleNum) : ''

    // Preserve paragraph structure within chunk
    const normalized = part.replace(/\n\n/g, ' | ').replace(/\n/g, ' ').trim()

    if (normalized.length <= 3000) {
      if (normalized.length > 100) {
        chunks.push(label + normalized)
      }
    } else {
      // Split long chunks at sentence boundaries
      let remaining = normalized
      while (remaining.length > 3000) {
        const cutPoint = remaining.lastIndexOf('. ', 2800)
        if (cutPoint > 200) {
          chunks.push(label + remaining.slice(0, cutPoint + 1).trim())
          remaining = remaining.slice(cutPoint + 2)
        } else {
          chunks.push(label + remaining.slice(0, 3000).trim())
          remaining = remaining.slice(3000)
        }
      }
      if (remaining.trim().length > 100) {
        chunks.push(label + remaining.trim())
      }
    }
  }

  // Fallback: size-based chunking with overlap
  if (chunks.length < 10) {
    console.log(`Only got ${chunks.length} chunks from article split, using size-based fallback`)
    const fallback: string[] = []
    const chunkSize = 1500
    const overlap = 300

    for (let i = 0; i < cleaned.length; i += chunkSize - overlap) {
      const chunk = cleaned.slice(i, i + chunkSize).trim()
      if (chunk.length > 100) {
        fallback.push(chunk)
      }
    }
    return fallback
  }

  return chunks.filter(c => c.trim().length > 100)
}

export async function POST(request: NextRequest) {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!
    })

    const { fileName, discipline, originalName, replaceFileId } = await request.json()

    if (!fileName || !discipline) {
      return NextResponse.json(
        { error: 'fileName and discipline are required' },
        { status: 400 }
      )
    }

    const { data: fileData, error: downloadError } = await supabase.storage
      .from('rulebook')
      .download(fileName)

    if (downloadError || !fileData) {
      throw new Error(`Failed to download file: ${downloadError?.message}`)
    }

    const arrayBuffer = await fileData.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)

    let text = ''
    if (originalName.endsWith('.txt')) {
      text = Buffer.from(arrayBuffer).toString('utf-8')
    } else {
      const { extractText } = await import('unpdf')
      const { text: extractedText } = await extractText(uint8Array, { mergePages: true })
      text = extractedText
    }

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Could not extract text from file.' },
        { status: 400 }
      )
    }

    console.log(`Extracted ${text.length} characters from ${originalName}`)

    const chunks = smartChunk(text)
    console.log(`Created ${chunks.length} chunks`)

    if (chunks.length === 0) {
      return NextResponse.json(
        { error: 'Could not extract any content from file.' },
        { status: 400 }
      )
    }

    if (replaceFileId) {
      const { data: oldFile } = await supabase
        .from('rulebook_files')
        .select('original_name')
        .eq('id', replaceFileId)
        .single()

      if (oldFile) {
        await supabase
          .from('rulebook_chunks')
          .delete()
          .eq('discipline', discipline)
          .eq('source_file', oldFile.original_name)
      }

      await supabase
        .from('rulebook_files')
        .delete()
        .eq('id', replaceFileId)
    }

    await supabase
      .from('rulebook_chunks')
      .delete()
      .eq('discipline', discipline)
      .eq('source_file', originalName)

    const batchSize = 20
    let totalSaved = 0

    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize)

      const embeddingResponse = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: batch
      })

      const rows = batch.map((content, j) => ({
        discipline,
        content,
        chunk_index: i + j,
        source_file: originalName,
        embedding: embeddingResponse.data[j].embedding
      }))

      const { error } = await supabase
        .from('rulebook_chunks')
        .insert(rows)

      if (error) throw error

      totalSaved += batch.length
      console.log(`Saved ${totalSaved}/${chunks.length} chunks...`)
    }

    const { data: fileRecord } = await supabase
      .from('rulebook_files')
      .insert({
        discipline,
        file_name: fileName,
        original_name: originalName,
        chunk_count: chunks.length
      })
      .select()
      .single()

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${chunks.length} chunks`,
      chunks: chunks.length,
      discipline,
      fileId: fileRecord?.id
    })

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Upload error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}