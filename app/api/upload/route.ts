import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

export const runtime = 'nodejs'
export const maxDuration = 60

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Smart chunking — splits by article numbers
function smartChunk(text: string): string[] {
  const cleaned = text
    .replace(/\s+/g, ' ')
    .replace(/\.{4,}/g, '')
    .trim()

  const articlePattern = /(?=(?:SW\s+)?\d+\.\d+(?:\.\d+)?\s+[A-Z])/g
  const parts = cleaned.split(articlePattern)

  const chunks: string[] = []

  for (const part of parts) {
    const trimmed = part.trim()
    if (
      trimmed.length < 100 ||
      trimmed.replace(/\./g, '').trim().length < 50
    ) continue

    if (trimmed.length <= 3000) {
      chunks.push(trimmed)
    } else {
      const sentences = trimmed.match(/[^.!?]+[.!?]+/g) || [trimmed]
      let current = ''
      for (const sentence of sentences) {
        if ((current + sentence).length > 3000) {
          if (current.trim().length > 100) chunks.push(current.trim())
          current = sentence
        } else {
          current += ' ' + sentence
        }
      }
      if (current.trim().length > 100) chunks.push(current.trim())
    }
  }

  if (chunks.length < 5) {
    const chunkSize = 2000
    const overlap = 400
    const fallback: string[] = []
    for (let i = 0; i < cleaned.length; i += chunkSize - overlap) {
      const chunk = cleaned.slice(i, i + chunkSize).trim()
      if (chunk.length > 100) fallback.push(chunk)
    }
    return fallback
  }

  return chunks
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

    // Step 3: Smart chunking
    const chunks = smartChunk(text)

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

    // Step 5: Generate embeddings in batches of 20
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
    }

    // Step 6: Save file record
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