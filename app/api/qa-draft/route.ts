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

// Auto-generate URL slug from a question.
// Keeps the most distinctive words; pads with discipline if too generic.
function generateSlug(question: string, discipline: string): string {
  // Stopwords to remove for slug brevity
  const stopwords = new Set([
    'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been',
    'do', 'does', 'did', 'have', 'has', 'had', 'can', 'could',
    'will', 'would', 'should', 'may', 'might', 'my', 'your',
    'this', 'that', 'these', 'those', 'in', 'on', 'at', 'to',
    'for', 'of', 'and', 'or', 'but', 'with', 'from'
  ])

  // Question words to strip from the start
  const questionWords = /^(what|why|how|when|where|who|which|is|are|can|do|does|will|should)\s+/i

  const cleaned = question
    .toLowerCase()
    .replace(questionWords, '')           // remove leading "what/why/how"
    .replace(/['"?!,.;:()]/g, '')         // strip punctuation
    .split(/\s+/)
    .filter(w => w.length > 0 && !stopwords.has(w))  // drop stopwords
    .join('-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  // If somehow empty (all stopwords), fall back to first 5 words of original
  if (!cleaned) {
    return question.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .slice(0, 5)
      .join('-')
      .slice(0, 60) || 'untitled-question'
  }

  // Cap at 60 chars on a clean word boundary
  if (cleaned.length <= 60) return cleaned
  const truncated = cleaned.slice(0, 60)
  const lastDash = truncated.lastIndexOf('-')
  return lastDash > 30 ? truncated.slice(0, lastDash) : truncated
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

Below are excerpts from the official World Aquatics 2026 Competition Regulations for ${publicDiscipline.replace('-', ' ')}:

---
${context}
---

The question to answer is: "${question}"

YOUR JOB: Synthesize the rulebook excerpts above into a helpful answer for parents, coaches, and officials. Be helpful, not perfectionist.

If the question is BROAD (e.g. "Why was my swimmer DQ'd in breaststroke?"), list the most common 3-5 reasons drawn from the excerpts, citing each one's article. This is the MOST helpful kind of answer.

If the question is SPECIFIC (e.g. "What is the 15-meter rule?"), give a focused answer with one main citation.

Generate a Q&A in this EXACT JSON format (no markdown, no preamble, just the JSON object):

{
  "canonical_question": "The cleaned-up question, ending with a question mark",
  "answer_short": "1-2 sentence direct answer above-the-fold. 30-250 characters.",
  "answer_full": "Detailed 200-400 word answer. For broad questions, structure as: brief intro paragraph, then bullet-style list of reasons with each citation inline, then closing recommendation. For specific questions, 2-3 flowing paragraphs. Cite articles inline (e.g. 'Per Article 7.7...'). Separate paragraphs with two newlines (\\n\\n).",
  "rule_citation": "The most relevant rule article. Use the format you see in the excerpts: 'World Aquatics Article 7.7'. If multiple apply, pick the most central one for the short answer.",
  "rule_quote": "1-2 sentences quoted exactly from the rulebook excerpts.",
  "meta_description": "60-155 character SEO description. Plain text, no quotes."
}

RULES:
- Use ONLY information from the rulebook excerpts above. Do NOT invent rules or article numbers.
- The 2026 regulations use "Article N.N" format. Look for "[STROKE - Article X.X]" tags or "Article N.N" patterns in the excerpts.
- Write in clear, plain English a parent or coach can understand.
- ONLY return "INSUFFICIENT_RULEBOOK_DATA" if the excerpts contain ZERO information related to the question. If you can answer with even partial information from the excerpts, do so — partial helpful answers are better than refusing.
- Return ONLY valid JSON. No code fences, no commentary, no preamble.`

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
    const slug = generateSlug(parsed.canonical_question, publicDiscipline)

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