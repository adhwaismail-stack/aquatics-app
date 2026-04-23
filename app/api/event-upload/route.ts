import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

export const runtime = 'nodejs'
export const maxDuration = 120

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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

function chunkText(text: string): string[] {
  const cleaned = cleanText(text)
  const chunks: string[] = []
  const chunkSize = 600
  const overlap = 150

  for (let i = 0; i < cleaned.length; i += chunkSize - overlap) {
    const chunk = cleaned.slice(i, i + chunkSize).trim()
    if (chunk.length > 50) {
      chunks.push(chunk)
    }
  }
  return chunks
}

async function extractTextFromDOCX(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    const mammoth = await import('mammoth')
    const result = await mammoth.extractRawText({ buffer: Buffer.from(arrayBuffer) })
    return result.value || ''
  } catch (err) {
    console.error('DOCX extraction failed:', err)
    return ''
  }
}

async function extractTextFromXLSX(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    const XLSX = await import('xlsx')
    const workbook = XLSX.read(Buffer.from(arrayBuffer), { type: 'buffer' })
    const textParts: string[] = []
    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName]
      const csv = XLSX.utils.sheet_to_csv(sheet)
      if (csv.trim().length > 0) {
        textParts.push(`[Sheet: ${sheetName}]\n${csv}`)
      }
    }
    return textParts.join('\n\n')
  } catch (err) {
    console.error('XLSX extraction failed:', err)
    return ''
  }
}

async function extractTextFromPPTX(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    const officeParser = await import('officeparser')
    const os = await import('os')
    const fs = await import('fs')
    const path = await import('path')
    const tempPath = path.join(os.tmpdir(), `temp_${Date.now()}.pptx`)
    fs.writeFileSync(tempPath, Buffer.from(arrayBuffer))
    try {
      const text = await (officeParser as any).parseOfficeAsync(tempPath)
      return text || ''
    } finally {
      fs.unlinkSync(tempPath)
    }
  } catch (err) {
    console.error('PPTX extraction failed:', err)
    return ''
  }
}

async function extractSwimmersFromPDF(arrayBuffer: ArrayBuffer, eventName: string): Promise<string[]> {
  try {
    const fileSizeMB = arrayBuffer.byteLength / (1024 * 1024)
    if (fileSizeMB > 20) {
      console.log(`PDF too large for vision (${fileSizeMB.toFixed(1)}MB), skipping`)
      return []
    }

    // Convert ArrayBuffer to base64 safely in Node.js
    const base64PDF = Buffer.from(arrayBuffer).toString('base64')

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
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
            },
            {
              type: 'text',
              text: `You are extracting swimmer entries from a start list / heat sheet for the "${eventName}" aquatics event.

Go through EVERY page and EVERY event. Extract EVERY swimmer entry you find.

For each swimmer, output EXACTLY this format on its own line:
[SWIMMER] Name: FULL_NAME | Event: EVENT_NO EVENT_NAME | Heat: HEAT_NO of TOTAL | Lane: LANE_NO | Team: TEAM | Seed: SEED_TIME

Example:
[SWIMMER] Name: Noma Horiuchi | Event: 101 Women 100 LC Meter Freestyle | Heat: 7 of 12 | Lane: 4 | Team: SEL | Seed: 1:02.48
[SWIMMER] Name: Noma Horiuchi | Event: 105 Women 100 LC Meter Backstroke | Heat: 6 of 8 | Lane: 5 | Team: SEL | Seed: 1:07.82

Rules:
- Include ALL swimmers from ALL events
- Each swimmer entry on its own line
- If swimmer is in multiple events, output one line per event
- Do not skip any swimmer

If no swimmer data: NO_SWIMMER_DATA`
            }
          ]
        }]
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Vision API error:', response.status, errorText)
      return []
    }

    const data = await response.json()
    const text = data.content?.[0]?.text?.trim() || ''

    if (!text || text.includes('NO_SWIMMER_DATA')) return []

    const swimmers = text
      .split('\n')
      .map((v: string) => v.trim())
      .filter((v: string) => v.startsWith('[SWIMMER]') && v.length > 20)

    console.log(`Vision RAG extracted ${swimmers.length} swimmer entries`)
    return swimmers

  } catch (err) {
    console.error('Vision extraction failed:', err)
    return []
  }
}

export async function POST(request: NextRequest) {
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })
    const { fileName, eventId, originalName } = await request.json()

    if (!fileName || !eventId) {
      return NextResponse.json({ error: 'fileName and eventId are required' }, { status: 400 })
    }

    const { data: fileData, error: downloadError } = await supabase.storage
      .from('events')
      .download(fileName)

    if (downloadError || !fileData) {
      throw new Error(`Failed to download file: ${downloadError?.message}`)
    }

    const arrayBuffer = await fileData.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)

    const isDocx = originalName.endsWith('.docx')
    const isXlsx = originalName.endsWith('.xlsx')
    const isPptx = originalName.endsWith('.pptx')
    const isTxt = originalName.endsWith('.txt')
    const isPdf = originalName.endsWith('.pdf')

    let text = ''

    if (isTxt) {
      text = Buffer.from(arrayBuffer).toString('utf-8')
    } else if (isDocx) {
      text = await extractTextFromDOCX(arrayBuffer)
    } else if (isXlsx) {
      text = await extractTextFromXLSX(arrayBuffer)
    } else if (isPptx) {
      text = await extractTextFromPPTX(arrayBuffer)
    } else {
      const { extractText } = await import('unpdf')
      const { text: extractedText } = await extractText(uint8Array, { mergePages: true })
      text = extractedText
    }

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: 'Could not extract text from file.' }, { status: 400 })
    }

    const { data: eventData } = await supabase
      .from('events')
      .select('name')
      .eq('id', eventId)
      .single()

    const eventName = eventData?.name || 'Aquatics Event'

    const textChunks = chunkText(text)
    let visualChunks: string[] = []

    if (isPdf) {
      visualChunks = await extractSwimmersFromPDF(arrayBuffer, eventName)
    }

    const chunks = [...textChunks, ...visualChunks]

    if (chunks.length === 0) {
      return NextResponse.json({ error: 'Could not extract any content from file.' }, { status: 400 })
    }

    await supabase
      .from('event_chunks')
      .delete()
      .eq('event_id', eventId)
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
        event_id: eventId,
        content,
        chunk_index: i + j,
        source_file: originalName,
        embedding: embeddingResponse.data[j].embedding
      }))

      const { error } = await supabase.from('event_chunks').insert(rows)
      if (error) throw error

      totalSaved += batch.length
    }

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${chunks.length} chunks`,
      chunks: chunks.length,
      textChunks: textChunks.length,
      visualChunks: visualChunks.length
    })

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Event upload error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}