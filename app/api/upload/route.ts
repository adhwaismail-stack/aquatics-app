import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'

export const runtime = 'nodejs'
export const maxDuration = 120

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
    .replace(/\f/g, '\n\n')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\.{4,}/g, ' ')
    .replace(/_{4,}/g, ' ')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function smartChunk(text: string): string[] {
  const noTOC = removeTOC(text)
  const cleaned = cleanText(noTOC)
  const chunks: string[] = []

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
    const normalized = part.replace(/\n\n/g, ' | ').replace(/\n/g, ' ').trim()

    if (normalized.length <= 3000) {
      if (normalized.length > 100) {
        chunks.push(label + normalized)
      }
    } else {
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

async function extractVisualDescriptions(arrayBuffer: ArrayBuffer, discipline: string): Promise<string[]> {
  try {
    const fileSizeBytes = arrayBuffer.byteLength
    const fileSizeMB = fileSizeBytes / (1024 * 1024)

    if (fileSizeMB > 20) {
      console.log(`PDF too large for vision (${fileSizeMB.toFixed(1)}MB), skipping visual extraction`)
      return []
    }

    console.log(`Running vision extraction on ${fileSizeMB.toFixed(1)}MB PDF...`)

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!
    })

    const base64PDF = Buffer.from(arrayBuffer).toString('base64')

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'document',
            source: {
              type: 'base64',
              media_type: 'application/pdf',
              data: base64PDF
            }
          } as any,
          {
            type: 'text',
            text: `You are analyzing a ${discipline} rulebook PDF. Find ALL visual elements such as diagrams, tables, pool layouts, field diagrams, equipment illustrations, and figures.

For each visual element found, write a detailed text description in this exact format:
[VISUAL: Article X.X] Description of what the diagram shows, including all measurements, labels, dimensions, and specifications visible.

Rules:
- Only describe actual visual elements (diagrams, tables, figures, layouts)
- Include all numbers, measurements and labels you can see
- If no visual elements exist, reply only with: NO_VISUAL_CONTENT
- Do not describe text paragraphs, only visual elements`
          }
        ]
      }]
    })

    const content = response.content[0]
    if (content.type !== 'text') return []

    const text = content.text.trim()
    if (text === 'NO_VISUAL_CONTENT' || text.includes('NO_VISUAL_CONTENT')) {
      console.log('No visual content found in PDF')
      return []
    }

    const visuals = text
      .split(/(?=\[VISUAL:)/)
      .map(v => v.trim())
      .filter(v => v.startsWith('[VISUAL:') && v.length > 50)

    console.log(`Found ${visuals.length} visual descriptions`)
    return visuals

  } catch (err) {
    console.error('Vision extraction failed (non-fatal):', err)
    return []
  }
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

    const textChunks = smartChunk(text)
    console.log(`Created ${textChunks.length} text chunks`)

    if (textChunks.length === 0) {
      return NextResponse.json(
        { error: 'Could not extract any content from file.' },
        { status: 400 }
      )
    }

    // Extract visual descriptions if PDF
    let visualChunks: string[] = []
    if (!originalName.endsWith('.txt')) {
      visualChunks = await extractVisualDescriptions(arrayBuffer, discipline)
    }

    const chunks = [...textChunks, ...visualChunks]
    console.log(`Total chunks: ${chunks.length} (${textChunks.length} text + ${visualChunks.length} visual)`)

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
      message: `Successfully processed ${chunks.length} chunks (${textChunks.length} text + ${visualChunks.length} visual)`,
      chunks: chunks.length,
      textChunks: textChunks.length,
      visualChunks: visualChunks.length,
      discipline,
      fileId: fileRecord?.id
    })

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Upload error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}