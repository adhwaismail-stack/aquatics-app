import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const SYSTEM_PROMPT = `You are an expert World Aquatics Rules Assistant, helping Technical Officials, coaches, swimmers and parents understand competition rules.

YOUR APPROACH:
1. First, find and cite the relevant rule(s) from the rulebook provided to you.
2. Then explain what the rule means in practical terms — how it applies in real competition situations.
3. If the rulebook does not explicitly state something, you may reason from related rules and explain your reasoning clearly, marking it as "Interpretation" not as a stated rule.
4. Never invent rule numbers. Only cite rule numbers that actually appear in the provided rulebook content.
5. If a topic is completely absent from the rulebook, say so honestly and suggest consulting the Meet Referee.
6. Always reply in the same language the user writes in. If the user writes in Malay, you MUST reply in Malaysian Malay (Bahasa Malaysia) — NOT Indonesian. Malaysian Malay uses words like "sukan" not "olahraga", "perlawanan" not "pertandingan", "atlet" is acceptable but use "peserta" where possible, "wasit" not "hakim", "peraturan" not "aturan", "mestilah" not "harus".ways reply in the same language the user writes in. If the user writes in Malay, reply in Malaysian Malay (not Indonesian).
7. End every answer with: "For official decisions, always defer to your Meet Referee."

ANSWER FORMAT:
- Start with the direct answer
- Quote or reference the specific rule number(s)
- Explain practical implications
- Add interpretation or context where helpful
- End with the disclaimer

You are knowledgeable, helpful and precise. Your goal is to help people truly understand the rules, not just quote them.`

export async function POST(request: NextRequest) {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!
    })

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!
    })

    const { question, discipline, userEmail } = await request.json()

    if (!question || !discipline) {
      return NextResponse.json(
        { error: 'Question and discipline are required' },
        { status: 400 }
      )
    }

    // Check daily usage limit
    const today = new Date().toISOString().split('T')[0]
    const { data: usage } = await supabase
      .from('daily_usage')
      .select('count')
      .eq('user_email', userEmail)
      .eq('date', today)
      .single()

    if (usage && usage.count >= 50) {
      return NextResponse.json(
        { error: 'Daily limit reached. Your 50 questions per day limit resets at midnight.' },
        { status: 429 }
      )
    }

    // Step 1: Translate question to English for better search
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

    // Step 2: Embed the English version for better search
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: englishQuestion
    })
    const queryEmbedding = embeddingResponse.data[0].embedding

    // Step 3: Vector similarity search
    const { data: vectorChunks } = await supabase.rpc(
      'match_rulebook_chunks',
      {
        query_embedding: queryEmbedding,
        match_discipline: discipline,
        match_count: 10
      }
    )

    // Step 4: Keyword search using English question
    const keywords = englishQuestion.toLowerCase()
      .split(' ')
      .filter((w: string) => w.length > 3)
      .slice(0, 5)

    let keywordChunks: { content: string }[] = []
    for (const keyword of keywords) {
      const { data } = await supabase
        .from('rulebook_chunks')
        .select('content')
        .eq('discipline', discipline)
        .ilike('content', `%${keyword}%`)
        .limit(3)

      if (data) keywordChunks = [...keywordChunks, ...data]
    }

    // Step 5: Combine and deduplicate
    const seen = new Set()
    const allChunks: { content: string }[] = []

    for (const chunk of [...(vectorChunks || []), ...keywordChunks]) {
      if (!seen.has(chunk.content)) {
        seen.add(chunk.content)
        allChunks.push(chunk)
      }
    }

    if (allChunks.length === 0) {
      return NextResponse.json(
        { error: 'No rulebook found for this discipline. Please contact admin.' },
        { status: 404 }
      )
    }

    // Limit to 15 chunks
    const finalChunks = allChunks.slice(0, 15)
    const context = finalChunks.map((c: { content: string }) => c.content).join('\n\n---\n\n')

    // Step 6: Ask Claude — pass original question so it replies in user's language
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Here is the relevant rulebook content:\n\n${context}\n\nQuestion (answer in the same language as this question): ${question}`
        }
      ]
    })

    const answer = message.content[0].type === 'text'
      ? message.content[0].text
      : 'Unable to generate answer'

    // Save to chat logs
    await supabase.from('chat_logs').insert({
      user_email: userEmail,
      discipline,
      question,
      answer
    })

    // Update daily usage
    await supabase.rpc('increment_usage', {
      p_email: userEmail,
      p_date: today
    })

    return NextResponse.json({ answer })

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Chat error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}