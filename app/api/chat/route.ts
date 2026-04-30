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

    // Get user subscription to check plan
    const { data: userSub } = await supabase
      .from('user_subscriptions')
      .select('plan, created_at')
      .eq('user_email', userEmail)
      .single()

    const plan = userSub?.plan || 'lite'

    // ── LITE plan: 5 questions per month ──
    if (plan === 'lite') {
      const accountCreated = new Date(userSub?.created_at || new Date())
      const now = new Date()
      const daysSinceCreation = Math.floor((now.getTime() - accountCreated.getTime()) / (1000 * 60 * 60 * 24))
      const cycleDay = daysSinceCreation % 30
      const cycleStart = new Date(now)
      cycleStart.setDate(cycleStart.getDate() - cycleDay)
      cycleStart.setHours(0, 0, 0, 0)

      const { data: monthlyLogs } = await supabase
        .from('chat_logs')
        .select('id', { count: 'exact' })
        .eq('user_email', userEmail)
        .gte('created_at', cycleStart.toISOString())

      const monthlyCount = monthlyLogs?.length || 0

      const resetDate = new Date(cycleStart)
      resetDate.setDate(resetDate.getDate() + 30)
      const resetDateStr = resetDate.toLocaleDateString('en-MY', { day: 'numeric', month: 'long', year: 'numeric' })
      const daysUntilReset = Math.ceil((resetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

if (monthlyCount >= 10) {
        return NextResponse.json(
          {
            error: `monthly_limit_reached`,
            message: `You've used all 10 free questions this month. Your quota resets in ${daysUntilReset} day${daysUntilReset !== 1 ? 's' : ''} on ${resetDateStr}. Upgrade to PRO for 50 questions per day!`,
            resetDate: resetDateStr,
            daysUntilReset,
            upgradeUrl: '/pricing'
          },
          { status: 429 }
        )
      }
    }

    // ── PRO / ELITE / legacy plans: daily limit ──
    if (plan !== 'lite') {
      const today = new Date().toISOString().split('T')[0]
      const { data: usage } = await supabase
        .from('daily_usage')
        .select('count')
        .eq('user_email', userEmail)
        .eq('date', today)
        .single()

      const dailyLimit = plan === 'elite' ? 99999 : plan === 'all_disciplines' ? 200 : 50

      if (usage && usage.count >= dailyLimit) {
        return NextResponse.json(
          { error: `Daily limit reached. Your ${dailyLimit} questions per day limit resets at midnight.` },
          { status: 429 }
        )
      }
    }

    // Step 1: Get base prompt (all disciplines)
    const { data: basePromptData } = await supabase
      .from('system_prompts')
      .select('prompt')
      .eq('discipline', 'all')
      .single()

    const basePrompt = basePromptData?.prompt || 'You are a World Aquatics Rules Assistant. Answer only from the World Aquatics Regulations provided. Always cite rule numbers. End with: "For official decisions, always defer to your Meet Referee."'

    // Step 2: Get discipline-specific prompt (if exists)
    const { data: disciplinePromptData } = await supabase
      .from('system_prompts')
      .select('prompt')
      .eq('discipline', discipline)
      .single()

    const disciplinePrompt = disciplinePromptData?.prompt || ''

    // Step 3: Combine base + discipline prompt
    const systemPrompt = disciplinePrompt
      ? `${basePrompt}\n\n--- ${discipline.toUpperCase()} SPECIFIC INSTRUCTIONS ---\n${disciplinePrompt}`
      : basePrompt

    // Step 4: Translate question to English for better search
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

    // Step 5: Embed the English version for better search
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: englishQuestion
    })
    const queryEmbedding = embeddingResponse.data[0].embedding

    // Step 6: Vector similarity search
    const { data: vectorChunks } = await supabase.rpc(
      'match_rulebook_chunks',
      {
        query_embedding: queryEmbedding,
        match_discipline: discipline,
        match_count: 10
      }
    )

    // Step 7: Keyword search using English question
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

    // Step 8: Get relevant correction notes
    const { data: corrections } = await supabase
      .from('correction_notes')
      .select('question, correct_note')
      .eq('discipline', discipline)

    const relevantCorrections = (corrections || []).filter(c =>
      keywords.some((keyword: string) =>
        c.question.toLowerCase().includes(keyword) ||
        c.correct_note.toLowerCase().includes(keyword)
      )
    )

    // Step 9: Combine and deduplicate chunks
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
        { error: 'No World Aquatics Regulations found for this discipline. Please contact admin.' },
        { status: 404 }
      )
    }

    const finalChunks = allChunks.slice(0, 15)
    const context = finalChunks.map((c: { content: string }) => c.content).join('\n\n---\n\n')

    const correctionsContext = relevantCorrections.length > 0
      ? `\n\nADDITIONAL VERIFIED INFORMATION (use this to supplement your answer, do not mention this label to the user):\n${relevantCorrections.map(c => `${c.correct_note}`).join('\n\n')}`
      : ''

    // Step 10: Ask Claude with combined system prompt
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1500,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Here is the relevant World Aquatics Regulations content:\n\n${context}${correctionsContext}\n\nQuestion (answer in the same language as this question): ${question}`
        }
      ]
    })

    const answer = message.content[0].type === 'text'
      ? message.content[0].text
      : 'Unable to generate answer'

    const inputTokens = message.usage.input_tokens
    const outputTokens = message.usage.output_tokens
    const translationInputTokens = translationResponse.usage.input_tokens
    const translationOutputTokens = translationResponse.usage.output_tokens
    const totalInputTokens = inputTokens + translationInputTokens
    const totalOutputTokens = outputTokens + translationOutputTokens

    await supabase.from('chat_logs').insert({
      user_email: userEmail,
      discipline,
      question,
      answer,
      input_tokens: totalInputTokens,
      output_tokens: totalOutputTokens,
      created_at: new Date().toISOString()
    })

    if (plan !== 'lite') {
      const today = new Date().toISOString().split('T')[0]
      await supabase.rpc('increment_usage', {
        p_email: userEmail,
        p_date: today
      })
    }

    if (plan === 'lite') {
      const accountCreated = new Date(userSub?.created_at || new Date())
      const now = new Date()
      const daysSinceCreation = Math.floor((now.getTime() - accountCreated.getTime()) / (1000 * 60 * 60 * 24))
      const cycleDay = daysSinceCreation % 30
      const cycleStart = new Date(now)
      cycleStart.setDate(cycleStart.getDate() - cycleDay)
      cycleStart.setHours(0, 0, 0, 0)

      const { data: monthlyLogs } = await supabase
        .from('chat_logs')
        .select('id')
        .eq('user_email', userEmail)
        .gte('created_at', cycleStart.toISOString())

      const remainingQuestions = Math.max(0, 5 - (monthlyLogs?.length || 0))

      const resetDate = new Date(cycleStart)
      resetDate.setDate(resetDate.getDate() + 30)
      const daysUntilReset = Math.ceil((resetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

      return NextResponse.json({
        answer,
        remainingQuestions,
        daysUntilReset,
        resetDate: resetDate.toLocaleDateString('en-MY', { day: 'numeric', month: 'long', year: 'numeric' }),
        isLastQuestion: remainingQuestions === 0
      })
    }

    return NextResponse.json({ answer })

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Chat error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}