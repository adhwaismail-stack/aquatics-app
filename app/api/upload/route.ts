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

// ─────────────────────────────────────────────────────────────
// SECTION-AWARE CHUNKING (replaces hardcoded ARTICLE_HEADERS)
// ─────────────────────────────────────────────────────────────

interface TOCEntry {
  number: number
  title: string
}

/**
 * Parses the table of contents from PDF text.
 * Looks for patterns like "5 FREESTYLE 60" — section number, title in CAPS, page number.
 */
function parseTOC(text: string): TOCEntry[] {
  const tocRegex = /(\d+)\s+([A-Z][A-Z\s,\-]+[A-Z])\s+\d{2,3}(?=\s+\d|\s+[A-Z])/g
  const entries: TOCEntry[] = []
  let match
  while ((match = tocRegex.exec(text)) !== null) {
    const num = parseInt(match[1])
    const title = match[2].trim()
    if (num > 0 && num < 100 && title.length > 3 && title.length < 80) {
      // Avoid duplicate entries (TOC is sometimes printed twice)
      if (!entries.find((e) => e.number === num && e.title === title)) {
        entries.push({ number: num, title })
      }
    }
  }
  return entries
}

/**
 * Finds all body-level section headers (not TOC entries) and their positions.
 * Returns sorted list of [position, section] tuples.
 */
function findSectionPositions(
  fullText: string,
  toc: TOCEntry[]
): Array<{ position: number; section: TOCEntry }> {
  const results: Array<{ position: number; section: TOCEntry }> = []
  for (const entry of toc) {
    const escapedTitle = entry.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const headerPattern = new RegExp(
      `(^|\\n)${entry.number}\\s+${escapedTitle}(?:\\s|\\n)`,
      'g'
    )
    let match
    while ((match = headerPattern.exec(fullText)) !== null) {
      // Skip TOC entries (followed by a 2-3 digit page number)
      const after = fullText.slice(
        match.index + match[0].length,
        match.index + match[0].length + 6
      )
      if (/^\d{2,3}\s/.test(after)) continue
      results.push({ position: match.index, section: entry })
    }
  }
  return results.sort((a, b) => a.position - b.position)
}

/**
 * Given a position in text and a sorted list of section positions,
 * returns the section that contains that position.
 */
function getSectionAt(
  position: number,
  sectionPositions: Array<{ position: number; section: TOCEntry }>
): TOCEntry | null {
  let current: TOCEntry | null = null
  for (const sp of sectionPositions) {
    if (sp.position <= position) {
      current = sp.section
    } else {
      break
    }
  }
  return current
}

function getArticleLabel(articleNum: string, section: TOCEntry | null): string {
  if (section) {
    return `[${section.title} - Article ${articleNum}] `
  }
  return `[Article ${articleNum}] `
}

function removeTOC(text: string): string {
  // Strip lines that look like TOC entries (lots of dots, ending in page number)
  const lines = text.split('\n')
  const filtered = lines.filter((line) => {
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

/**
 * Section-aware chunker. Walks through the text, splits by article patterns,
 * and labels each chunk with its CURRENT SECTION (not a hardcoded guess).
 */
function smartChunk(text: string): string[] {
  // Step 1: Parse TOC from raw text BEFORE cleaning
  const toc = parseTOC(text)
  console.log(`Detected ${toc.length} TOC entries`)
  if (toc.length > 0) {
    console.log('First 5 sections:', toc.slice(0, 5).map((e) => `${e.number}=${e.title}`).join(', '))
  }

  // Step 2: Clean the text
  const noTOC = removeTOC(text)
  const cleaned = cleanText(noTOC)

  // Step 3: Find body section positions (in cleaned text)
  const sectionPositions = findSectionPositions(cleaned, toc)
  console.log(`Found ${sectionPositions.length} section header occurrences in body`)

  // Step 4: Split text by article patterns
  const chunks: string[] = []
  const articlePattern = /(?=(?:SW\s+|WP\s+|AS\s+|DV\s+|HD\s+|MS\s+)?(\d+)\.(\d+)(?:\.(\d+))?\s+[A-Z][a-z])/g

  // Track positions of each split point so we can determine section per chunk
  const splitPositions: number[] = []
  let m
  while ((m = articlePattern.exec(cleaned)) !== null) {
    splitPositions.push(m.index)
  }

  // Walk through split points, extract chunk content + determine section
  for (let i = 0; i < splitPositions.length; i++) {
    const start = splitPositions[i]
    const end = i + 1 < splitPositions.length ? splitPositions[i + 1] : cleaned.length
    const part = cleaned.slice(start, end).trim()
    if (part.length < 50) continue

    const numMatch = part.match(/^(?:SW\s+|WP\s+|AS\s+|DV\s+|HD\s+|MS\s+)?(\d+\.\d+(?:\.\d+)?)/)
    const articleNum = numMatch ? numMatch[1] : ''
    const section = getSectionAt(start, sectionPositions)
    const label = articleNum ? getArticleLabel(articleNum, section) : ''
    const normalized = part.replace(/\n\n/g, ' | ').replace(/\n/g, ' ').trim()

    if (normalized.length <= 3000) {
      if (normalized.length > 100) {
        chunks.push(label + normalized)
      }
    } else {
      // Split overlong chunks at sentence boundaries
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

  // Fallback: if article splitting failed, use size-based chunks
  if (chunks.length < 10) {
    console.log(`Only got ${chunks.length} chunks from article split, using size-based fallback`)
    const fallback: string[] = []
    const chunkSize = 1500
    const overlap = 300
    for (let i = 0; i < cleaned.length; i += chunkSize - overlap) {
      const chunk = cleaned.slice(i, i + chunkSize).trim()
      if (chunk.length > 100) {
        // Even fallback chunks get section labels
        const section = getSectionAt(i, sectionPositions)
        const label = section ? `[${section.title}] ` : ''
        fallback.push(label + chunk)
      }
    }
    return fallback
  }

  return chunks.filter((c) => c.trim().length > 100)
}

// ─────────────────────────────────────────────────────────────
// FILE EXTRACTION (unchanged from original)
// ─────────────────────────────────────────────────────────────

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

async function extractVisualDescriptions(
  arrayBuffer: ArrayBuffer,
  discipline: string
): Promise<string[]> {
  try {
    const fileSizeBytes = arrayBuffer.byteLength
    const fileSizeMB = fileSizeBytes / (1024 * 1024)

    if (fileSizeMB > 20) {
      console.log(`PDF too large for vision (${fileSizeMB.toFixed(1)}MB), skipping visual extraction`)
      return []
    }

    console.log(`Running vision extraction on ${fileSizeMB.toFixed(1)}MB PDF...`)

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!,
    })

    const base64PDF = Buffer.from(arrayBuffer).toString('base64')

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'document',
              source: {
                type: 'base64',
                media_type: 'application/pdf',
                data: base64PDF,
              },
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
- Do not describe text paragraphs, only visual elements`,
            },
          ],
        },
      ],
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
      .map((v) => v.trim())
      .filter((v) => v.startsWith('[VISUAL:') && v.length > 50)

    console.log(`Found ${visuals.length} visual descriptions`)
    return visuals
  } catch (err) {
    console.error('Vision extraction failed (non-fatal):', err)
    return []
  }
}

// ─────────────────────────────────────────────────────────────
// MAIN HANDLER
// ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
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

    const isDocx = originalName.endsWith('.docx')
    const isXlsx = originalName.endsWith('.xlsx')
    const isPptx = originalName.endsWith('.pptx')
    const isTxt = originalName.endsWith('.txt')
    const isPdf = originalName.endsWith('.pdf')

    let text = ''

    if (isTxt) {
      text = Buffer.from(arrayBuffer).toString('utf-8')
    } else if (isDocx) {
      console.log('Extracting text from DOCX...')
      text = await extractTextFromDOCX(arrayBuffer)
    } else if (isXlsx) {
      console.log('Extracting text from XLSX...')
      text = await extractTextFromXLSX(arrayBuffer)
    } else if (isPptx) {
      console.log('Extracting text from PPTX...')
      text = await extractTextFromPPTX(arrayBuffer)
    } else {
      const { extractText } = await import('unpdf')
      const { text: extractedText } = await extractText(uint8Array, { mergePages: true })
      text = extractedText
    }

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: 'Could not extract text from file.' }, { status: 400 })
    }

    console.log(`Extracted ${text.length} characters from ${originalName}`)

    const textChunks = smartChunk(text)
    console.log(`Created ${textChunks.length} text chunks`)

    if (textChunks.length === 0) {
      return NextResponse.json({ error: 'Could not extract any content from file.' }, { status: 400 })
    }

    let visualChunks: string[] = []
    if (isPdf) {
      visualChunks = await extractVisualDescriptions(arrayBuffer, discipline)
    }

    const chunks = [...textChunks, ...visualChunks]
    console.log(
      `Total chunks: ${chunks.length} (${textChunks.length} text + ${visualChunks.length} visual)`
    )

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

      await supabase.from('rulebook_files').delete().eq('id', replaceFileId)
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
        input: batch,
      })

      const rows = batch.map((content, j) => ({
        discipline,
        content,
        chunk_index: i + j,
        source_file: originalName,
        embedding: embeddingResponse.data[j].embedding,
      }))

      const { error } = await supabase.from('rulebook_chunks').insert(rows)

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
        chunk_count: chunks.length,
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
      fileId: fileRecord?.id,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Upload error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}