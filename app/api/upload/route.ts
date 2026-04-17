import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!
    })

    const formData = await request.formData()
    const file = formData.get('file') as File
    const discipline = formData.get('discipline') as string

    if (!file || !discipline) {
      return NextResponse.json(
        { error: 'File and discipline are required' },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    let text = ''
    if (file.name.endsWith('.txt')) {
      text = buffer.toString('utf-8')
    } else {
      const { extractText } = await import('unpdf')
      const uint8Array = new Uint8Array(bytes)
      const { text: extractedText } = await extractText(uint8Array, { mergePages: true })
      text = extractedText
    }

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Could not extract text from file. Please ensure it is a text-based PDF.' },
        { status: 400 }
      )
    }

    // Split into chunks
    const chunkSize = 1000
    const overlap = 200
    const chunks: string[] = []
    for (let i = 0; i < text.length; i += chunkSize - overlap) {
      const chunk = text.slice(i, i + chunkSize)
      if (chunk.trim().length > 50) {
        chunks.push(chunk.trim())
      }
    }

    // Delete old chunks for this discipline
    await supabase
      .from('rulebook_chunks')
      .delete()
      .eq('discipline', discipline)

    // Generate embeddings in batches of 20 and save
    const batchSize = 20
    let totalSaved = 0

    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize)

      // Generate embeddings for this batch
      const embeddingResponse = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: batch
      })

      // Build rows with embeddings
      const rows = batch.map((content, j) => ({
        discipline,
        content,
        chunk_index: i + j,
        source_file: file.name,
        embedding: embeddingResponse.data[j].embedding
      }))

      // Save to Supabase
      const { error } = await supabase
        .from('rulebook_chunks')
        .insert(rows)

      if (error) {
        console.error('Insert error:', error)
        throw error
      }

      totalSaved += batch.length
      console.log(`Saved ${totalSaved}/${chunks.length} chunks...`)
    }

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${chunks.length} chunks from ${file.name} with embeddings`,
      chunks: chunks.length,
      discipline
    })

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Upload error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}