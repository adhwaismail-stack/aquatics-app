'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { use } from 'react'
import ReactMarkdown from 'react-markdown'

const disciplineNames: { [key: string]: string } = {
  swimming: 'Swimming',
  waterpolo: 'Water Polo',
  artistic: 'Artistic Swimming',
  diving: 'Diving',
  highdiving: 'High Diving',
  masters: 'Masters',
  openwater: 'Open Water'
}

const disciplineCodes: { [key: string]: string } = {
  swimming: 'SW Rules',
  waterpolo: 'WP Rules',
  artistic: 'AS Rules',
  diving: 'DV Rules',
  highdiving: 'HD Rules',
  masters: 'MS Rules',
  openwater: 'OW Rules'
}

interface Message {
  role: 'user' | 'assistant'
  content: string
  feedback?: 'like' | 'dislike' | null
}

export default function ChatPage({ params }: { params: Promise<{ discipline: string }> }) {
  const { discipline } = use(params)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<{ email?: string } | null>(null)
  const [usage, setUsage] = useState(0)
  const [dailyLimit, setDailyLimit] = useState(50)
  const [plan, setPlan] = useState<string>('lite')
  const [monthlyRemaining, setMonthlyRemaining] = useState<number>(5)
  const [resetDate, setResetDate] = useState<string>('')
  const [daysUntilReset, setDaysUntilReset] = useState<number>(30)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = '/login'
        return
      }
      setUser(user)

      const { data: sub } = await supabase
        .from('user_subscriptions')
        .select('plan, created_at')
        .eq('user_email', user.email)
        .single()

      const userPlan = sub?.plan || 'lite'
      setPlan(userPlan)

      if (userPlan === 'lite') {
        // Calculate monthly usage for LITE
        const accountCreated = new Date(sub?.created_at || new Date())
        const now = new Date()
        const daysSinceCreation = Math.floor((now.getTime() - accountCreated.getTime()) / (1000 * 60 * 60 * 24))
        const cycleDay = daysSinceCreation % 30
        const cycleStart = new Date(now)
        cycleStart.setDate(cycleStart.getDate() - cycleDay)
        cycleStart.setHours(0, 0, 0, 0)

        const { data: monthlyLogs } = await supabase
          .from('chat_logs')
          .select('id')
          .eq('user_email', user.email)
          .gte('created_at', cycleStart.toISOString())

        const used = monthlyLogs?.length || 0
        setMonthlyRemaining(Math.max(0, 5 - used))

        const resetDateObj = new Date(cycleStart)
        resetDateObj.setDate(resetDateObj.getDate() + 30)
        setResetDate(resetDateObj.toLocaleDateString('en-MY', { day: 'numeric', month: 'long', year: 'numeric' }))
        setDaysUntilReset(Math.ceil((resetDateObj.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
        setDailyLimit(5)
        setUsage(used)
      } else {
        // Daily limit for PRO/ELITE
        if (userPlan === 'elite') setDailyLimit(99999)
        else if (userPlan === 'all_disciplines') setDailyLimit(200)
        else setDailyLimit(50)

        const today = new Date().toISOString().split('T')[0]
        const { data: usageData } = await supabase
          .from('daily_usage')
          .select('count')
          .eq('user_email', user.email)
          .eq('date', today)
          .single()

        if (usageData) setUsage(usageData.count)
      }
    }
    getUser()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleFeedback = async (index: number, feedback: 'like' | 'dislike') => {
    const message = messages[index]
    const question = messages[index - 1]?.content || ''

    setMessages(prev => prev.map((msg, i) =>
      i === index ? { ...msg, feedback } : msg
    ))

    await supabase.from('answer_feedback').insert({
      user_email: user?.email,
      discipline,
      question,
      answer: message.content,
      feedback
    })
  }

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const question = input.trim()
    setInput('')
    setLoading(true)

    const newMessages: Message[] = [
      ...messages,
      { role: 'user', content: question }
    ]
    setMessages(newMessages)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          discipline,
          userEmail: user?.email
        })
      })

      const data = await response.json()

      if (response.status === 429) {
        if (data.error === 'monthly_limit_reached') {
          setMonthlyRemaining(0)
          setMessages([...newMessages, {
            role: 'assistant',
            content: `⚠️ ${data.message}`,
            feedback: null
          }])
        } else {
          setMessages([...newMessages, {
            role: 'assistant',
            content: '⚠️ ' + data.error,
            feedback: null
          }])
        }
      } else if (data.error) {
        setMessages([...newMessages, {
          role: 'assistant',
          content: '❌ ' + data.error,
          feedback: null
        }])
      } else {
        setMessages([...newMessages, {
          role: 'assistant',
          content: data.answer,
          feedback: null
        }])
        setUsage(prev => prev + 1)

        // Update LITE remaining count
        if (plan === 'lite' && data.remainingQuestions !== undefined) {
          setMonthlyRemaining(data.remainingQuestions)
          if (data.isLastQuestion) {
            // Show last question warning
            setTimeout(() => {
              setMessages(prev => [...prev, {
                role: 'assistant',
                content: `⚠️ You've just used your last free question for this month. Your quota resets in ${data.daysUntilReset} day${data.daysUntilReset !== 1 ? 's' : ''} on ${data.resetDate}. [Upgrade to PRO](/pricing) for 50 questions per day!`,
                feedback: null
              }])
            }, 500)
          }
        }
      }
    } catch {
      setMessages([...newMessages, {
        role: 'assistant',
        content: '❌ Something went wrong. Please try again.',
        feedback: null
      }])
    }

    setLoading(false)
  }

  const getIcon = () => {
    const icons: { [key: string]: string } = {
      swimming: '🏊', waterpolo: '🤽', artistic: '💃',
      diving: '🤿', highdiving: '🏔️', masters: '🏅', openwater: '🌊'
    }
    return icons[discipline] || '🏊'
  }

  const getSampleQuestions = () => {
    const questions: { [key: string]: string[] } = {
      swimming: ['What is the false start rule?', 'What are the breaststroke turn rules?', 'Can a swimmer false start twice?'],
      waterpolo: ['What are the referee duties?', 'How long is each period?', 'What constitutes a foul?'],
      openwater: ['What is the minimum water temperature for Open Water?', 'Can swimmers wear wetsuits in Open Water?', 'What are the feeding rules in Open Water?'],
      artistic: ['How is artistic swimming scored?', 'What are the routine time limits?', 'What are the deck work rules?'],
      diving: ['How are dives scored?', 'What is the degree of difficulty?', 'What are the springboard height rules?'],
      highdiving: ['What are the platform height requirements?', 'How are high dives scored?', 'What safety rules apply?'],
      masters: ['What are the age group categories?', 'How are masters records set?', 'What are the eligibility rules?']
    }
    return questions[discipline] || questions.swimming
  }

  const isLimitReached = plan === 'lite' ? monthlyRemaining <= 0 : usage >= dailyLimit

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex-shrink-0">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/dashboard" className="text-gray-400 hover:text-gray-600 text-sm">← Back</a>
            <div className="w-px h-4 bg-gray-200"></div>
            <div>
              <h1 className="font-semibold text-gray-900">{disciplineNames[discipline] || discipline}</h1>
              <p className="text-xs text-gray-400">{disciplineCodes[discipline]}</p>
            </div>
          </div>

          {/* Question meter — hide for ELITE */}
          {plan !== 'elite' && (
            <div className="flex items-center gap-3">
              {plan === 'lite' ? (
                <div className="text-right">
                  <div className="text-xs text-gray-400">This month</div>
                  <div className="text-sm font-medium text-gray-700">
                    {monthlyRemaining} of 5 left
                  </div>
                  {resetDate && (
                    <div className="text-xs text-gray-400">Resets {daysUntilReset}d</div>
                  )}
                </div>
              ) : (
                <div className="text-right">
                  <div className="text-xs text-gray-400">Today</div>
                  <div className="text-sm font-medium text-gray-700">{usage}/{dailyLimit} questions</div>
                </div>
              )}
              <div className="w-16 bg-gray-100 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{
                    width: plan === 'lite'
                      ? `${Math.min(((5 - monthlyRemaining) / 5) * 100, 100)}%`
                      : `${Math.min((usage / dailyLimit) * 100, 100)}%`
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* LITE limit warning banner */}
      {plan === 'lite' && monthlyRemaining <= 1 && monthlyRemaining > 0 && (
        <div className="bg-orange-50 border-b border-orange-100 px-6 py-2">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-xs text-orange-700">
              ⚠️ <strong>{monthlyRemaining} question left</strong> this month. Resets on {resetDate}.{' '}
              <a href="/pricing" className="underline font-medium">Upgrade to PRO</a> for 50/day.
            </p>
          </div>
        </div>
      )}

      {/* LITE limit reached banner */}
      {plan === 'lite' && monthlyRemaining <= 0 && (
        <div className="bg-red-50 border-b border-red-100 px-6 py-3">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-sm font-medium text-red-800 mb-1">
              You've used all 5 free questions this month
            </p>
            <p className="text-xs text-red-600 mb-2">
              Resets in {daysUntilReset} days on {resetDate}
            </p>
            <a href="/pricing" className="inline-block bg-blue-600 text-white px-4 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-700">
              Upgrade to PRO — RM14.99/month
            </a>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 && (
            <div className="text-center py-16">
              <div className="text-4xl mb-4">{getIcon()}</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {disciplineNames[discipline]} Rules Assistant
              </h2>
              <p className="text-gray-500 text-sm max-w-md mx-auto leading-relaxed">
                Ask any question about {disciplineNames[discipline]} rules.
                Answers are based strictly on the official World Aquatics Regulations.
              </p>
              {plan === 'lite' && (
                <div className="mt-3 inline-block bg-green-50 border border-green-200 rounded-lg px-4 py-2">
                  <p className="text-xs text-green-700">
                    🆓 LITE Plan — <strong>{monthlyRemaining} of 5</strong> free questions remaining this month
                  </p>
                </div>
              )}
              <div className="mt-6 grid grid-cols-1 gap-2 max-w-md mx-auto">
                {getSampleQuestions().map((q, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(q)}
                    className="text-left px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 font-medium hover:border-blue-300 hover:bg-blue-50 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-1">
                  <span className="text-white text-xs font-bold">A</span>
                </div>
              )}
              {msg.role === 'user' ? (
                <div style={{ backgroundColor: '#1e40af', borderRadius: '16px 16px 4px 16px', padding: '12px 20px', maxWidth: '75%' }}>
                  <p style={{ color: '#ffffff', fontSize: '14px', fontWeight: '600', margin: 0, lineHeight: '1.5' }}>
                    {msg.content}
                  </p>
                </div>
              ) : (
                <div className="max-w-3xl">
                  <div className="bg-white border border-gray-100 px-6 py-4 rounded-2xl rounded-bl-sm shadow-sm">
                    <div className="text-gray-700 text-sm">
                      <ReactMarkdown
                        components={{
                          h1: ({ children }) => <h1 className="text-base font-bold text-gray-900 mt-4 mb-2 pb-1 border-b border-gray-100">{children}</h1>,
                          h2: ({ children }) => <h2 className="text-sm font-bold text-gray-900 mt-4 mb-2">{children}</h2>,
                          h3: ({ children }) => <h3 className="text-sm font-semibold text-gray-800 mt-3 mb-1">{children}</h3>,
                          p: ({ children }) => <p className="text-gray-700 leading-relaxed mb-3">{children}</p>,
                          strong: ({ children }) => <strong className="font-semibold text-blue-700">{children}</strong>,
                          ul: ({ children }) => <ul className="list-disc list-inside space-y-1 mb-3 text-gray-700">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 mb-3 text-gray-700">{children}</ol>,
                          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                          blockquote: ({ children }) => <blockquote className="border-l-4 border-blue-200 pl-4 italic text-gray-600 my-3">{children}</blockquote>,
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  </div>

                  {!msg.content.startsWith('❌') && !msg.content.startsWith('⚠️') && (
                    <div className="flex items-center gap-2 mt-2 ml-1">
                      <span className="text-xs text-gray-400">Was this helpful?</span>
                      <button
                        onClick={() => handleFeedback(i, 'like')}
                        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-colors ${msg.feedback === 'like' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500 hover:bg-green-50 hover:text-green-600'}`}
                      >
                        👍 {msg.feedback === 'like' ? 'Helpful' : ''}
                      </button>
                      <button
                        onClick={() => handleFeedback(i, 'dislike')}
                        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-colors ${msg.feedback === 'dislike' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-600'}`}
                      >
                        👎 {msg.feedback === 'dislike' ? 'Not helpful' : ''}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                <span className="text-white text-xs font-bold">A</span>
              </div>
              <div className="bg-white border border-gray-100 px-6 py-4 rounded-2xl rounded-bl-sm shadow-sm">
                <div className="flex gap-1 items-center">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                  <span className="text-xs text-gray-400 ml-2">Searching regulations...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-100 px-6 py-4 flex-shrink-0">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isLimitReached && sendMessage()}
              placeholder={isLimitReached
                ? plan === 'lite' ? 'Monthly limit reached — upgrade to continue' : 'Daily limit reached — resets at midnight'
                : `Ask a ${disciplineNames[discipline] || discipline} rules question...`
              }
              disabled={isLimitReached}
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim() || isLimitReached}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">
            Answers based on official World Aquatics Regulations only · Available in 90+ languages · Always verify with your Meet Referee.
          </p>
        </div>
      </div>
    </div>
  )
}