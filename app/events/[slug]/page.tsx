'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useParams, useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface AquaEvent {
  id: string
  name: string
  slug: string
  description: string
  discipline: string
  country: string
  location: string
  start_date: string
  end_date: string
  is_active: boolean
}

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const DISCIPLINE_LABELS: Record<string, string> = {
  swimming: 'Swimming',
  waterpolo: 'Water Polo',
  artistic: 'Artistic Swimming',
  diving: 'Diving',
  highdiving: 'High Diving',
  masters: 'Masters',
  openwater: 'Open Water',
  paraswimming: 'Para Swimming',
}

const countryToFlag = (countryName: string): string => {
  const countries: Record<string, string> = {
    'Malaysia': '🇲🇾', 'Singapore': '🇸🇬', 'Indonesia': '🇮🇩', 'Thailand': '🇹🇭',
    'Philippines': '🇵🇭', 'Vietnam': '🇻🇳', 'Australia': '🇦🇺', 'United Kingdom': '🇬🇧',
    'United States': '🇺🇸', 'Japan': '🇯🇵', 'China': '🇨🇳', 'South Korea': '🇰🇷',
    'India': '🇮🇳', 'United Arab Emirates': '🇦🇪', 'Hong Kong': '🇭🇰',
  }
  return countries[countryName] || '🌍'
}

export default function EventChatPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [event, setEvent] = useState<AquaEvent | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [userPlan, setUserPlan] = useState('lite')
  const [remainingQuestions, setRemainingQuestions] = useState<number | null>(null)
  const [limitReached, setLimitReached] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadEvent()
    loadUser()
  }, [slug])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    setUserEmail(user.email || '')
    const { data: sub } = await supabase
      .from('user_subscriptions')
      .select('plan, country')
      .eq('user_email', user.email)
      .single()
    setUserPlan(sub?.plan || 'lite')
  }

  const loadEvent = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('events')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()
    if (!data) {
      setNotFound(true)
    } else {
      setEvent(data)
      setMessages([{
        role: 'assistant',
        content: `👋 Welcome to the **${data.name}** AI Assistant!\n\nI can help you find information about this event — including schedules, heat lists, start times, officials, and more.\n\nWhat would you like to know?`
      }])
    }
    setLoading(false)
  }

  const handleSend = async () => {
    if (!input.trim() || sending || !event || limitReached) return
    const question = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: question }])
    setSending(true)
    try {
      const response = await fetch('/api/event-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, eventId: event.id, eventName: event.name, userEmail })
      })
      const data = await response.json()
      if (response.status === 429) {
        setLimitReached(true)
        setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ ${data.message}\n\nUpgrade your plan to continue asking questions about this event.` }])
        return
      }
      if (data.error) {
        setMessages(prev => [...prev, { role: 'assistant', content: '❌ Sorry, something went wrong. Please try again.' }])
        return
      }
      setMessages(prev => [...prev, { role: 'assistant', content: data.answer }])
      if (data.remainingQuestions !== null && data.remainingQuestions !== undefined) {
        setRemainingQuestions(data.remainingQuestions)
        if (data.remainingQuestions === 0) setLimitReached(true)
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '❌ Something went wrong. Please try again.' }])
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-sm">Loading event...</p>
        </div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-4xl mb-4">🏊</p>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Event Not Found</h2>
          <p className="text-gray-400 text-sm mb-6">This event may have ended or is not available in your region.</p>
          <button onClick={() => router.push('/dashboard')} className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex-shrink-0">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/dashboard')} className="text-gray-400 hover:text-gray-600 text-sm">← Back</button>
            <div className="w-px h-4 bg-gray-200"></div>
            <div>
              <h1 className="font-semibold text-gray-900 flex items-center gap-2">
                🏆 {event?.name}
                <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">🟢 Live</span>
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-xs text-gray-400">
                  {countryToFlag(event?.country || '')} {event?.country} · 📍 {event?.location} · 🏊 {DISCIPLINE_LABELS[event?.discipline || ''] || event?.discipline}
                </p>
                {event?.start_date && (
                  <p className="text-xs text-gray-400">
                    · 📅 {new Date(event.start_date).toLocaleDateString('en-MY', { day: 'numeric', month: 'short' })}
                    {event.end_date ? ` — ${new Date(event.end_date).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })}` : ''}
                  </p>
                )}
              </div>
            </div>
          </div>
          {userPlan === 'lite' && remainingQuestions !== null && (
            <div className="text-right">
              <div className="text-xs text-gray-400">This event</div>
              <div className="text-sm font-medium text-gray-700">{remainingQuestions} of 3 left</div>
            </div>
          )}
        </div>
      </div>

      {/* LITE limit banner */}
      {userPlan === 'lite' && remainingQuestions !== null && remainingQuestions <= 1 && (
        <div className={`px-6 py-2 border-b text-center text-xs ${remainingQuestions === 0 ? 'bg-red-50 border-red-100 text-red-700' : 'bg-orange-50 border-orange-100 text-orange-700'}`}>
          {remainingQuestions === 0
            ? <>⚠️ You've used all 3 free questions for this event. <a href="/pricing" className="underline font-medium">Upgrade now</a></>
            : <>⚠️ Last free question for this event. <a href="/pricing" className="underline font-medium">Upgrade to PRO</a> for unlimited access.</>
          }
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-green-600 flex items-center justify-center mr-3 flex-shrink-0 mt-1">
                  <span className="text-white text-xs font-bold">E</span>
                </div>
              )}
              {msg.role === 'user' ? (
                <div style={{ backgroundColor: '#15803d', borderRadius: '16px 16px 4px 16px', padding: '12px 20px', maxWidth: '75%' }}>
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
                          strong: ({ children }) => <strong className="font-semibold text-green-700">{children}</strong>,
                          ul: ({ children }) => <ul className="list-disc list-inside space-y-1 mb-3 text-gray-700">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 mb-3 text-gray-700">{children}</ol>,
                          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                          blockquote: ({ children }) => <blockquote className="border-l-4 border-green-200 pl-4 italic text-gray-600 my-3">{children}</blockquote>,
                          table: ({ children }) => (
                            <div className="overflow-x-auto mb-4 rounded-lg border border-gray-200">
                              <table className="min-w-full text-sm">{children}</table>
                            </div>
                          ),
                          thead: ({ children }) => <thead className="bg-green-50">{children}</thead>,
                          tbody: ({ children }) => <tbody className="divide-y divide-gray-100 bg-white">{children}</tbody>,
                          tr: ({ children }) => <tr className="hover:bg-gray-50 transition-colors">{children}</tr>,
                          th: ({ children }) => <th className="px-4 py-2.5 text-left text-xs font-semibold text-green-700 border-b border-gray-200">{children}</th>,
                          td: ({ children }) => <td className="px-4 py-2.5 text-gray-700 text-xs">{children}</td>,
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {sending && (
            <div className="flex justify-start">
              <div className="w-7 h-7 rounded-full bg-green-600 flex items-center justify-center mr-3 flex-shrink-0">
                <span className="text-white text-xs font-bold">E</span>
              </div>
              <div className="bg-white border border-gray-100 px-6 py-4 rounded-2xl rounded-bl-sm shadow-sm">
                <div className="flex gap-1 items-center">
                  <div className="w-2 h-2 rounded-full animate-bounce bg-green-400"></div>
                  <div className="w-2 h-2 rounded-full animate-bounce bg-green-400" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 rounded-full animate-bounce bg-green-400" style={{ animationDelay: '0.4s' }}></div>
                  <span className="text-xs text-gray-400 ml-2">Searching event documents...</span>
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
          {limitReached ? (
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-3">Upgrade to continue asking questions about this event</p>
              <a href="/pricing" className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">View Plans</a>
            </div>
          ) : (
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder={`Ask about ${event?.name}...`}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 placeholder-gray-400"
                disabled={sending}
              />
              <button
                onClick={handleSend}
                disabled={sending || !input.trim()}
                className="px-6 py-3 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                Send
              </button>
            </div>
          )}
          <p className="text-xs text-gray-400 mt-2 text-center">
            Answers based on uploaded event documents only · Always verify with the Meet Referee or Event Director.
          </p>
        </div>
      </div>
    </div>
  )
}