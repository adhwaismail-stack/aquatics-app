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
    .replace(/\f/g, '\n')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\.{4,}/g, ' ')
    .replace(/_{4,}/g, ' ')
    .replace(/[ \t]{2,}/g, ' ')
    .trim()
}

// Smart chunker that preserves event + heat + swimmer context
function smartChunkStartList(text: string): string[] {
  const lines = cleanText(text).split('\n').map(l => l.trim()).filter(l => l.length > 0)
  const chunks: string[] = []

  let currentEvent = ''
  let currentHeat = ''
  let heatSwimmers: string[] = []

  const isEventHeader = (line: string) => /^Event\s+\d+/i.test(line)
  const isHeatHeader = (line: string) => /^Heat\s+\d+/i.test(line) || /\(#\d+/i.test(line)
  const isSwimmerLine = (line: string) => {
    // Lane number followed by name pattern
    return /^\d+\s+[A-Z][a-zA-Z]/.test(line) && line.length > 10
  }

  const flushHeat = () => {
    if (currentEvent && heatSwimmers.length > 0) {
      const chunk = `${currentEvent}\n${currentHeat}\n${heatSwimmers.join('\n')}`
      chunks.push(chunk)
    }
    heatSwimmers = []
  }

  for (const line of lines) {
    if (isEventHeader(line)) {
      flushHeat()
      currentEvent = line
      currentHeat = ''
    } else if (isHeatHeader(line)) {
      flushHeat()
      currentHeat = line
    } else if (isSwimmerLine(line) && currentEvent) {
      heatSwimmers.push(line)
    }
  }
  flushHeat()

  // If smart chunking produced few results, fall back to regular chunking
  if (chunks.length < 5) {
    return regularChunkText(text)
  }

  return chunks
}

function regularChunkText(text: string): string[] {
  const cleaned = cleanText(text)
  const chunks: string[] = []
  const chunkSize = 600
  const overlap = 150

  for (let i = 0; i < cleaned.length; i += chunkSize - overlap) {
    const chunk = cleaned.slice(i, i + chunkSize).trim()
    if (chunk.length > 50) chunks.push(chunk)
  }
  return chunks
}

function chunkText(text: string, isStartList: boolean = false): string[] {
  if (isStartList) {
    return smartChunkStartList(text)
  }
  return regularChunkText(text)
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
const { text: extractedText, totalPages } = await extractText(uint8Array, { mergePages: false })
// extractedText is array of pages when mergePages is false
if (Array.isArray(extractedText)) {
  text = (extractedText as string[]).join('\n\n')
} else {
  text = extractedText as string
}
    }

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: 'Could not extract text from file.' }, { status: 400 })
    }

    // Detect if this is a start list / heat sheet
    const isStartList = /Event\s+\d+/i.test(text) && /Heat\s+\d+/i.test(text)

    const chunks = chunkText(text, isStartList)

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
      textChunks: chunks.length,
      visualChunks: 0,
      smartChunked: isStartList
    })

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Event upload error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}