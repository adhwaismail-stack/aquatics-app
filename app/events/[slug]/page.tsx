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
        body: JSON.stringify({
          question,
          eventId: event.id,
          eventName: event.name,
          userEmail
        })
      })

      const data = await response.json()

      if (response.status === 429) {
        setLimitReached(true)
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `⚠️ ${data.message}\n\n[Upgrade your plan](/pricing) to continue asking questions about this event.`
        }])
        return
      }

      if (data.error) {
        setMessages(prev => [...prev, { role: 'assistant', content: `Sorry, something went wrong. Please try again.` }])
        return
      }

      setMessages(prev => [...prev, { role: 'assistant', content: data.answer }])

      if (data.remainingQuestions !== null && data.remainingQuestions !== undefined) {
        setRemainingQuestions(data.remainingQuestions)
        if (data.remainingQuestions === 0) setLimitReached(true)
      }

    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }])
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
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
      <div className="bg-white border-b border-gray-100 px-4 py-3 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/dashboard')} className="text-gray-400 hover:text-gray-600">
              ← Back
            </button>
            <div>
              <h1 className="font-semibold text-gray-900 text-sm">{event?.name}</h1>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">{countryToFlag(event?.country || '')} {event?.country}</span>
                <span className="text-xs text-gray-300">·</span>
                <span className="text-xs text-gray-400">📍 {event?.location}</span>
                <span className="text-xs text-gray-300">·</span>
                <span className="text-xs text-gray-400">🏊 {DISCIPLINE_LABELS[event?.discipline || ''] || event?.discipline}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {event?.start_date && (
              <span className="text-xs text-gray-400">
                {new Date(event.start_date).toLocaleDateString('en-MY', { day: 'numeric', month: 'short' })}
                {event.end_date ? ` — ${new Date(event.end_date).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })}` : ''}
              </span>
            )}
            <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">🟢 Live</span>
          </div>
        </div>
      </div>

      {/* LITE limit banner */}
      {userPlan === 'lite' && remainingQuestions !== null && (
        <div className={`px-4 py-2 text-center text-xs ${remainingQuestions === 0 ? 'bg-red-50 text-red-600' : remainingQuestions === 1 ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>
          {remainingQuestions === 0
            ? '⚠️ You\'ve used all 3 free questions for this event. Upgrade to PRO for unlimited access.'
            : `💬 ${remainingQuestions} free question${remainingQuestions !== 1 ? 's' : ''} remaining for this event. `}
          {remainingQuestions !== null && remainingQuestions <= 1 && (
            <a href="/pricing" className="underline font-medium">Upgrade now</a>
          )}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-green-600 flex items-center justify-center text-white text-xs font-bold mr-2 mt-1 flex-shrink-0">E</div>
              )}
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-100 text-gray-800'}`}>
                {msg.role === 'assistant' ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]} className="prose prose-sm max-w-none text-gray-800 prose-table:border prose-td:border prose-td:px-2 prose-th:border prose-th:px-2">
                    {msg.content}
                  </ReactMarkdown>
                ) : (
                  <p className="text-sm">{msg.content}</p>
                )}
              </div>
            </div>
          ))}

          {sending && (
            <div className="flex justify-start">
              <div className="w-7 h-7 rounded-full bg-green-600 flex items-center justify-center text-white text-xs font-bold mr-2 mt-1">E</div>
              <div className="bg-white border border-gray-100 rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-100 px-4 py-4">
        <div className="max-w-3xl mx-auto">
          {limitReached ? (
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-3">Upgrade to continue asking questions about this event</p>
              <a href="/pricing" className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                View Plans
              </a>
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
                className="px-5 py-3 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                Send
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}