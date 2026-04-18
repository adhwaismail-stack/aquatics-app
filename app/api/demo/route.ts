import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!
})

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
})

const DEMO_LIMIT = 2

const SYSTEM_PROMPT = `You are an expert World Aquatics Rules Assistant, helping Technical Officials, coaches, swimmers and parents understand competition rules.

YOUR APPROACH:
1. First, find and cite the relevant rule(s) from the World Aquatics Regulations provided to you.
2. Then explain what the rule means in practical terms.
3. If the regulations do not explicitly state something, you may reason from related rules and explain your reasoning clearly, marking it as "Interpretation".
4. Never invent rule numbers. Only cite rule numbers that actually appear in the provided content.
5. Always reply in the same language the user writes in.
6. End every answer with: "For official decisions, always defer to your Meet Referee."

You are knowledgeable, helpful and precise.`

export async function POST(request: NextRequest) {
  try {
    // Get user IP address
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown'

    const { question } = await request.json()

    if (!question) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      )
    }

    // Check demo usage for this IP
    const { data: usage } = await supabase
      .from('demo_usage')
      .select('question_count')
      .eq('ip_address', ip)
      .single()

    const currentCount = usage?.question_count || 0

    if (currentCount >= DEMO_LIMIT) {
      return NextResponse.json(
        { limitReached: true },
        { status: 200 }
      )
    }

    // Translate question to English for better search
    const translationResponse = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 200,
      messages: [
        {
          role: 'user',
          content: `Translate this question to English. Return ONLY the English translation, nothing else: "${question}"`
        }
      ]
    })

    const englishQuestion = translationResponse.content[0].type === 'text'
      ? translationResponse.content[0].text.trim()
      : question

    // Embed the question
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: englishQuestion
    })
    const queryEmbedding = embeddingResponse.data[0].embedding

    // Vector search — Swimming only for demo
    const { data: vectorChunks } = await supabase.rpc(
      'match_rulebook_chunks',
      {
        query_embedding: queryEmbedding,
        match_discipline: 'swimming',
        match_count: 8
      }
    )

    // Keyword search backup
    const keywords = englishQuestion.toLowerCase()
      .split(' ')
      .filter((w: string) => w.length > 3)
      .slice(0, 5)

    let keywordChunks: { content: string }[] = []
    for (const keyword of keywords) {
      const { data } = await supabase
        .from('rulebook_chunks')
        .select('content')
        .eq('discipline', 'swimming')
        .ilike('content', `%${keyword}%`)
        .limit(3)
      if (data) keywordChunks = [...keywordChunks, ...data]
    }

    // Combine and deduplicate
    const seen = new Set()
    const allChunks: { content: string }[] = []
    for (const chunk of [...(vectorChunks || []), ...keywordChunks]) {
      if (!seen.has(chunk.content)) {
        seen.add(chunk.content)
        allChunks.push(chunk)
      }
    }

    const context = allChunks.slice(0, 10).map((c: { content: string }) => c.content).join('\n\n---\n\n')

    // Get answer from Claude
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 800,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Here is the relevant World Aquatics Swimming Regulations content:\n\n${context}\n\nQuestion (answer in the same language): ${question}`
        }
      ]
    })

    const answer = message.content[0].type === 'text'
      ? message.content[0].text
      : 'Unable to generate answer'

    // Update demo usage count
    await supabase
      .from('demo_usage')
      .upsert({
        ip_address: ip,
        question_count: currentCount + 1,
        updated_at: new Date().toISOString()
      }, { onConflict: 'ip_address' })

    const remainingQuestions = DEMO_LIMIT - (currentCount + 1)

    return NextResponse.json({
      answer,
      questionsUsed: currentCount + 1,
      questionsRemaining: remainingQuestions,
      limitReached: remainingQuestions <= 0
    })

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Demo error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}