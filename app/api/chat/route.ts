import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const SYSTEM_PROMPT = `You are an AI assistant for World Aquatics Technical Officials.

STRICT RULES — follow these without exception:
1. You may ONLY answer using the rulebook documents provided to you.
2. You must NEVER use your general training knowledge about swimming.
3. You must NEVER search or reference the internet.
4. You must NEVER guess or infer a rule not explicitly stated.
5. If the answer is not found in the rulebook, say exactly: "This is not covered in the current rulebook. Please refer to your Meet Referee or the official World Aquatics Technical Committee."
6. Always cite the rule number (e.g. SW 4.4) in every answer when available.
7. Always reply in the same language the user writes in.
8. End every answer with: "For official decisions, always defer to your Meet Referee."

You are helping Technical Officials, coaches and parents understand World Aquatics rules accurately.`

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

    // Step 1: Embed the user's question
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: question
    })
    const queryEmbedding = embeddingResponse.data[0].embedding

    // Step 2: Vector similarity search
    const { data: vectorChunks } = await supabase.rpc(
      'match_rulebook_chunks',
      {
        query_embedding: queryEmbedding,
        match_discipline: discipline,
        match_count: 10
      }
    )

    // Step 3: Keyword search as backup
    const keywords = question.toLowerCase()
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

    // Step 4: Combine and deduplicate both results
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

    // Limit to 15 chunks maximum
    const finalChunks = allChunks.slice(0, 15)

    // Step 5: Build context
    const context = finalChunks.map((c: { content: string }) => c.content).join('\n\n---\n\n')

    // Step 6: Ask Claude
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Here is the relevant rulebook content:\n\n${context}\n\nQuestion: ${question}`
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