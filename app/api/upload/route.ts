import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

export const runtime = 'nodejs'
export const maxDuration = 60

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Article header mapping for Swimming disciplines
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

function cleanText(text: string): string {
  return text
    .replace(/\f/g, ' ')                    // Remove form feeds
    .replace(/\r\n/g, '\n')                 // Normalize line endings
    .replace(/\r/g, '\n')                   // Normalize line endings
    .replace(/\.{4,}/g, ' ')               // Remove dot leaders (table of contents)
    .replace(/_{4,}/g, ' ')               // Remove underscores
    .replace(/\n{3,}/g, '\n\n')           // Max 2 consecutive newlines
    .replace(/[ \t]{2,}/g, ' ')           // Multiple spaces to single
    .trim()
}

function smartChunk(text: string): string[] {
  const cleaned = cleanText(text)
  const lines = cleaned.split('\n')
  const chunks: string[] = []
  let currentChunk = ''
  let currentArticle = ''

  // Pattern to detect article numbers like 4.1, 4.1.1, SW 4.1, etc.
  const articlePattern = /^(?:SW\s+|WP\s+|AS\s+|DV\s+|HD\s+|MS\s+)?(\d+\.\d+(?:\.\d+)*)\s+[A-Z]/

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    const match = trimmed.match(articlePattern)

    if (match) {
      // Found a new article — save current chunk if substantial
      if (currentChunk.trim().length > 100) {
        const label = getArticleLabel(currentArticle)
        chunks.push(label + currentChunk.trim())
      }

      // Start new chunk
      currentArticle = match[1]
      currentChunk = trimmed + ' '
    } else {
      // Continue current chunk
      currentChunk += trimmed + ' '

      // If chunk is getting too long, split at sentence boundary
      if (currentChunk.length > 3000) {
        const sentenceEnd = currentChunk.lastIndexOf('. ', 2800)
        if (sentenceEnd > 500) {
          const label = getArticleLabel(currentArticle)
          chunks.push(label + currentChunk.slice(0, sentenceEnd + 1).trim())
          currentChunk = currentChunk.slice(sentenceEnd + 2)
        }
      }
    }
  }

  // Save last chunk
  if (currentChunk.trim().length > 100) {
    const label = getArticleLabel(currentArticle)
    chunks.push(label + currentChunk.trim())
  }

  // Fallback if smart chunking produces too few chunks
  if (chunks.length < 5) {
    console.log('Smart chunking produced too few chunks, using fallback...')
    const fallback: string[] = []
    const words = cleaned.split(' ')
    let current = ''

    for (const word of words) {
      current += word + ' '
      if (current.length > 2000) {
        if (current.trim().length > 100) fallback.push(current.trim())
        current = ''
      }
    }
    if (current.trim().length > 100) fallback.push(current.trim())
    return fallback
  }

  return chunks.filter(chunk => 
    chunk.trim().length > 100 && 
    chunk.replace(/\./g, '').trim().length > 50
  )
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

    // Step 1: Download file from Supabase Storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('rulebook')
      .download(fileName)

    if (downloadError || !fileData) {
      throw new Error(`Failed to download file: ${downloadError?.message}`)
    }

    // Step 2: Extract text
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

    // Step 3: Smart chunking with article detection
    const chunks = smartChunk(text)
    console.log(`Created ${chunks.length} chunks`)

    if (chunks.length === 0) {
      return NextResponse.json(
        { error: 'Could not extract any content from file.' },
        { status: 400 }
      )
    }

    // Step 4: If replacing a file, delete its old chunks first
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

    // Step 5: Delete existing chunks for this file
    await supabase
      .from('rulebook_chunks')
      .delete()
      .eq('discipline', discipline)
      .eq('source_file', originalName)

    // Step 6: Generate embeddings in batches of 20
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

    // Step 7: Save file record
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