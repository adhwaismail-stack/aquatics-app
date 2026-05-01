'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { use } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const disciplineNames: { [key: string]: string } = {
  swimming: 'Swimming',
  waterpolo: 'Water Polo',
  artistic: 'Artistic Swimming',
  diving: 'Diving',
  highdiving: 'High Diving',
  masters: 'Masters',
  openwater: 'Open Water',
  paraswimming: 'Para Swimming'
}

const disciplineCodes: { [key: string]: string } = {
  swimming: 'SW Rules',
  waterpolo: 'WP Rules',
  artistic: 'AS Rules',
  diving: 'DV Rules',
  highdiving: 'HD Rules',
  masters: 'MS Rules',
  openwater: 'OW Rules',
  paraswimming: 'WPS Rules'
}

interface Message {
  role: 'user' | 'assistant'
  content: string
  feedback?: 'like' | 'dislike' | null
}

// Strip markdown for clean sharing
function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/#{1,6}\s+/g, '')
    .replace(/`{1,3}(.*?)`{1,3}/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^[-*+]\s+/gm, '• ')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

// Format the share message
function buildShareMessage(question: string, answer: string, discipline: string): string {
  const clean = stripMarkdown(answer)
  const disciplineLabel = disciplineNames[discipline] || discipline
  const ruleCode = disciplineCodes[discipline] || ''

  return `📋 *AquaRef — ${disciplineLabel} Rules (${ruleCode})*

*Q: ${question}*

${clean}

_Always verify with official World Aquatics Regulations and your Meet Referee._
_Powered by AquaRef · aquaref.co_`
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
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [nativeShareSupported, setNativeShareSupported] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const isParaSwimming = discipline === 'paraswimming'

  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      setNativeShareSupported(true)
    }

    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
       if (!user) {
        setUser(null)
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
 setMonthlyRemaining(Math.max(0, 10 - used))

        const resetDateObj = new Date(cycleStart)
        resetDateObj.setDate(resetDateObj.getDate() + 30)
        setResetDate(resetDateObj.toLocaleDateString('en-MY', { day: 'numeric', month: 'long', year: 'numeric' }))
        setDaysUntilReset(Math.ceil((resetDateObj.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
setDailyLimit(10)
        setUsage(used)
      } else {
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

  // Share answer handler
  const handleShareAnswer = async (index: number) => {
    const answer = messages[index]
    const question = messages[index - 1]?.content || ''
    const shareText = buildShareMessage(question, answer.content, discipline)

    // Mobile — native share sheet
    if (nativeShareSupported) {
      try {
        await navigator.share({ text: shareText })
        return
      } catch {
        // User cancelled — fall through to copy
      }
    }

    // Desktop — copy to clipboard
    try {
      await navigator.clipboard.writeText(shareText)
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), 2000)
    } catch {
      // Clipboard failed — silently ignore
    }
  }

  // WhatsApp direct share
  const handleWhatsAppShare = (index: number) => {
    const answer = messages[index]
    const question = messages[index - 1]?.content || ''
    const shareText = buildShareMessage(question, answer.content, discipline)
    const encoded = encodeURIComponent(shareText)
    window.open(`https://wa.me/?text=${encoded}`, '_blank')
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
            content: data.message,
            feedback: null
          }])
        } else {
          setMessages([...newMessages, {
            role: 'assistant',
            content: data.error,
            feedback: null
          }])
        }
      } else if (data.error) {
        setMessages([...newMessages, {
          role: 'assistant',
          content: data.error,
          feedback: null
        }])
      } else {
        setMessages([...newMessages, {
          role: 'assistant',
          content: data.answer,
          feedback: null
        }])
        setUsage(prev => prev + 1)

        if (plan === 'lite' && data.remainingQuestions !== undefined) {
          setMonthlyRemaining(data.remainingQuestions)
          if (data.isLastQuestion) {
            setTimeout(() => {
              setMessages(prev => [...prev, {
                role: 'assistant',
                content: `You've just used your last free question for this month. Your quota resets in ${data.daysUntilReset} day${data.daysUntilReset !== 1 ? 's' : ''} on ${data.resetDate}.\n\n[Upgrade to PRO for 50 questions per day](/pricing)`,
                feedback: null
              }])
            }, 500)
          }
        }
      }
    } catch {
      setMessages([...newMessages, {
        role: 'assistant',
        content: 'Something went wrong. Please try again.',
        feedback: null
      }])
    }

    setLoading(false)
  }

  const getSampleQuestions = () => {
    const questions: { [key: string]: string[] } = {
      swimming: ['What is the false start rule?', 'What are the breaststroke turn rules?', 'Can a swimmer false start twice?'],
      waterpolo: ['What are the referee duties?', 'How long is each period?', 'What constitutes a foul?'],
      openwater: ['What is the minimum water temperature for Open Water?', 'Can swimmers wear wetsuits in Open Water?', 'What are the feeding rules in Open Water?'],
      artistic: ['How is artistic swimming scored?', 'What are the routine time limits?', 'What are the deck work rules?'],
      diving: ['How are dives scored?', 'What is the degree of difficulty?', 'What are the springboard height rules?'],
      highdiving: ['What are the platform height requirements?', 'How are high dives scored?', 'What safety rules apply?'],
      masters: ['What are the age group categories?', 'How are masters records set?', 'What are the eligibility rules?'],
      paraswimming: ['What are the Para Swimming classification classes?', 'What are the start rules for Para swimmers?', 'What equipment is permitted in Para Swimming?']
    }
    return questions[discipline] || questions.swimming
  }

  const isLimitReached = plan === 'lite' ? monthlyRemaining <= 0 : usage >= dailyLimit

  const isShareableMessage = (content: string) =>
    !content.toLowerCase().startsWith('something went wrong') &&
    !content.toLowerCase().startsWith("you've used all") &&
    !content.toLowerCase().startsWith("you've just used") &&
    !content.toLowerCase().startsWith("upgrade to pro")

// Non-logged-in preview page
  if (!user) {
    const sampleQs = getSampleQuestions()
    const accentColor = isParaSwimming ? 'purple' : 'blue'
    const bgFrom = isParaSwimming ? 'from-purple-50' : 'from-blue-50'
    const btnBg = isParaSwimming ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'
    const badgeBg = isParaSwimming ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
    const borderColor = isParaSwimming ? 'border-purple-100' : 'border-blue-100'

    return (
      <div className={`min-h-screen bg-gradient-to-b ${bgFrom} via-white to-gray-50 flex flex-col`}>
        <div className="bg-white border-b border-gray-100 px-6 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="font-bold text-xl text-gray-900">AquaRef</span>
            </a>
            <a href="/login" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Already a member? Log in
            </a>
          </div>
        </div>

        <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
          <div className="text-center mb-8">
            <div className={`inline-flex items-center gap-2 ${badgeBg} px-3 py-1 rounded-full text-xs font-medium mb-4`}>
              {isParaSwimming ? '🏅' : '🏊'} {disciplineNames[discipline]} Rules
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              {disciplineNames[discipline]} Rules Assistant
            </h1>
            <p className="text-gray-500 text-sm max-w-md mx-auto">
              {isParaSwimming
                ? 'Instant AI answers from official World Para Swimming (WPS) regulations. Available in 90+ languages.'
                : `Instant AI answers from official World Aquatics ${disciplineCodes[discipline]}. Available in 90+ languages.`}
            </p>
            {isParaSwimming && (
              <div className="mt-3 inline-block bg-purple-50 border border-purple-200 rounded-lg px-4 py-2">
                <p className="text-xs text-purple-700">Governed by <strong>World Para Swimming (WPS)</strong> under IPC</p>
              </div>
            )}
          </div>

          <div className={`bg-white rounded-2xl border ${borderColor} p-6 md:p-8 shadow-sm mb-6`}>
            <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">
              Ask any {disciplineNames[discipline]} rules question
            </h2>
            <p className="text-sm text-gray-500 text-center mb-6">
              Perfect for Technical Officials, coaches, swimmers and parents.
            </p>

            <div className="space-y-3 mb-6">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Example questions:
              </p>
              {sampleQs.map((q, i) => (
                <div key={i} className={`bg-gradient-to-r ${isParaSwimming ? 'from-purple-50 to-blue-50 border-purple-100' : 'from-blue-50 to-green-50 border-blue-100'} border rounded-xl px-4 py-3 flex items-start gap-3`}>
                  <span className={`${isParaSwimming ? 'text-purple-500' : 'text-blue-500'} text-lg flex-shrink-0`}>{'"'}</span>
                  <p className="text-sm text-gray-700 italic">{q}</p>
                </div>
              ))}
            </div>

            <div className={`${isParaSwimming ? 'bg-purple-50 border-purple-100' : 'bg-blue-50 border-blue-100'} border rounded-xl p-4 mb-6`}>
              <p className={`text-sm font-semibold text-center mb-1 ${isParaSwimming ? 'text-purple-900' : 'text-blue-900'}`}>
                Get 10 FREE questions per month
              </p>
              <p className={`text-xs text-center ${isParaSwimming ? 'text-purple-700' : 'text-blue-700'}`}>
                Sign up in seconds — no credit card required.
              </p>
            </div>

            <div className="space-y-3">
              <a href="/login" className={`w-full py-4 ${btnBg} text-white rounded-xl text-base font-semibold text-center block transition-colors shadow-sm hover:shadow-md`}>
                Sign Up Free — Ask {disciplineNames[discipline]} Rules
              </a>
              <a href="/login" className="w-full py-3 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium text-center block hover:bg-gray-50 transition-colors">
                Already have an account? Log in
              </a>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
            <h3 className="font-semibold text-gray-900 text-sm mb-4 text-center">How it works</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className={`w-10 h-10 ${isParaSwimming ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'} rounded-full flex items-center justify-center mx-auto mb-2 font-bold`}>1</div>
                <p className="text-xs text-gray-600">Sign up with your email</p>
              </div>
              <div>
                <div className={`w-10 h-10 ${isParaSwimming ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'} rounded-full flex items-center justify-center mx-auto mb-2 font-bold`}>2</div>
                <p className="text-xs text-gray-600">Ask any {disciplineNames[discipline]} rules question</p>
              </div>
              <div>
                <div className={`w-10 h-10 ${isParaSwimming ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'} rounded-full flex items-center justify-center mx-auto mb-2 font-bold`}>3</div>
                <p className="text-xs text-gray-600">Get instant answers with rule citations</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
            <h3 className="font-semibold text-gray-900 text-sm mb-3 text-center">All 8 disciplines available</h3>
            <div className="flex flex-wrap gap-2 justify-center">
              {['Swimming', 'Water Polo', 'Artistic Swimming', 'Diving', 'High Diving', 'Masters', 'Open Water', 'Para Swimming'].map((d, i) => (
                <span key={i} className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">{d}</span>
              ))}
            </div>
          </div>

          <div className="text-center">
            <a href="/pricing" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View all plans and pricing →
            </a>
          </div>
        </div>

        <footer className="border-t border-gray-100 bg-white px-6 py-4 mt-8">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-xs text-gray-400">
              {isParaSwimming
                ? 'Answers based on World Para Swimming (WPS) Regulations only. Always verify with your Meet Referee.'
                : 'Answers based on official World Aquatics Regulations only. Always verify with your Meet Referee.'}
            </p>
          </div>
        </footer>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex-shrink-0">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/dashboard" className="text-gray-400 hover:text-gray-600 text-sm">← Back</a>
            <div className="w-px h-4 bg-gray-200"></div>
            <div>
              <h1 className="font-semibold text-gray-900 flex items-center gap-2">
                {disciplineNames[discipline] || discipline}
                {isParaSwimming && (
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">WPS</span>
                )}
              </h1>
              <p className={`text-xs ${isParaSwimming ? 'text-purple-400' : 'text-gray-400'}`}>
                {disciplineCodes[discipline]}
                {isParaSwimming && ' · World Para Swimming (IPC)'}
              </p>
            </div>
          </div>

          {plan !== 'elite' && (
            <div className="flex items-center gap-3">
              {plan === 'lite' ? (
                <div className="text-right">
                  <div className="text-xs text-gray-400">This month</div>
                  <div className="text-sm font-medium text-gray-700">
           {monthlyRemaining} of 10 left
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
                  className={`h-2 rounded-full transition-all ${isParaSwimming ? 'bg-purple-600' : 'bg-blue-600'}`}
                  style={{
           width: plan === 'lite' ? `${Math.min(((10 - monthlyRemaining) / 10) * 100, 100)}%` : `${Math.min((usage / dailyLimit) * 100, 100)}%`
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {isParaSwimming && (
        <div className="bg-purple-50 border-b border-purple-100 px-6 py-2">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-xs text-purple-700">
              Para Swimming rules are governed by <strong>World Para Swimming (WPS)</strong> under the International Paralympic Committee (IPC), independent of World Aquatics. Always verify with official WPS regulations and your Meet Referee.
            </p>
          </div>
        </div>
      )}

      {plan === 'lite' && monthlyRemaining <= 1 && monthlyRemaining > 0 && (
        <div className="bg-orange-50 border-b border-orange-100 px-6 py-2">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-xs text-orange-700">
              <strong>{monthlyRemaining} question left</strong> this month. Resets on {resetDate}.{' '}
              <a href="/pricing" className="underline font-medium">Upgrade to PRO</a> for 50/day.
            </p>
          </div>
        </div>
      )}

      {plan === 'lite' && monthlyRemaining <= 0 && (
        <div className="bg-red-50 border-b border-red-100 px-6 py-3">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-sm font-medium text-red-800 mb-1">
   You&apos;ve used all 10 free questions this month
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

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 && (
            <div className="text-center py-16">
              <h2 className={`text-xl font-semibold mb-2 ${isParaSwimming ? 'text-purple-900' : 'text-gray-900'}`}>
                {disciplineNames[discipline]} Rules Assistant
              </h2>
              <p className="text-gray-500 text-sm max-w-md mx-auto leading-relaxed">
                Ask any question about {disciplineNames[discipline]} rules.
                {isParaSwimming
                  ? ' Answers are based strictly on official World Para Swimming (WPS) Regulations.'
                  : ' Answers are based strictly on the official World Aquatics Regulations.'}
              </p>
              {isParaSwimming && (
                <div className="mt-3 inline-block bg-purple-50 border border-purple-200 rounded-lg px-4 py-2">
                  <p className="text-xs text-purple-700">
                    Governed by <strong>World Para Swimming (WPS)</strong> under IPC
                  </p>
                </div>
              )}
              {plan === 'lite' && (
                <div className="mt-3 inline-block bg-green-50 border border-green-200 rounded-lg px-4 py-2">
                  <p className="text-xs text-green-700">
                  LITE Plan — <strong>{monthlyRemaining} of 10</strong>
                  </p>
                </div>
              )}
              <div className="mt-6 grid grid-cols-1 gap-2 max-w-md mx-auto">
                {getSampleQuestions().map((q, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(q)}
                    className={`text-left px-4 py-3 bg-white border rounded-lg text-sm font-medium transition-colors ${
                      isParaSwimming
                        ? 'border-purple-200 text-gray-700 hover:border-purple-400 hover:bg-purple-50'
                        : 'border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                    }`}
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
                <div className={`w-7 h-7 rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-1 ${isParaSwimming ? 'bg-purple-600' : 'bg-blue-600'}`}>
                  <span className="text-white text-xs font-bold">A</span>
                </div>
              )}
              {msg.role === 'user' ? (
                <div style={{ backgroundColor: isParaSwimming ? '#7c3aed' : '#1e40af', borderRadius: '16px 16px 4px 16px', padding: '12px 20px', maxWidth: '75%' }}>
                  <p style={{ color: '#ffffff', fontSize: '14px', fontWeight: '600', margin: 0, lineHeight: '1.5' }}>
                    {msg.content}
                  </p>
                </div>
              ) : (
                <div className="max-w-3xl w-full">
                  <div className="bg-white border border-gray-100 px-6 py-4 rounded-2xl rounded-bl-sm shadow-sm">
                    <div className="text-gray-700 text-sm">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h1: ({ children }) => <h1 className="text-base font-bold text-gray-900 mt-4 mb-2 pb-1 border-b border-gray-100">{children}</h1>,
                          h2: ({ children }) => <h2 className="text-sm font-bold text-gray-900 mt-4 mb-2">{children}</h2>,
                          h3: ({ children }) => <h3 className="text-sm font-semibold text-gray-800 mt-3 mb-1">{children}</h3>,
                          p: ({ children }) => <p className="text-gray-700 leading-relaxed mb-3">{children}</p>,
                          strong: ({ children }) => <strong className={`font-semibold ${isParaSwimming ? 'text-purple-700' : 'text-blue-700'}`}>{children}</strong>,
                          ul: ({ children }) => <ul className="list-disc list-inside space-y-1 mb-3 text-gray-700">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 mb-3 text-gray-700">{children}</ol>,
                          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                          blockquote: ({ children }) => <blockquote className={`border-l-4 pl-4 italic text-gray-600 my-3 ${isParaSwimming ? 'border-purple-200' : 'border-blue-200'}`}>{children}</blockquote>,
                          table: ({ children }) => (
                            <div className="overflow-x-auto mb-4 rounded-lg border border-gray-200">
                              <table className="min-w-full text-sm">{children}</table>
                            </div>
                          ),
                          thead: ({ children }) => (
                            <thead className={`${isParaSwimming ? 'bg-purple-50' : 'bg-blue-50'}`}>{children}</thead>
                          ),
                          tbody: ({ children }) => (
                            <tbody className="divide-y divide-gray-100 bg-white">{children}</tbody>
                          ),
                          tr: ({ children }) => (
                            <tr className="hover:bg-gray-50 transition-colors">{children}</tr>
                          ),
                          th: ({ children }) => (
                            <th className={`px-4 py-2.5 text-left text-xs font-semibold ${isParaSwimming ? 'text-purple-700' : 'text-blue-700'} border-b border-gray-200`}>{children}</th>
                          ),
                          td: ({ children }) => (
                            <td className="px-4 py-2.5 text-gray-700 text-xs">{children}</td>
                          ),
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  </div>

                  {/* Feedback + Share row */}
                  {isShareableMessage(msg.content) && (
                    <div className="flex items-center gap-2 mt-2 ml-1">
                      <span className="text-xs text-gray-400">Was this helpful?</span>
                      <button
                        onClick={() => handleFeedback(i, 'like')}
                        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-colors ${msg.feedback === 'like' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500 hover:bg-green-50 hover:text-green-600'}`}
                      >
                        Helpful
                      </button>
                      <button
                        onClick={() => handleFeedback(i, 'dislike')}
                        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-colors ${msg.feedback === 'dislike' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-600'}`}
                      >
                        Not helpful
                      </button>

                      {/* Divider */}
                      <span className="text-gray-200">|</span>

                      {/* WhatsApp share */}
                      <button
                        onClick={() => handleWhatsAppShare(i)}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-colors bg-gray-100 text-gray-500 hover:bg-green-50 hover:text-green-600"
                        title="Share to WhatsApp"
                      >
                        <svg viewBox="0 0 24 24" className="w-3 h-3" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                        </svg>
                        WhatsApp
                      </button>

                      {/* Copy / More share */}
                      <button
                        onClick={() => handleShareAnswer(i)}
                        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-colors ${copiedIndex === i ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500 hover:bg-blue-50 hover:text-blue-600'}`}
                        title={nativeShareSupported ? 'Share' : 'Copy answer'}
                      >
                        {copiedIndex === i ? (
                          'Copied!'
                        ) : nativeShareSupported ? (
                          <>
                            <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                            </svg>
                            Share
                          </>
                        ) : (
                          <>
                            <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                            </svg>
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center mr-3 flex-shrink-0 ${isParaSwimming ? 'bg-purple-600' : 'bg-blue-600'}`}>
                <span className="text-white text-xs font-bold">A</span>
              </div>
              <div className="bg-white border border-gray-100 px-6 py-4 rounded-2xl rounded-bl-sm shadow-sm">
                <div className="flex gap-1 items-center">
                  <div className={`w-2 h-2 rounded-full animate-bounce ${isParaSwimming ? 'bg-purple-400' : 'bg-blue-400'}`}></div>
                  <div className={`w-2 h-2 rounded-full animate-bounce ${isParaSwimming ? 'bg-purple-400' : 'bg-blue-400'}`} style={{animationDelay: '0.2s'}}></div>
                  <div className={`w-2 h-2 rounded-full animate-bounce ${isParaSwimming ? 'bg-purple-400' : 'bg-blue-400'}`} style={{animationDelay: '0.4s'}}></div>
                  <span className="text-xs text-gray-400 ml-2">Searching regulations...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

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
              className={`flex-1 px-4 py-3 border rounded-xl text-sm text-gray-900 focus:outline-none disabled:bg-gray-50 disabled:text-gray-400 ${
                isParaSwimming
                  ? 'border-purple-200 focus:ring-2 focus:ring-purple-400'
                  : 'border-gray-200 focus:ring-2 focus:ring-blue-500'
              }`}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim() || isLimitReached}
              className={`text-white px-6 py-3 rounded-xl text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
                isParaSwimming
                  ? 'bg-purple-600 hover:bg-purple-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              Send
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">
            {isParaSwimming
              ? 'Answers based on World Para Swimming (WPS) Regulations only · Available in 90+ languages · Always verify with your Meet Referee.'
              : 'Answers based on official World Aquatics Regulations only · Available in 90+ languages · Always verify with your Meet Referee.'}
          </p>
        </div>
      </div>
    </div>
  )
}