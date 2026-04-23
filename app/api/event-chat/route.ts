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
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

    const { question, eventId, eventName, userEmail } = await request.json()

    if (!question || !eventId) {
      return NextResponse.json(
        { error: 'Question and eventId are required' },
        { status: 400 }
      )
    }

    // Get user subscription
    const { data: userSub } = await supabase
      .from('user_subscriptions')
      .select('plan')
      .eq('user_email', userEmail)
      .single()

    const plan = userSub?.plan || 'lite'

    // Check Meet Pass access
    const { data: meetPass } = await supabase
      .from('event_usage')
      .select('question_count')
      .eq('user_email', userEmail)
      .eq('event_id', eventId)
      .single()

    // LITE plan: 3 questions per event limit
    if (plan === 'lite') {
      const questionCount = meetPass?.question_count || 0
      if (questionCount >= 3) {
        return NextResponse.json(
          {
            error: 'event_limit_reached',
            message: `You've used all 3 free questions for this event. Upgrade to PRO or ELITE for unlimited event questions!`,
            upgradeUrl: '/pricing'
          },
          { status: 429 }
        )
      }
    }

    // Translate question to English for better search
    const translationResponse = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 200,
      messages: [{
        role: 'user',
        content: `Translate this question to English. Return ONLY the English translation, nothing else: "${question}"`
      }]
    })

    const englishQuestion = translationResponse.content[0].type === 'text'
      ? translationResponse.content[0].text.trim()
      : question

    // Embed question for vector search
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: englishQuestion
    })
    const queryEmbedding = embeddingResponse.data[0].embedding

    // Vector search in event chunks
    const { data: vectorChunks } = await supabase.rpc(
      'match_event_chunks',
      {
        query_embedding: queryEmbedding,
        match_event_id: eventId,
        match_count: 10
      }
    )

    // Keyword search
    const keywords = englishQuestion.toLowerCase()
      .split(' ')
      .filter((w: string) => w.length > 3)
      .slice(0, 5)

    let keywordChunks: { content: string }[] = []
    for (const keyword of keywords) {
      const { data } = await supabase
        .from('event_chunks')
        .select('content')
        .eq('event_id', eventId)
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

    if (allChunks.length === 0) {
      return NextResponse.json(
        { error: 'No event documents found. Please contact the event organiser.' },
        { status: 404 }
      )
    }

    const context = allChunks.slice(0, 15)
      .map((c: { content: string }) => c.content)
      .join('\n\n---\n\n')

    // Build system prompt
    const systemPrompt = `You are an AI assistant for the "${eventName}" aquatics event. You help officials, coaches, swimmers and parents find information about this specific event.

Your knowledge comes ONLY from the event documents uploaded for this event — such as start lists, heat sheets, schedules, technical packages, and official notices.

YOUR APPROACH:
1. Answer questions based strictly on the event documents provided
2. Be specific — cite heat numbers, lane numbers, times, names when available
3. If information is not in the documents, say so honestly
4. Always reply in the same language the user writes in
5. End every answer with: "For official decisions, always refer to the Meet Referee or Event Director."

NON-EVENT QUESTIONS:
For questions unrelated to this event, respond with: "I can only answer questions about ${eventName}. For World Aquatics rules questions, please use the main AquaRef rules assistant."`

    // Ask Claude
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1500,
      system: systemPrompt,
      messages: [{
        role: 'user',
        content: `Here is the event information:\n\n${context}\n\nQuestion (answer in the same language as this question): ${question}`
      }]
    })

    const answer = message.content[0].type === 'text'
      ? message.content[0].text
      : 'Unable to generate answer'

    // Update event usage for LITE
    if (plan === 'lite') {
      if (meetPass) {
        await supabase
          .from('event_usage')
          .update({ question_count: (meetPass.question_count || 0) + 1 })
          .eq('user_email', userEmail)
          .eq('event_id', eventId)
      } else {
        await supabase
          .from('event_usage')
          .insert({ user_email: userEmail, event_id: eventId, question_count: 1 })
      }
    }

    // Calculate remaining for LITE
    const newCount = (meetPass?.question_count || 0) + 1
    const remainingQuestions = plan === 'lite' ? Math.max(0, 3 - newCount) : null

    return NextResponse.json({
      answer,
      remainingQuestions,
      plan
    })

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Event chat error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}