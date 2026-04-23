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

    const { data: userSub } = await supabase
      .from('user_subscriptions')
      .select('plan')
      .eq('user_email', userEmail)
      .single()

    const plan = userSub?.plan || 'lite'

    const { data: meetPass } = await supabase
      .from('event_usage')
      .select('question_count, questions_today, last_question_date')
      .eq('user_email', userEmail)
      .eq('event_id', eventId)
      .single()

    // LITE: 5 questions total per event (lifetime)
    if (plan === 'lite') {
      const questionCount = meetPass?.question_count || 0
      if (questionCount >= 5) {
        return NextResponse.json(
          {
            error: 'event_limit_reached',
            message: `You've reached your 5 free questions for this event. ✨ Upgrade to PRO for 50 questions/day, or ELITE for unlimited questions + all 7 disciplines + priority support.`,
            upgradeUrl: '/pricing'
          },
          { status: 429 }
        )
      }
    }

    // PRO: 50 questions per day per event
    const today = new Date().toISOString().split('T')[0]
    let questionsToday = 0

    if (plan === 'pro') {
      const lastDate = meetPass?.last_question_date
      questionsToday = (lastDate === today) ? (meetPass?.questions_today || 0) : 0

      if (questionsToday >= 50) {
        return NextResponse.json(
          {
            error: 'event_limit_reached',
            message: `You've reached today's 50-question limit for this event. Resets tomorrow. ✨ ELITE members get unlimited event questions + all 7 disciplines + priority support for just RM39.99/month.`,
            upgradeUrl: '/pricing'
          },
          { status: 429 }
        )
      }
    }

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

    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: englishQuestion
    })
    const queryEmbedding = embeddingResponse.data[0].embedding

    // Vector search - increased to 30
    const { data: vectorChunks } = await supabase.rpc(
      'match_event_chunks',
      {
        query_embedding: queryEmbedding,
        match_event_id: eventId,
        match_count: 30
      }
    )

    const words = englishQuestion.split(' ').filter((w: string) => w.length > 2)

    // Keyword search per word - increased limit
    let keywordChunks: { content: string }[] = []
    for (const word of words.slice(0, 10)) {
      const { data } = await supabase
        .from('event_chunks')
        .select('content')
        .eq('event_id', eventId)
        .ilike('content', `%${word}%`)
        .limit(15)
      if (data) keywordChunks = [...keywordChunks, ...data]
    }

    // Full name pair search - increased limit
    if (words.length >= 2) {
      for (let i = 0; i < words.length - 1; i++) {
        const namePair = `${words[i]} ${words[i + 1]}`
        const { data } = await supabase
          .from('event_chunks')
          .select('content')
          .eq('event_id', eventId)
          .ilike('content', `%${namePair}%`)
          .limit(15)
        if (data) keywordChunks = [...keywordChunks, ...data]
      }
    }

    // Also search for just the last name alone for better coverage
    if (words.length >= 2) {
      const lastName = words[words.length - 1]
      const { data } = await supabase
        .from('event_chunks')
        .select('content')
        .eq('event_id', eventId)
        .ilike('content', `%${lastName}%`)
        .limit(20)
      if (data) keywordChunks = [...keywordChunks, ...data]
    }

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

    // Increased context to 50 chunks
    const context = allChunks.slice(0, 50)
      .map((c: { content: string }) => c.content)
      .join('\n\n---\n\n')

    const systemPrompt = `You are an AI assistant for the "${eventName}" aquatics event. You help officials, coaches, swimmers and parents find information about this specific event.

Your knowledge comes ONLY from the event documents uploaded for this event — such as start lists, heat sheets, schedules, technical packages, and official notices.

YOUR APPROACH:
1. Answer based strictly on the event documents provided
2. When asked about a swimmer, search ALL provided content for EVERY occurrence of that swimmer's name — list ALL events found
3. Always reply in the same language the user writes in
4. End every answer with: "For official decisions, always refer to the Meet Referee or Event Director."

ANSWER FORMAT FOR SWIMMER/HEAT QUERIES:
Use this EXACT format — no tables, no deviations:

**[Swimmer Full Name]** — [X] event(s) found:

🏊 **Event [number] — [Full Event Name]**
- Heat: [heat number] of [total heats]
- Lane: [lane number]
- Team: [team name]
- Seed Time: [seed time]

Repeat the block above for EVERY event found for that swimmer.
NEVER use tables for swimmer queries.
NEVER combine multiple pieces of info on one line.
Each detail MUST be on its own bullet point line.

ANSWER FORMAT FOR SCHEDULE QUERIES:
Use a clean numbered list:
1. **[Time]** — Event [number]: [Event Name] ([Session])

ANSWER FORMAT FOR GENERAL QUERIES:
Use clear paragraphs with **bold headers** and bullet points.

NON-EVENT QUESTIONS:
Respond with: "I can only answer questions about ${eventName}. For World Aquatics rules questions, please use the main AquaRef rules assistant."`

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{
        role: 'user',
        content: `Here is the event information:\n\n${context}\n\nQuestion (answer in the same language as this question): ${question}`
      }]
    })

    const answer = message.content[0].type === 'text'
      ? message.content[0].text
      : 'Unable to generate answer'

    // Update usage tracking
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

    if (plan === 'pro') {
      const newQuestionsToday = questionsToday + 1
      if (meetPass) {
        await supabase
          .from('event_usage')
          .update({
            questions_today: newQuestionsToday,
            last_question_date: today,
            question_count: (meetPass.question_count || 0) + 1
          })
          .eq('user_email', userEmail)
          .eq('event_id', eventId)
      } else {
        await supabase
          .from('event_usage')
          .insert({
            user_email: userEmail,
            event_id: eventId,
            question_count: 1,
            questions_today: 1,
            last_question_date: today
          })
      }
    }

    // Calculate remaining questions
    let remainingQuestions = null
    if (plan === 'lite') {
      const newCount = (meetPass?.question_count || 0) + 1
      remainingQuestions = Math.max(0, 5 - newCount)
    } else if (plan === 'pro') {
      remainingQuestions = Math.max(0, 50 - (questionsToday + 1))
    }

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