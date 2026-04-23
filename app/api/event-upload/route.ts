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

function smartChunkStartList(text: string): string[] {
  const lines = cleanText(text).split('\n').map(l => l.trim()).filter(l => l.length > 0)
  const chunks: string[] = []
  let currentEvent = ''
  let currentHeat = ''
  let heatSwimmers: string[] = []

  const isEventHeader = (line: string) => /^Event\s+\d+/i.test(line)
  const isHeatHeader = (line: string) => /^Heat\s+\d+/i.test(line) || /\(#\d+/i.test(line)
  const isSwimmerLine = (line: string) => /^\d+\s+[A-Z][a-zA-Z]/.test(line) && line.length > 10

  const flushHeat = () => {
    if (currentEvent && heatSwimmers.length > 0) {
      chunks.push(`${currentEvent}\n${currentHeat}\n${heatSwimmers.join('\n')}`)
    }
    heatSwimmers = []
  }

  for (const line of lines) {
    if (isEventHeader(line)) { flushHeat(); currentEvent = line; currentHeat = '' }
    else if (isHeatHeader(line)) { flushHeat(); currentHeat = line }
    else if (isSwimmerLine(line) && currentEvent) { heatSwimmers.push(line) }
  }
  flushHeat()

  if (chunks.length < 5) return regularChunkText(text)
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
  if (isStartList) return smartChunkStartList(text)
  return regularChunkText(text)
}

async function extractTextFromDOCX(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    const mammoth = await import('mammoth')
    const result = await mammoth.extractRawText({ buffer: Buffer.from(arrayBuffer) })
    return result.value || ''
  } catch (err) { console.error('DOCX extraction failed:', err); return '' }
}

async function extractTextFromXLSX(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    const XLSX = await import('xlsx')
    const workbook = XLSX.read(Buffer.from(arrayBuffer), { type: 'buffer' })
    const textParts: string[] = []
    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName]
      const csv = XLSX.utils.sheet_to_csv(sheet)
      if (csv.trim().length > 0) textParts.push(`[Sheet: ${sheetName}]\n${csv}`)
    }
    return textParts.join('\n\n')
  } catch (err) { console.error('XLSX extraction failed:', err); return '' }
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
    } finally { fs.unlinkSync(tempPath) }
  } catch (err) { console.error('PPTX extraction failed:', err); return '' }
}

// Extract swimmers page by page for complete coverage
async function extractSwimmersPageByPage(uint8Array: Uint8Array, eventName: string): Promise<string[]> {
  try {
    const { getDocumentProxy } = await import('unpdf')
    const pdf = await getDocumentProxy(uint8Array)
    const totalPages = pdf.numPages
    console.log(`Vision RAG: processing ${totalPages} pages...`)

    const allSwimmers: string[] = []

    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      try {
        // Extract text for this single page
        const page = await pdf.getPage(pageNum)
        const textContent = await page.getTextContent()
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ')

        if (!pageText.trim()) continue

        // Ask Claude to extract swimmers from this page's text
        const res = await fetch('https://api.anthropic.com/v1/messages', {
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
              content: `Extract ALL swimmer entries from this swimming start list page for "${eventName}".

Page text:
${pageText}

For each swimmer output EXACTLY this format on its own line:
[SWIMMER] Name: FULL_NAME | Event: EVENT_NO EVENT_NAME | Heat: HEAT_NO of TOTAL | Lane: LANE_NO | Team: TEAM | Seed: SEED_TIME

Rules:
- Extract every swimmer you can find
- Use the event number and name shown on this page
- If a heat continues from a previous page, use the event/heat context from this page
- Output ONLY [SWIMMER] lines, nothing else
- If no swimmers found, output: NO_SWIMMERS`
            }]
          })
        })

        if (!res.ok) {
          console.error(`Vision RAG page ${pageNum} HTTP error:`, res.status)
          continue
        }

        const data = await res.json()
        const text = data?.content?.[0]?.text?.trim() || ''

        if (!text || text.includes('NO_SWIMMERS')) continue

        const pageSwimmers = text
          .split('\n')
          .map((v: string) => v.trim())
          .filter((v: string) => v.startsWith('[SWIMMER]') && v.length > 20)

        console.log(`Page ${pageNum}: extracted ${pageSwimmers.length} swimmers`)
        allSwimmers.push(...pageSwimmers)

      } catch (pageErr) {
        console.error(`Error processing page ${pageNum}:`, pageErr)
        continue
      }
    }

    console.log(`Total Vision RAG swimmers extracted: ${allSwimmers.length}`)
    return allSwimmers

  } catch (err) {
    console.error('Page-by-page extraction failed:', err)
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
      text = Buffer.from(uint8Array).toString('utf-8')
    } else if (isDocx) {
      text = await extractTextFromDOCX(arrayBuffer)
    } else if (isXlsx) {
      text = await extractTextFromXLSX(arrayBuffer)
    } else if (isPptx) {
      text = await extractTextFromPPTX(arrayBuffer)
    } else {
      const { extractText } = await import('unpdf')
      const result = await extractText(uint8Array, { mergePages: false })
      const extracted = result.text
      if (Array.isArray(extracted)) {
        text = (extracted as string[]).join('\n')
      } else {
        text = extracted as string
      }
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
    const isStartList = /Event\s+\d+/i.test(text) && /Heat\s+\d+/i.test(text)
    const textChunks = chunkText(text, isStartList)

    // Process page by page for complete swimmer coverage
    let visualChunks: string[] = []
    if (isPdf && isStartList) {
      visualChunks = await extractSwimmersPageByPage(uint8Array, eventName)
    } else if (isPdf) {
      // For non-start-list PDFs, use whole-document vision
      const base64PDF = Buffer.from(uint8Array).toString('base64')
      const res = await fetch('https://api.anthropic.com/v1/messages', {
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
              { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: base64PDF } },
              { type: 'text', text: `Extract key information from this event document for "${eventName}". Summarize schedules, officials, venues, and important notices as clear bullet points. If no useful info: NO_CONTENT` }
            ]
          }]
        })
      })
      if (res.ok) {
        const data = await res.json()
        const content = data?.content?.[0]?.text?.trim() || ''
        if (content && !content.includes('NO_CONTENT')) {
          visualChunks = [content]
        }
      }
    }

    const allChunks = [...textChunks, ...visualChunks]

    if (allChunks.length === 0) {
      return NextResponse.json({ error: 'Could not extract any content from file.' }, { status: 400 })
    }

    await supabase
      .from('event_chunks')
      .delete()
      .eq('event_id', eventId)
      .eq('source_file', originalName)

    const batchSize = 20
    let totalSaved = 0

    for (let i = 0; i < allChunks.length; i += batchSize) {
      const batch = allChunks.slice(i, i + batchSize)
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
      message: `Successfully processed ${allChunks.length} chunks`,
      chunks: allChunks.length,
      textChunks: textChunks.length,
      visualChunks: visualChunks.length,
      smartChunked: isStartList
    })

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Event upload error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}