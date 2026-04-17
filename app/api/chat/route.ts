import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'
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

    // Step 1: Get system prompt from database
    const { data: promptData } = await supabase
      .from('system_prompts')
      .select('prompt')
      .eq('discipline', 'all')
      .single()

    const systemPrompt = promptData?.prompt || 'You are a World Aquatics Rules Assistant. Answer only from the rulebook provided. Always cite rule numbers. End with: "For official decisions, always defer to your Meet Referee."'

    // Step 2: Translate question to English for better search
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

    // Step 3: Embed the English version for better search
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: englishQuestion
    })
    const queryEmbedding = embeddingResponse.data[0].embedding

    // Step 4: Vector similarity search
    const { data: vectorChunks } = await supabase.rpc(
      'match_rulebook_chunks',
      {
        query_embedding: queryEmbedding,
        match_discipline: discipline,
        match_count: 10
      }
    )

    // Step 5: Keyword search using English question
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

    // Step 6: Get relevant correction notes
    const { data: corrections } = await supabase
      .from('correction_notes')
      .select('question, correct_note')
      .eq('discipline', discipline)

    // Find corrections relevant to this question
    const relevantCorrections = (corrections || []).filter(c =>
      keywords.some(keyword =>
        c.question.toLowerCase().includes(keyword) ||
        c.correct_note.toLowerCase().includes(keyword)
      )
    )

    // Step 7: Combine and deduplicate chunks
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

    // Step 8: Add correction notes to context if any
    const correctionsContext = relevantCorrections.length > 0
      ? `\n\nADMIN CORRECTION NOTES (these override rulebook interpretation if relevant):\n${relevantCorrections.map(c => `Q: ${c.question}\nCorrection: ${c.correct_note}`).join('\n\n')}`
      : ''

    // Step 9: Ask Claude
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1500,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Here is the relevant rulebook content:\n\n${context}${correctionsContext}\n\nQuestion (answer in the same language as this question): ${question}`
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
      answer,
      created_at: new Date().toISOString()
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