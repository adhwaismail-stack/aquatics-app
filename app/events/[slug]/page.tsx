'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useParams, useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react'

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
poster_url?: string
  chat_enabled?: boolean
}

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface EventNotice {
  id: string
  event_id: string
  category: string
  message: string
  is_active: boolean
  created_at: string
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

const NOTICE_STYLES: Record<string, { dot: string, label: string }> = {
  current_event: { dot: 'bg-blue-500', label: 'Current Event' },
  call_room: { dot: 'bg-orange-500', label: 'Call Room' },
  announcement: { dot: 'bg-purple-500', label: 'Announcement' },
  venue: { dot: 'bg-green-500', label: 'Venue' },
  schedule: { dot: 'bg-yellow-500', label: 'Schedule' },
}

const SAMPLE_QUESTIONS: Record<string, string[]> = {
  swimming: [
    'When does Lane 4 swim the 100m freestyle?',
    'Which heat is my swimmer in?',
    'What time does Session 3 start?',
  ],
  waterpolo: [
    'What time is the Malaysia vs Singapore match?',
    'Which pool is the gold medal match at?',
    'Who are the referees for today?',
  ],
  artistic: [
    'When is the solo technical routine?',
    'Who is in the duet final?',
    'What time does free combination start?',
  ],
  diving: [
    'When does the 10m platform final start?',
    'Who is in the synchronised 3m springboard?',
    'What are the qualifying scores?',
  ],
  highdiving: [
    'When does the 27m high dive start?',
    'Who are the officials for today?',
    'What time is the awards ceremony?',
  ],
  masters: [
    'When does the 50-59 age group swim?',
    'Which heat is my swimmer in?',
    'What time does session 2 start?',
  ],
  openwater: [
    'What time does the 5km race start?',
    'What is the water temperature today?',
    'Who are the safety officials?',
  ],
  paraswimming: [
    'When does the S5 100m freestyle start?',
    'Which lane is my swimmer in?',
    'What time does session 2 begin?',
  ],
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
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [userPlan, setUserPlan] = useState('lite')
  const [remainingQuestions, setRemainingQuestions] = useState<number | null>(null)
  const [limitReached, setLimitReached] = useState(false)
  const [notices, setNotices] = useState<EventNotice[]>([])
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [copiedUrl, setCopiedUrl] = useState(false)
const [nativeShareSupported, setNativeShareSupported] = useState(false)
  const [eventFiles, setEventFiles] = useState<{ name: string, url: string, originalName: string }[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const shareQrCanvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    loadEvent()
    checkAuth()
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      setNativeShareSupported(true)
    }
  }, [slug])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (!event?.id) return
    loadNotices(event.id)
    const interval = setInterval(() => {
      loadNotices(event.id)
    }, 30000)
    return () => clearInterval(interval)
  }, [event?.id])

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShareModalOpen(false)
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [])

  const loadNotices = async (eventId: string) => {
    const { data } = await supabase
      .from('event_notices')
      .select('*')
      .eq('event_id', eventId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    if (data) setNotices(data)
  }

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setIsLoggedIn(false)
      if (typeof window !== 'undefined') {
        const currentPath = `/events/${slug}${window.location.search}`
        localStorage.setItem('aquaref_redirect_after_auth', currentPath)
      }
      return
    }
    setIsLoggedIn(true)
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
        content: `Welcome to the **${data.name}** AI Assistant.\n\nI can help you find information about this event — including schedules, heat lists, start times, officials, and more.\n\nWhat would you like to know?`
      }])

      // Load downloadable files
      const { data: chunks } = await supabase
        .from('event_chunks')
        .select('source_file')
        .eq('event_id', data.id)
      if (chunks) {
        const seen = new Set<string>()
        const files: { name: string, url: string, originalName: string }[] = []
        chunks.forEach((c: { source_file: string }) => {
          const path = c.source_file
          if (!seen.has(path)) {
            seen.add(path)
   const { data: { publicUrl } } = supabase.storage.from('events').getPublicUrl(path)
            const parts = path.split('/')
            const rawName = parts[parts.length - 1]
            const originalName = rawName.replace(/^\d+_/, '')
            const encodedUrl = parts.map((seg, i) => i === parts.length - 1 ? encodeURIComponent(seg) : seg).join('/')
            const finalUrl = publicUrl.substring(0, publicUrl.lastIndexOf('/') + 1) + encodeURIComponent(rawName)
            files.push({ name: path, url: finalUrl, originalName })
          }
        })
        setEventFiles(files)
      }
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
        setMessages(prev => [...prev, { role: 'assistant', content: `${data.message}\n\nUpgrade your plan to continue asking questions about this event.` }])
        return
      }
      if (data.error) {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }])
        return
      }
      setMessages(prev => [...prev, { role: 'assistant', content: data.answer }])
      if (data.remainingQuestions !== null && data.remainingQuestions !== undefined) {
        setRemainingQuestions(data.remainingQuestions)
        if (data.remainingQuestions === 0) setLimitReached(true)
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Something went wrong. Please try again.' }])
    } finally {
      setSending(false)
    }
  }

  const getShareUrl = () => {
    if (!event) return ''
    const base = typeof window !== 'undefined' ? window.location.origin : 'https://aquaref.co'
    return `${base}/events/${event.slug}?ref=user_share`
  }

  const getShareMessage = () => {
    if (!event) return ''
    return `Check out ${event.name} on AquaRef — get instant AI answers about heats, schedules, and more: ${getShareUrl()}`
  }

  const handleCopyUrl = async () => {
    await navigator.clipboard.writeText(getShareUrl())
    setCopiedUrl(true)
    setTimeout(() => setCopiedUrl(false), 2000)
  }

  const handleDownloadQR = () => {
    if (!event) return
    const canvas = shareQrCanvasRef.current
    if (!canvas) return
    const url = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.href = url
    link.download = `aquaref-${event.slug}.png`
    link.click()
  }

  const handleNativeShare = async () => {
    if (!event || !navigator.share) return
    try {
      await navigator.share({
        title: event.name,
        text: getShareMessage(),
        url: getShareUrl(),
      })
    } catch {
      // User cancelled
    }
  }

  // Platform share handlers
  const shareWhatsApp = () => {
    const text = encodeURIComponent(getShareMessage())
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  const shareSMS = () => {
    const text = encodeURIComponent(getShareMessage())
    window.open(`sms:?body=${text}`, '_blank')
  }

  const shareFacebook = () => {
    const url = encodeURIComponent(getShareUrl())
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'width=600,height=500')
  }

  const shareTwitter = () => {
    const text = encodeURIComponent(getShareMessage())
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank', 'width=600,height=500')
  }

  const shareEmail = () => {
    if (!event) return
    const subject = encodeURIComponent(`Check out ${event.name} on AquaRef`)
    const body = encodeURIComponent(getShareMessage())
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank')
  }

  if (loading || isLoggedIn === null) {
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
          <h2 className="text-xl font-bold text-gray-900 mb-2">Event Not Found</h2>
          <p className="text-gray-400 text-sm mb-6">This event may have ended or is not available in your region.</p>
          <button onClick={() => router.push('/dashboard')} className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (!isLoggedIn && event) {
    const sampleQs = SAMPLE_QUESTIONS[event.discipline] || SAMPLE_QUESTIONS.swimming

    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-green-50 flex flex-col">
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
          {event.poster_url && (
            <div className="mb-6 rounded-2xl overflow-hidden shadow-lg border border-gray-200">
              <img src={event.poster_url} alt={event.name} className="w-full object-cover" style={{ aspectRatio: '1200/630' }} />
            </div>
          )}

          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium mb-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Live Event
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Welcome to<br />{event.name}
            </h1>
            <p className="text-gray-500 text-sm">
              {countryToFlag(event.country)} {event.country} · {event.location} · {DISCIPLINE_LABELS[event.discipline] || event.discipline}
              {event.start_date && (
                <>
                  {' · '}
                  {new Date(event.start_date).toLocaleDateString('en-MY', { day: 'numeric', month: 'short' })}
                  {event.end_date ? ` - ${new Date(event.end_date).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })}` : ''}
                </>
              )}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">
              Get instant AI answers about this event
            </h2>
            <p className="text-sm text-gray-500 text-center mb-6">
              Perfect for officials, coaches, swimmers, and parents.
            </p>

            <div className="space-y-3 mb-6">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Example questions you can ask:
              </p>
              {sampleQs.map((q, i) => (
                <div key={i} className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-100 rounded-xl px-4 py-3 flex items-start gap-3">
                  <span className="text-blue-500 text-lg flex-shrink-0">{'"'}</span>
                  <p className="text-sm text-gray-700 italic">{q}</p>
                </div>
              ))}
            </div>

            <div className="bg-green-50 border border-green-100 rounded-xl p-4 mb-6">
              <p className="text-sm text-green-900 font-semibold text-center mb-1">
                Get 10 FREE questions for this event
              </p>
              <p className="text-xs text-green-700 text-center">
                Sign up in seconds - no credit card required.
              </p>
            </div>

            <div className="space-y-3">
              <a href="/login" className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl text-base font-semibold text-center block transition-colors shadow-sm hover:shadow-md">
                Sign Up Free - Ask 10 Questions
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
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2 font-bold">1</div>
                <p className="text-xs text-gray-600">Sign up with your email</p>
              </div>
              <div>
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2 font-bold">2</div>
                <p className="text-xs text-gray-600">Ask any question about the event</p>
              </div>
              <div>
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2 font-bold">3</div>
                <p className="text-xs text-gray-600">Get instant, accurate answers</p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <a href="/pricing" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View all plans and pricing
            </a>
          </div>
        </div>

        <footer className="border-t border-gray-100 bg-white px-6 py-4 mt-8">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-xs text-gray-400">
              For reference only. Always verify with official World Aquatics Regulations and your Meet Referee.
            </p>
          </div>
        </footer>
      </div>
    )
  }

// Chat disabled — show download page
  if (event && event.chat_enabled === false) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-gray-50 flex flex-col">
        <div className="bg-white border-b border-gray-100 px-6 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <a href="/dashboard" className="flex items-center gap-2 hover:opacity-80">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="font-bold text-xl text-gray-900">AquaRef</span>
            </a>
            <button onClick={() => router.push('/dashboard')} className="text-sm text-gray-400 hover:text-gray-600">← Back</button>
          </div>
        </div>

        <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
          {event.poster_url && (
            <div className="mb-6 rounded-2xl overflow-hidden shadow-lg border border-gray-200">
              <img src={event.poster_url} alt={event.name} className="w-full object-cover" style={{ aspectRatio: '1200/630' }} />
            </div>
          )}

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{event.name}</h1>
            <p className="text-gray-500 text-sm">
              {countryToFlag(event.country)} {event.country} · {event.location} · {DISCIPLINE_LABELS[event.discipline] || event.discipline}
              {event.start_date && (
                <> · {new Date(event.start_date).toLocaleDateString('en-MY', { day: 'numeric', month: 'short' })}
                {event.end_date ? ` - ${new Date(event.end_date).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })}` : ''}</>
              )}
            </p>
          </div>

          <div className="bg-orange-50 border border-orange-100 rounded-2xl p-6 mb-6 text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <h2 className="font-semibold text-orange-900 mb-1">AI Chat Belum Tersedia</h2>
            <p className="text-sm text-orange-700">
              Chat AI untuk event ini belum diaktifkan. Sila muat turun dokumen di bawah untuk maklumat lanjut.
            </p>
          </div>

          {eventFiles.length > 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-1">Dokumen Tersedia</h3>
              <p className="text-xs text-gray-400 mb-4">Muat turun dokumen event di bawah</p>
              <div className="space-y-3">
{eventFiles.map((file, i) => (
                  <a key={i} href={file.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 hover:bg-blue-50 hover:border-blue-200 transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">{file.originalName}</span>
                    </div>
                    <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
              <p className="text-sm text-gray-400">Tiada dokumen tersedia buat masa ini.</p>
            </div>
          )}
        </div>

        <footer className="border-t border-gray-100 bg-white px-6 py-4 mt-8">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-xs text-gray-400">AquaRef · Untuk rujukan sahaja.</p>
          </div>
        </footer>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <style jsx>{`
        @keyframes ticker-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .ticker-track {
          display: inline-flex;
          animation: ticker-scroll 60s linear infinite;
          white-space: nowrap;
        }
        .ticker-wrapper:hover .ticker-track {
          animation-play-state: paused;
        }
      `}</style>

      {shareModalOpen && event && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4" onClick={() => setShareModalOpen(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-lg text-gray-900">Share this event</h3>
              <button onClick={() => setShareModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100" aria-label="Close">
                X
              </button>
            </div>

            <p className="text-xs text-gray-500 mb-5">
              Share <span className="font-medium text-gray-700">{event.name}</span> with coaches, teammates, or parents.
            </p>

            {/* QR code */}
            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-5 mb-5 flex items-center justify-center">
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <QRCodeSVG value={getShareUrl()} size={140} level="H" includeMargin={false} />
              </div>
              <div style={{ display: 'none' }}>
                <QRCodeCanvas ref={shareQrCanvasRef} value={getShareUrl()} size={512} level="H" includeMargin={true} />
              </div>
            </div>

            {/* Share to platforms - circular icon row */}
            <div className="mb-5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Share via</p>
              <div className="grid grid-cols-5 gap-3">

                {/* WhatsApp */}
                <button onClick={shareWhatsApp} className="flex flex-col items-center gap-1 group">
                  <div className="w-12 h-12 rounded-full bg-[#25D366] flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                    <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                  </div>
                  <span className="text-xs text-gray-700 font-medium">WhatsApp</span>
                </button>

                {/* Messages (SMS) */}
                <button onClick={shareSMS} className="flex flex-col items-center gap-1 group">
                  <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                    <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                  </div>
                  <span className="text-xs text-gray-700 font-medium">Messages</span>
                </button>

                {/* Facebook */}
                <button onClick={shareFacebook} className="flex flex-col items-center gap-1 group">
                  <div className="w-12 h-12 rounded-full bg-[#1877F2] flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                    <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="currentColor">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </div>
                  <span className="text-xs text-gray-700 font-medium">Facebook</span>
                </button>

                {/* X (Twitter) */}
                <button onClick={shareTwitter} className="flex flex-col items-center gap-1 group">
                  <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </div>
                  <span className="text-xs text-gray-700 font-medium">X</span>
                </button>

                {/* Email */}
                <button onClick={shareEmail} className="flex flex-col items-center gap-1 group">
                  <div className="w-12 h-12 rounded-full bg-gray-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                    <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </div>
                  <span className="text-xs text-gray-700 font-medium">Email</span>
                </button>

              </div>
            </div>

            {/* Copy URL */}
            <div className="mb-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Or copy link</p>
              <div className="flex gap-2">
                <input type="text" value={getShareUrl()} readOnly className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-xs bg-gray-50 text-gray-700 font-mono truncate" />
                <button onClick={handleCopyUrl} className={`text-xs px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${copiedUrl ? 'bg-green-100 text-green-700' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                  {copiedUrl ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Native share + Download QR */}
            <div className="space-y-2 mt-4 pt-4 border-t border-gray-100">
              {nativeShareSupported && (
                <button onClick={handleNativeShare} className="w-full py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors">
                  More sharing options...
                </button>
              )}
              <button onClick={handleDownloadQR} className="w-full py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                Download QR code
              </button>
            </div>

            <p className="text-xs text-gray-400 text-center mt-4">
              Recipients need an AquaRef account to use the AI.
            </p>
          </div>
        </div>
      )}

      <div className="bg-white border-b border-gray-100 flex-shrink-0">
        <div className="px-6 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <button onClick={() => router.push('/dashboard')} className="text-gray-400 hover:text-gray-600 text-sm flex-shrink-0">Back</button>
              <div className="w-px h-4 bg-gray-200 flex-shrink-0"></div>
              <div className="min-w-0">
                <h1 className="font-semibold text-gray-900 flex items-center gap-2 truncate">
                  {event?.name}
                  <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium flex items-center gap-1 flex-shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    Live
                  </span>
                </h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-xs text-gray-400 truncate">
                    {countryToFlag(event?.country || '')} {event?.country} · {event?.location} · {DISCIPLINE_LABELS[event?.discipline || ''] || event?.discipline}
                    {event?.start_date && ` · ${new Date(event.start_date).toLocaleDateString('en-MY', { day: 'numeric', month: 'short' })}${event.end_date ? ` - ${new Date(event.end_date).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })}` : ''}`}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={() => setShareModalOpen(true)} className="text-sm px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 font-semibold transition-all shadow-sm hover:shadow-md" title="Share this event">
                Share Event
              </button>
              {userPlan === 'lite' && remainingQuestions !== null && (
                <div className="text-right">
                  <div className="text-xs text-gray-400">This event</div>
  <div className="text-sm font-medium text-gray-700">{remainingQuestions} of 10 left</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {notices.length > 0 && (
        <div className="ticker-wrapper bg-gradient-to-r from-blue-50 via-purple-50 to-green-50 border-b border-gray-200 overflow-hidden flex-shrink-0">
          <div className="flex items-center">
            <div className="flex-shrink-0 px-4 py-2 bg-white/80 border-r border-gray-200">
              <span className="text-xs font-bold text-gray-700 flex items-center gap-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                LIVE
              </span>
            </div>
            <div className="flex-1 overflow-hidden py-2">
              <div className="ticker-track">
                {[...notices, ...notices].map((notice, idx) => {
                  const style = NOTICE_STYLES[notice.category] || NOTICE_STYLES.announcement
                  return (
                    <span key={`${notice.id}-${idx}`} className="inline-flex items-center gap-2 px-6 text-sm text-gray-800">
                      <span className={`inline-block w-2 h-2 rounded-full ${style.dot} flex-shrink-0`}></span>
                      <span className="font-semibold text-gray-700 text-xs uppercase tracking-wide">{style.label}:</span>
                      <span>{notice.message}</span>
                      <span className="text-gray-300 mx-4">*</span>
                    </span>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {userPlan === 'lite' && remainingQuestions !== null && remainingQuestions <= 1 && (
        <div className={`px-6 py-2 border-b text-center text-xs ${remainingQuestions === 0 ? 'bg-red-50 border-red-100 text-red-700' : 'bg-orange-50 border-orange-100 text-orange-700'}`}>
   {remainingQuestions === 0 ? (
            <>You have used all 10 free questions for this event. <a href="/pricing" className="underline font-medium">Upgrade now</a></>
          ) : (
            <>Last free question for this event. <a href="/pricing" className="underline font-medium">Upgrade to PRO</a> for unlimited access.</>
          )}
        </div>
      )}

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
                          hr: () => <hr className="my-4 border-gray-100" />,
                          table: ({ children }) => (
                            <div className="overflow-x-auto mb-4 rounded-lg border border-gray-200">
                              <table className="min-w-full text-sm">{children}</table>
                            </div>
                          ),
                          thead: ({ children }) => <thead className="bg-green-50">{children}</thead>,
                          tbody: ({ children }) => <tbody className="divide-y divide-gray-100 bg-white">{children}</tbody>,
                          tr: ({ children }) => <tr className="hover:bg-gray-50 transition-colors">{children}</tr>,
                          th: ({ children }) => <th className="px-4 py-2.5 text-left text-xs font-semibold text-green-700 border-b border-gray-200">{children}</th>,
                          td: ({ children }) => <td className="px-4 py-2.5 text-gray-700 text-sm">{children}</td>,
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

      <div className="bg-white border-t border-gray-100 px-6 py-4 flex-shrink-0">
        <div className="max-w-4xl mx-auto">
          {limitReached ? (
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-3">Upgrade to continue asking questions about this event</p>
              <a href="/pricing" className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">View Plans</a>
            </div>
          ) : (
            <div className="flex gap-3">
              <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()} placeholder={`Ask about ${event?.name}...`} className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 placeholder-gray-400" disabled={sending} />
              <button onClick={handleSend} disabled={sending || !input.trim()} className="px-6 py-3 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors">
                Send
              </button>
            </div>
          )}
          <p className="text-xs text-gray-400 mt-2 text-center">
            Answers based on uploaded event documents only. Always verify with the Meet Referee or Event Director.
          </p>
        </div>
      </div>
    </div>
  )
}