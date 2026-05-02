import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'

// Service role client (bypasses RLS for backend operations)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Translate hyphenated public slug to internal RAG slug
const SLUG_MAP: Record<string, string> = {
  'swimming': 'swimming',
  'water-polo': 'waterpolo',
  'open-water': 'openwater',
  'artistic-swimming': 'artistic',
  'diving': 'diving',
  'high-diving': 'highdiving',
  'masters-swimming': 'masters',
  'para-swimming': 'paraswimming',
}

// Auto-generate URL slug from a question
function generateSlug(question: string): string {
  return question
    .toLowerCase()
    .replace(/['"?!,.;:()]/g, '')
    .replace(/\s+/g, '-')
    .replace(/^(what|why|how|is|can|do|does|are)-/, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60)
    .replace(/-[^-]*$/, (match) => match.length > 1 ? '' : match) // trim partial last word
    || question.toLowerCase().replace(/\s+/g, '-').slice(0, 60)
}

export async function POST(request: NextRequest) {
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

    const { qa_page_id } = await request.json()

    if (!qa_page_id) {
      return NextResponse.json({ error: 'qa_page_id is required' }, { status: 400 })
    }

    // Step 1: Fetch the qa_pages row
    const { data: qaPage, error: fetchError } = await supabase
      .from('qa_pages')
      .select('id, discipline, canonical_question, status')
      .eq('id', qa_page_id)
      .single()

    if (fetchError || !qaPage) {
      return NextResponse.json({ error: 'Q&A page not found' }, { status: 404 })
    }

    if (qaPage.status === 'published') {
      return NextResponse.json(
        { error: 'Cannot regenerate a published Q&A. Archive it first or edit manually.' },
        { status: 400 }
      )
    }

    const question = qaPage.canonical_question
    const publicDiscipline = qaPage.discipline // e.g. "water-polo"
    const ragDiscipline = SLUG_MAP[publicDiscipline] // e.g. "waterpolo"

    if (!ragDiscipline) {
      return NextResponse.json(
        { error: `Unknown discipline: ${publicDiscipline}` },
        { status: 400 }
      )
    }

    // Step 2: Embed the question
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: question
    })
    const queryEmbedding = embeddingResponse.data[0].embedding

    // Step 3: Vector search (matches your existing pattern)
    const { data: vectorChunks } = await supabase.rpc('match_rulebook_chunks', {
      query_embedding: queryEmbedding,
      match_discipline: ragDiscipline,
      match_count: 10
    })

    // Step 4: Keyword search
    const keywords = question.toLowerCase()
      .split(' ')
      .filter((w: string) => w.length > 3)
      .slice(0, 5)

    let keywordChunks: { content: string }[] = []
    for (const keyword of keywords) {
      const { data } = await supabase
        .from('rulebook_chunks')
        .select('content')
        .eq('discipline', ragDiscipline)
        .ilike('content', `%${keyword}%`)
        .limit(3)
      if (data) keywordChunks = [...keywordChunks, ...data]
    }

    // Step 5: Combine and deduplicate
    const seen = new Set<string>()
    const allChunks: { content: string }[] = []
    for (const chunk of [...(vectorChunks || []), ...keywordChunks]) {
      if (!seen.has(chunk.content)) {
        seen.add(chunk.content)
        allChunks.push(chunk)
      }
    }

    if (allChunks.length === 0) {
      return NextResponse.json(
        { error: `No rulebook content found for ${publicDiscipline}. Upload a rulebook PDF first.` },
        { status: 404 }
      )
    }

    const context = allChunks.slice(0, 15).map((c) => c.content).join('\n\n---\n\n')

    // Step 6: Build a structured drafting prompt
    const draftingPrompt = `You are drafting a public Q&A page for AquaRef.co about ${publicDiscipline.replace('-', ' ')}.

Below are excerpts from the official World Aquatics rulebook for ${publicDiscipline.replace('-', ' ')}:

---
${context}
---

The question to answer is: "${question}"

Generate a Q&A in this EXACT JSON format (no markdown, no preamble, just the JSON object):

{
  "canonical_question": "The cleaned-up question, ending with a question mark",
  "answer_short": "1-2 sentence direct answer that satisfies the question above-the-fold. 30-200 characters.",
  "answer_full": "Detailed 200-400 word answer in 2-3 paragraphs. Plain English. Cite specific rule articles inline (e.g. 'Per SW 7.1...'). Separate paragraphs with two newlines (\\n\\n).",
  "rule_citation": "The most relevant rule article reference, e.g. 'World Aquatics SW 7.1' or 'World Aquatics WP 21.10'. Just the citation, nothing else.",
  "rule_quote": "The most relevant 1-2 sentences from the rulebook excerpts above, quoted exactly.",
  "meta_description": "60-155 character SEO description summarizing the answer. Plain text, no quotes."
}

CRITICAL RULES:
- Only use information from the rulebook excerpts provided above. Do NOT invent rules.
- If the rulebook does not contain enough information to answer accurately, set "answer_short" to "INSUFFICIENT_RULEBOOK_DATA" and leave other fields empty strings.
- Cite SPECIFIC rule article numbers (e.g. "SW 7.1", "WP 21.10"), not vague references.
- Write in clear, plain English a parent or coach can understand.
- Return ONLY valid JSON. No code fences, no commentary.`

    // Step 7: Call Claude
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2000,
      messages: [{ role: 'user', content: draftingPrompt }]
    })

    const responseText = message.content[0].type === 'text'
      ? message.content[0].text.trim()
      : ''

    // Step 8: Parse the JSON response
    let parsed: {
      canonical_question: string
      answer_short: string
      answer_full: string
      rule_citation: string
      rule_quote: string
      meta_description: string
    }

    try {
      // Strip code fences if Claude added any despite instructions
      const cleaned = responseText.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim()
      parsed = JSON.parse(cleaned)
    } catch {
      return NextResponse.json(
        { error: 'AI returned invalid JSON. Try again.', raw: responseText.slice(0, 500) },
        { status: 500 }
      )
    }

    // Step 9: Detect insufficient data
    if (parsed.answer_short === 'INSUFFICIENT_RULEBOOK_DATA') {
      return NextResponse.json(
        { error: 'The rulebook does not contain enough information to answer this question. Skip or edit manually.' },
        { status: 422 }
      )
    }

    // Step 10: Generate slug
    const slug = generateSlug(parsed.canonical_question)

    // Step 11: Save back to qa_pages
    const { error: updateError } = await supabase
      .from('qa_pages')
      .update({
        canonical_question: parsed.canonical_question,
        answer_short: parsed.answer_short,
        answer_full: parsed.answer_full,
        rule_citation: parsed.rule_citation,
        rule_quote: parsed.rule_quote,
        meta_description: parsed.meta_description,
        slug,
        ai_drafted_at: new Date().toISOString(),
        last_updated_at: new Date().toISOString(),
      })
      .eq('id', qa_page_id)

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to save draft: ' + updateError.message },
        { status: 500 }
      )
    }

    // Return the drafted content
    return NextResponse.json({
      success: true,
      qa_page_id,
      draft: {
        ...parsed,
        slug,
      },
      tokens: {
        input: message.usage.input_tokens,
        output: message.usage.output_tokens,
      }
    })

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('QA draft error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}