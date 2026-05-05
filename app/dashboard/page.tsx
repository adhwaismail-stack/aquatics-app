'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase'

const disciplines = [
  { id: 'swimming', name: 'Swimming', code: 'SW Rules', desc: 'Freestyle, backstroke, breaststroke, butterfly, IM and relay rules', isPara: false },
  { id: 'waterpolo', name: 'Water Polo', code: 'WP Rules', desc: 'Field of play, players, referees, gameplay and penalty rules', isPara: false },
  { id: 'artistic', name: 'Artistic Swimming', code: 'AS Rules', desc: 'Solo, duet, team and combo routine rules and judging criteria', isPara: false },
  { id: 'diving', name: 'Diving', code: 'DV Rules', desc: 'Springboard, platform, synchronised diving rules and scoring', isPara: false },
  { id: 'highdiving', name: 'High Diving', code: 'HD Rules', desc: 'Platform heights, entry requirements and competition rules', isPara: false },
  { id: 'masters', name: 'Masters', code: 'MS Rules', desc: 'Age group categories, records and masters competition rules', isPara: false },
  { id: 'openwater', name: 'Open Water', code: 'OW Rules', desc: 'Open water swimming rules, equipment, officials and competition regulations', isPara: false },
  { id: 'paraswimming', name: 'Para Swimming', code: 'WPS Rules', desc: 'Para swimming classifications, rules and competition regulations under World Para Swimming (IPC)', isPara: true },
]

interface UserSubscription {
  plan: string
  selected_discipline: string | null
  status: string
  current_period_end: string | null
  stripe_customer_id: string | null
  full_name: string | null
  country: string | null
}

interface Announcement {
  id: string
  title: string
  description: string
  url: string
  country: string
  is_active: boolean
  open_new_tab: boolean
thumbnail_url: string | null
}

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
  state?: string | null
}

interface InboxMessage {
  id: string
  type: string
  title: string
  body: string
  related_id: string | null
  related_type: string | null
  is_read: boolean
  created_at: string
  link_url: string | null
  link_text: string | null
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

const MALAYSIA_STATES = [
  'Johor', 'Kedah', 'Kelantan', 'Melaka', 'Negeri Sembilan',
  'Pahang', 'Perak', 'Perlis', 'Pulau Pinang', 'Sabah',
  'Sarawak', 'Selangor', 'Terengganu', 'Kuala Lumpur',
  'Labuan', 'Putrajaya'
]

const countryToFlag = (countryName: string): string => {
  const countries: Record<string, string> = {
    'Malaysia': '🇲🇾', 'Singapore': '🇸🇬', 'Indonesia': '🇮🇩', 'Thailand': '🇹🇭',
    'Philippines': '🇵🇭', 'Vietnam': '🇻🇳', 'Brunei': '🇧🇳', 'Myanmar': '🇲🇲',
    'Cambodia': '🇰🇭', 'Laos': '🇱🇦', 'Australia': '🇦🇺', 'New Zealand': '🇳🇿',
    'United Kingdom': '🇬🇧', 'United States': '🇺🇸', 'Canada': '🇨🇦', 'Japan': '🇯🇵',
    'China': '🇨🇳', 'South Korea': '🇰🇷', 'India': '🇮🇳', 'Germany': '🇩🇪',
    'France': '🇫🇷', 'United Arab Emirates': '🇦🇪', 'Hong Kong': '🇭🇰',
  }
  return countries[countryName] || '🌍'
}

async function detectCountry(): Promise<string | null> {
  try {
    const res = await fetch('https://ip-api.com/json/?fields=country')
    const data = await res.json()
    return data.country || null
  } catch {
    return null
  }
}

export default function DashboardPage() {
  const [user, setUser] = useState<{ email?: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [liveDisciplines, setLiveDisciplines] = useState<string[]>([])
  const [subscription, setSubscription] = useState<UserSubscription | null>(null)
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [fullName, setFullName] = useState<string | null>(null)
  const [showBetaWelcome, setShowBetaWelcome] = useState(false)
  const [portalLoading, setPortalLoading] = useState(false)
  const [allEvents, setAllEvents] = useState<AquaEvent[]>([])
  const [userCountry, setUserCountry] = useState<string | null>(null)
  const [noticeCounts, setNoticeCounts] = useState<Record<string, number>>({})
const [eliteCountryFilter, setEliteCountryFilter] = useState<string>('home')
const [announcements, setAnnouncements] = useState<Announcement[]>([])
const [stateFilter, setStateFilter] = useState<string>('all')
const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const [sendingFeedback, setSendingFeedback] = useState(false)
  const [feedbackSent, setFeedbackSent] = useState(false)
  const [showInboxModal, setShowInboxModal] = useState(false)
  const [inboxMessages, setInboxMessages] = useState<InboxMessage[]>([])
  const [inboxUnreadCount, setInboxUnreadCount] = useState(0)
  const [inboxLoading, setInboxLoading] = useState(false)
  const carouselRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const carousel = carouselRef.current
    if (!carousel) return
    let scrollAmount = 0
    const step = 0.5
    const interval = setInterval(() => {
      if (carousel.matches(':hover')) return
      scrollAmount += step
      carousel.scrollLeft = scrollAmount
      if (scrollAmount >= carousel.scrollWidth - carousel.clientWidth) {
        scrollAmount = 0
      }
    }, 20)
    return () => clearInterval(interval)
  }, [allEvents, announcements])

  useEffect(() => {
    const getUser = async () => {
      await supabase.auth.getSession()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      setUser(user)

      const { data: files } = await supabase.from('rulebook_files').select('discipline')
      if (files) setLiveDisciplines([...new Set(files.map((f: { discipline: string }) => f.discipline))])

      const { data: sub, error } = await supabase.from('user_subscriptions').select('plan, selected_discipline, status, current_period_end, stripe_customer_id, full_name, country').eq('user_email', user.email).single()

      if (error || !sub) {
        const country = await detectCountry()
        await supabase.from('user_subscriptions').insert({ user_email: user.email, plan: 'lite', status: 'active', stripe_customer_id: null, current_period_end: null, selected_discipline: null, full_name: null, country })
        window.location.href = '/onboarding'
        return
      }

      if (!sub.country) {
        const country = await detectCountry()
        if (country) { await supabase.from('user_subscriptions').update({ country }).eq('user_email', user.email); sub.country = country }
      }

      if (sub.status === 'active' && !sub.current_period_end && !sub.stripe_customer_id && sub.plan !== 'lite') {
        const expiryDate = new Date(); expiryDate.setDate(expiryDate.getDate() + 14)
        await supabase.from('user_subscriptions').update({ current_period_end: expiryDate.toISOString() }).eq('user_email', user.email)
        sub.current_period_end = expiryDate.toISOString()
      }

      if (sub.full_name) { setFullName(sub.full_name) }
      else if (sub.status === 'active') { window.location.href = '/onboarding'; return }

      if (sub.plan === 'lite' && !sub.selected_discipline && sub.full_name) { window.location.href = '/choose-discipline'; return }

      // Clear any post-auth redirect (used after QR scan signup)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('aquaref_redirect_after_auth')
      }

      setSubscription(sub)
      setUserCountry(sub.country)

      const isElite = sub.plan === 'elite' || sub.plan === 'all_disciplines'

let eventsQuery = supabase.from('events').select('*').eq('is_active', true)
      if (!isElite && sub.country) eventsQuery = eventsQuery.eq('country', sub.country)
      const { data: eventsData } = await eventsQuery.order('start_date', { ascending: true })

      if (eventsData) {
        setAllEvents(eventsData)
        await loadNoticeCounts(eventsData.map(e => e.id))
      }

      // Fetch active announcements for user's country
const { data: announcementsData } = await supabase
        .from('announcements')
        .select('*')
        .eq('is_active', true)
        .or(`country.eq.all,country.eq.${sub.country || 'Malaysia'}`)
        .order('created_at', { ascending: false })
      if (announcementsData) {
        // Filter: show announcement if no state set, OR state matches user's filtered state
        setAnnouncements(announcementsData.filter(a => !a.state || true))
      }

      if (isElite) {
        const savedFilter = localStorage.getItem('aquaref_elite_country_filter')
        if (savedFilter) setEliteCountryFilter(savedFilter)
      }

setLoading(false)

      const isBeta = sub.stripe_customer_id === null && sub.plan !== 'lite' && sub.current_period_end !== null
      if (isBeta && !localStorage.getItem('aquaref_beta_welcome_v1')) setShowBetaWelcome(true)

      // Load inbox messages
      loadInbox(user.email!)
    }
    getUser()
  }, [])

  const loadInbox = async (email: string) => {
    setInboxLoading(true)
    try {
      const res = await fetch(`/api/inbox?userEmail=${encodeURIComponent(email)}&limit=50`)
      const data = await res.json()
      if (data.messages) {
        setInboxMessages(data.messages)
        setInboxUnreadCount(data.unreadCount || 0)
      }
    } catch (err) {
      console.error('Failed to load inbox:', err)
    }
    setInboxLoading(false)
  }

  useEffect(() => {
    if (allEvents.length === 0) return
    const interval = setInterval(() => {
      loadNoticeCounts(allEvents.map(e => e.id))
    }, 60000)
    return () => clearInterval(interval)
  }, [allEvents])

  const loadNoticeCounts = async (eventIds: string[]) => {
    if (eventIds.length === 0) return
    const { data } = await supabase
      .from('event_notices')
      .select('event_id')
      .in('event_id', eventIds)
      .eq('is_active', true)
    if (data) {
      const counts: Record<string, number> = {}
      data.forEach((n: { event_id: string }) => {
        counts[n.event_id] = (counts[n.event_id] || 0) + 1
      })
      setNoticeCounts(counts)
    }
  }

  const handleLogout = async () => { await supabase.auth.signOut(); window.location.href = '/' }

  const handleManageSubscription = async () => {
    if (!user?.email) return
    setPortalLoading(true)
    try {
      const response = await fetch('/api/portal', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userEmail: user.email }) })
      const data = await response.json()
      if (data.url) { window.location.href = data.url } else { alert('Unable to open billing portal. Please contact hello@aquaref.co') }
    } catch { alert('Something went wrong. Please try again.') }
    setPortalLoading(false)
  }

  const isExpired = (sub?: UserSubscription | null) => {
    const s = sub || subscription
    if (s?.plan === 'lite') return false
    if (!s?.current_period_end) return false
    return new Date(s.current_period_end) < new Date()
  }

  const canAccessDiscipline = (disciplineId: string) => {
    if (!subscription) return false
    if (subscription.status !== 'active') return false
    if (subscription.plan === 'lite') return subscription.selected_discipline === disciplineId
    if (subscription.plan === 'pro') { if (isExpired()) return false; return subscription.selected_discipline === disciplineId }
    if (subscription.plan === 'elite') { if (isExpired()) return false; return true }
    if (subscription.plan === 'all_disciplines') { if (isExpired()) return false; return true }
    if (subscription.plan === 'starter') { if (isExpired()) return false; return subscription.selected_discipline === disciplineId }
    return false
  }

  const isBetaTester = () => subscription?.stripe_customer_id === null && subscription?.plan !== 'lite' && subscription?.current_period_end !== null

  const getPlanName = () => {
    if (!subscription) return 'No Plan'
    if (isBetaTester()) return 'Beta Access — All Disciplines'
    if (subscription.plan === 'elite') return 'AquaRef ELITE'
    if (subscription.plan === 'pro') return 'AquaRef PRO'
    if (subscription.plan === 'lite') return 'AquaRef LITE'
    if (subscription.plan === 'all_disciplines') return 'All Disciplines Plan'
    if (subscription.plan === 'starter') return 'Starter Plan'
    return 'Unknown Plan'
  }

  const getPlanPrice = () => {
    if (isBetaTester()) return 'Free (Beta)'
    if (subscription?.plan === 'elite') return 'RM39.99/month'
    if (subscription?.plan === 'pro') return 'RM14.99/month'
    if (subscription?.plan === 'lite') return 'Free forever'
    if (subscription?.plan === 'all_disciplines') return 'RM27.99/month'
    if (subscription?.plan === 'starter') return 'RM11.99/month'
    return '-'
  }

  const getQuestionsPerDay = () => {
    if (subscription?.plan === 'elite') return 'Unlimited'
    if (subscription?.plan === 'pro') return '50'
    if (subscription?.plan === 'lite') return '10'
    if (subscription?.plan === 'all_disciplines') return '200'
    return '50'
  }

  const getEventQuestionLabel = () => {
    if (subscription?.plan === 'elite' || subscription?.plan === 'all_disciplines') return 'Unlimited'
    if (subscription?.plan === 'pro') return '50/day'
    if (subscription?.plan === 'lite') return '10 free questions'
    return '10 free questions'
  }

  const handleDisciplineClick = (disciplineId: string) => { if (canAccessDiscipline(disciplineId)) window.location.href = `/chat/${disciplineId}` }
  const handleDismissBetaWelcome = () => { localStorage.setItem('aquaref_beta_welcome_v1', 'seen'); setShowBetaWelcome(false) }
  const isElite = subscription?.plan === 'elite' || subscription?.plan === 'all_disciplines'

  const handleCountryFilterChange = (value: string) => {
    setEliteCountryFilter(value)
    localStorage.setItem('aquaref_elite_country_filter', value)
  }

const events = (() => {
    let filtered = allEvents
    if (isElite) {
      if (eliteCountryFilter === 'home' && userCountry) filtered = filtered.filter(e => e.country === userCountry)
      else if (eliteCountryFilter !== 'all') filtered = filtered.filter(e => e.country === eliteCountryFilter)
    }
    if (stateFilter !== 'all') filtered = filtered.filter(e => e.state === stateFilter)
    return filtered
  })()

  const availableStates = [...new Set(allEvents.filter(e => e.state).map(e => e.state as string))].sort()

  const availableCountries = [...new Set(allEvents.map(e => e.country))].sort()

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-gray-400 text-sm">Loading your dashboard...</div></div>
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <style jsx global>{`
   .carousel-scroll::-webkit-scrollbar { display: none; }
        .carousel-scroll { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes carousel-auto-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .carousel-auto { animation: carousel-auto-scroll 30s linear infinite; display: flex; }
        .carousel-auto:hover { animation-play-state: paused; }
      `}</style>

      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <a href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center"><span className="text-white font-bold text-sm">A</span></div>
            <span className="font-bold text-xl text-gray-900">AquaRef</span>
          </a>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 hidden md:block">{user?.email}</span>
            {(subscription?.plan === 'pro' || subscription?.plan === 'lite' || subscription?.plan === 'starter') && !isExpired() && (
              <button onClick={() => { window.location.href = '/choose-discipline' }} className="text-sm text-blue-600 hover:text-blue-700 font-medium">Switch Discipline</button>
            )}
       <button onClick={() => { setShowFeedbackModal(true); setFeedbackSent(false); setFeedbackMessage('') }} className="text-sm bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">💬 Feedback</button>
            <button
              onClick={() => setShowInboxModal(true)}
              className="relative text-sm bg-white border border-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-colors flex items-center gap-1.5"
              title="Inbox"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="hidden md:inline">Inbox</span>
              {inboxUnreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center">
                  {inboxUnreadCount > 99 ? '99+' : inboxUnreadCount}
                </span>
              )}
            </button>
            <button onClick={() => setShowPlanModal(true)} className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">My Plan</button>
            <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-gray-600">Logout</button>
          </div>
        </div>
      </div>

      {showBetaWelcome && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center"><span className="text-white font-bold text-sm">A</span></div>
              <span className="font-bold text-lg text-gray-900">AquaRef</span>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium ml-1">Beta</span>
            </div>
            <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
              <p>Dear {fullName || 'Beta Tester'},</p>
              <p>Thank you for being part of the <strong>AquaRef Beta programme</strong>.</p>
              <p>Please test the AI for your discipline and share honest feedback. Your insights as a Technical Official are invaluable.</p>
              <p><strong className="text-purple-700">Para Swimming</strong> is now available, powered by <strong>World Para Swimming (WPS)</strong> under IPC.</p>
              <p>Share feedback using the like and dislike buttons after each answer.</p>
              <div className="pt-2 border-t border-gray-100"><p>Sincerely,</p><p className="font-semibold text-gray-900 mt-1">Adhwa</p></div>
            </div>
            <button onClick={handleDismissBetaWelcome} className="w-full mt-6 bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700">Got it, thanks!</button>
          </div>
        </div>
      )}

{showFeedbackModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-gray-900">Send Feedback</h3>
              <button onClick={() => setShowFeedbackModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            {feedbackSent ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">🙏</div>
                <p className="font-semibold text-gray-900 mb-1">Thank you!</p>
                <p className="text-sm text-gray-500">Your feedback has been received. We read every message.</p>
                <button onClick={() => setShowFeedbackModal(false)} className="mt-6 w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Close</button>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-500 mb-4">Share your thoughts, suggestions, or report any issues. We read every message.</p>
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-3 bg-gray-50 rounded-lg px-3 py-2">
                    <span className="text-xs text-gray-400">From:</span>
                    <span className="text-xs text-gray-700 font-medium">{user?.email}</span>
                  </div>
                  <textarea
                    value={feedbackMessage}
                    onChange={(e) => setFeedbackMessage(e.target.value)}
                    rows={5}
                    placeholder="Type your message here..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 placeholder-gray-400 resize-none"
                  />
                  <p className="text-xs text-gray-400 mt-1 text-right">{feedbackMessage.length} / 1000</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setShowFeedbackModal(false)} className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
                  <button
                    onClick={async () => {
                      if (!feedbackMessage.trim()) return
                      setSendingFeedback(true)
                      try {
                        await supabase.from('user_messages').insert({
                          user_email: user?.email,
                          message: feedbackMessage.trim().slice(0, 1000)
                        })
                        setFeedbackSent(true)
                      } catch {
                        alert('Something went wrong. Please try again.')
                      }
                      setSendingFeedback(false)
                    }}
                    disabled={sendingFeedback || !feedbackMessage.trim()}
                    className="flex-1 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                  >
                    {sendingFeedback ? 'Sending...' : 'Send Message'}
                  </button>
                </div>
     </>
            )}
          </div>
        </div>
      )}

      {showInboxModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">Inbox</h3>
                  <p className="text-xs text-gray-400">
                    {inboxUnreadCount > 0 ? `${inboxUnreadCount} unread` : 'All caught up'}
                  </p>
                </div>
              </div>
              <button onClick={() => setShowInboxModal(false)} className="text-gray-400 hover:text-gray-600 text-xl px-2">✕</button>
            </div>

            {/* Mark all as read button */}
            {inboxUnreadCount > 0 && (
              <div className="px-6 py-3 border-b border-gray-100 flex-shrink-0 bg-blue-50">
                <button
                  onClick={async () => {
                    try {
                      await fetch('/api/inbox', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ userEmail: user?.email, action: 'mark_all_read' })
                      })
                      setInboxMessages(prev => prev.map(m => ({ ...m, is_read: true })))
                      setInboxUnreadCount(0)
                    } catch (err) {
                      console.error('Mark all read failed:', err)
                    }
                  }}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  Mark all as read
                </button>
              </div>
            )}

            {/* Messages list */}
            <div className="flex-1 overflow-y-auto">
              {inboxLoading ? (
                <div className="p-8 text-center">
                  <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-sm text-gray-400">Loading messages...</p>
                </div>
              ) : inboxMessages.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Your inbox is empty</p>
                  <p className="text-xs text-gray-400">You&apos;ll see notifications here when there&apos;s something new.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {inboxMessages.map((msg) => (
                 <div
                      key={msg.id}
                      className={`px-6 py-4 transition-colors ${!msg.is_read ? 'bg-blue-50/50' : ''}`}
                    >
                      <div
                        onClick={async () => {
                          if (msg.is_read) return
                          try {
                            await fetch('/api/inbox', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ userEmail: user?.email, action: 'mark_read', messageId: msg.id })
                            })
                            setInboxMessages(prev => prev.map(m => m.id === msg.id ? { ...m, is_read: true } : m))
                            setInboxUnreadCount(prev => Math.max(0, prev - 1))
                          } catch (err) {
                            console.error('Mark read failed:', err)
                          }
                        }}
                        className="cursor-pointer hover:bg-gray-50 -mx-6 -my-4 px-6 py-4 rounded transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          {!msg.is_read && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5 flex-shrink-0" />
                          )}
                          <div className={`flex-1 min-w-0 ${msg.is_read ? 'pl-5' : ''}`}>
                            <div className="flex items-start justify-between gap-3 mb-1">
                              <p className={`text-sm ${!msg.is_read ? 'font-semibold text-gray-900' : 'font-medium text-gray-600'}`}>
                                {msg.title}
                              </p>
                              <p className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
                                {new Date(msg.created_at).toLocaleDateString('en-MY', { day: 'numeric', month: 'short' })}
                              </p>
                            </div>
                            <p className={`text-xs leading-relaxed ${!msg.is_read ? 'text-gray-700' : 'text-gray-500'}`}>
                              {msg.body}
                            </p>
                          </div>
                        </div>
                      </div>
                      {msg.link_url && msg.link_text && (
                        <div className={`mt-3 ${!msg.is_read ? 'pl-5' : 'pl-5'}`}>
                          <a
                            href={msg.link_url}
                            target={msg.link_url.startsWith('http') ? '_blank' : '_self'}
                            rel={msg.link_url.startsWith('http') ? 'noopener noreferrer' : ''}
                            onClick={async (e) => {
                              e.stopPropagation()
                              if (!msg.is_read) {
                                try {
                                  await fetch('/api/inbox', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ userEmail: user?.email, action: 'mark_read', messageId: msg.id })
                                  })
                                  setInboxMessages(prev => prev.map(m => m.id === msg.id ? { ...m, is_read: true } : m))
                                  setInboxUnreadCount(prev => Math.max(0, prev - 1))
                                } catch (err) {
                                  console.error('Mark read failed:', err)
                                }
                              }
                            }}
                            className="inline-flex items-center gap-1.5 text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 font-medium transition-colors"
                          >
                            {msg.link_text}
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-gray-100 flex-shrink-0 bg-gray-50">
              <p className="text-xs text-gray-400 text-center">
                {inboxMessages.length > 0 ? `Showing ${inboxMessages.length} message${inboxMessages.length !== 1 ? 's' : ''}` : 'No messages yet'}
              </p>
            </div>
          </div>
        </div>
      )}

      {showPlanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg text-gray-900">My Plan</h3>
              <button onClick={() => setShowPlanModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <div className={`border rounded-xl p-4 mb-4 ${subscription?.plan === 'elite' ? 'bg-gray-900 border-gray-700' : subscription?.plan === 'lite' ? 'bg-green-50 border-green-100' : 'bg-blue-50 border-blue-100'}`}>
              <p className={`text-xs mb-1 ${subscription?.plan === 'elite' ? 'text-yellow-400' : subscription?.plan === 'lite' ? 'text-green-600' : 'text-blue-500'}`}>Current Plan</p>
              <p className={`font-bold text-lg ${subscription?.plan === 'elite' ? 'text-white' : subscription?.plan === 'lite' ? 'text-green-900' : 'text-blue-900'}`}>{getPlanName()}</p>
              <p className={`text-sm mt-1 ${subscription?.plan === 'elite' ? 'text-gray-400' : subscription?.plan === 'lite' ? 'text-green-700' : 'text-blue-700'}`}>{getPlanPrice()}</p>
            </div>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm"><span className="text-gray-500">Status</span><span className="font-medium text-green-600">Active</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Email</span><span className="text-gray-700 text-xs">{user?.email}</span></div>
              {subscription?.country && <div className="flex justify-between text-sm"><span className="text-gray-500">Country</span><span className="text-gray-700">{subscription.country}</span></div>}
              {subscription?.current_period_end && subscription?.plan !== 'lite' && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">{isBetaTester() ? 'Beta expires' : 'Renews on'}</span>
                  <span className="text-gray-700">{new Date(subscription.current_period_end).toLocaleDateString('en-MY', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
              )}
              {subscription?.plan === 'lite' && <div className="flex justify-between text-sm"><span className="text-gray-500">Expiry</span><span className="text-green-600 font-medium">Never — Free forever</span></div>}
              {(subscription?.plan === 'pro' || subscription?.plan === 'lite' || subscription?.plan === 'starter') && subscription.selected_discipline && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Discipline</span>
                  <span className="text-gray-700">{disciplines.find(d => d.id === subscription.selected_discipline)?.name}</span>
                </div>
              )}
              <div className="flex justify-between text-sm"><span className="text-gray-500">Questions</span><span className="text-gray-700">{getQuestionsPerDay()}</span></div>
            </div>
            <div className="space-y-2">
              {!isBetaTester() && subscription?.stripe_customer_id && (
                <button onClick={handleManageSubscription} disabled={portalLoading} className="w-full py-2.5 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-900 disabled:opacity-50">
                  {portalLoading ? 'Opening...' : 'Manage Subscription'}
                </button>
              )}
              {(subscription?.plan === 'lite' || subscription?.plan === 'pro' || subscription?.plan === 'starter' || isExpired() || !subscription) && (
                <button onClick={() => { setShowPlanModal(false); window.location.href = '/pricing' }} className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                  {isExpired() ? 'Renew Subscription' : 'Upgrade Plan'}
                </button>
              )}
              <button onClick={() => setShowPlanModal(false)} className="w-full py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50">Close</button>
            </div>
            <p className="text-xs text-gray-400 text-center mt-4">For billing help, contact <a href="mailto:hello@aquaref.co" className="text-blue-500">hello@aquaref.co</a></p>
          </div>
        </div>
      )}

      <div className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900 mb-1">Welcome back{fullName ? `, ${fullName}` : ''}</h1>
          <p className="text-gray-500 text-sm">Select a discipline to get instant AI-powered rules answers</p>
        </div>

        {isExpired() && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-4 flex items-center justify-between">
            <div><p className="text-sm font-medium text-red-900">Your access has expired</p><p className="text-xs text-red-600 mt-0.5">Subscribe to continue</p></div>
            <button onClick={() => { window.location.href = '/pricing' }} className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700">View Plans</button>
          </div>
        )}

        {isBetaTester() && !isExpired() && (
          <div className="bg-green-50 border border-green-100 rounded-xl p-4 mb-4 flex items-center justify-between">
            <div><p className="text-sm font-medium text-green-900">Beta Access — All Disciplines</p><p className="text-xs text-green-600 mt-0.5">Expires: {new Date(subscription!.current_period_end!).toLocaleDateString('en-MY', { day: 'numeric', month: 'long', year: 'numeric' })}</p></div>
            <button onClick={() => { window.location.href = '/pricing' }} className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700">Subscribe Now</button>
          </div>
        )}

        {subscription?.plan === 'lite' && (
          <div className="bg-green-50 border border-green-100 rounded-xl p-4 mb-4 flex items-center justify-between">
            <div><p className="text-sm font-medium text-green-900">AquaRef LITE — Free Forever</p><p className="text-xs text-green-600 mt-0.5">10 questions/month · 1 discipline</p></div>
            <button onClick={() => { window.location.href = '/pricing' }} className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700">Upgrade</button>
          </div>
        )}

        {subscription?.plan === 'pro' && !isExpired() && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4 flex items-center justify-between">
            <div><p className="text-sm font-medium text-blue-900">AquaRef PRO</p><p className="text-xs text-blue-600 mt-0.5">50 questions/day · {subscription.selected_discipline ? disciplines.find(d => d.id === subscription.selected_discipline)?.name : 'No discipline'}</p></div>
            <button onClick={() => { window.location.href = '/pricing' }} className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700">Upgrade to ELITE</button>
          </div>
        )}

        {!subscription && (
          <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 mb-4 flex items-center justify-between">
            <div><p className="text-sm font-medium text-yellow-900">No active subscription</p></div>
            <button onClick={() => { window.location.href = '/pricing' }} className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700">View Plans</button>
          </div>
        )}

        <div className="grid grid-cols-3 gap-2 mb-6">
          <div className="bg-white rounded-xl border border-gray-100 p-3 text-center">
            <div className="text-lg font-bold text-blue-600">{liveDisciplines.length}</div>
            <div className="text-xs text-gray-400 mt-0.5">Disciplines</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-3 text-center">
            <div className="text-lg font-bold text-blue-600 truncate">{getQuestionsPerDay()}</div>
            <div className="text-xs text-gray-400 mt-0.5">Questions/{subscription?.plan === 'lite' ? 'mo' : 'day'}</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-3 text-center">
            <div className="text-lg font-bold text-blue-600">90+</div>
            <div className="text-xs text-gray-400 mt-0.5">Languages</div>
          </div>
        </div>

        {allEvents.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Live Events ({events.length})</h2>
                {!isElite && (
                  <p className="text-xs text-gray-400 mt-0.5">Events in {countryToFlag(userCountry || '')} {userCountry || 'your country'}</p>
                )}
              </div>

              {isElite && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">Viewing:</span>
                  <select
                    value={eliteCountryFilter}
                    onChange={(e) => handleCountryFilterChange(e.target.value)}
                    className="text-xs bg-white border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 font-medium cursor-pointer hover:border-blue-300"
                  >
                    {userCountry && (
                      <option value="home">{countryToFlag(userCountry)} {userCountry} (Home)</option>
                    )}
                    <option value="all">All countries</option>
                    {availableCountries.map(country => (
                      <option key={country} value={country}>{countryToFlag(country)} {country}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

         {availableStates.length > 0 && (
              <div className="mb-3 flex items-center gap-2">
                <span className="text-xs text-gray-400">State:</span>
                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => setStateFilter('all')} className={`text-xs px-3 py-1 rounded-full font-medium border transition-colors ${stateFilter === 'all' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-500 border-gray-200 hover:border-blue-300'}`}>All</button>
                  {availableStates.map(state => (
                    <button key={state} onClick={() => setStateFilter(state)} className={`text-xs px-3 py-1 rounded-full font-medium border transition-colors ${stateFilter === state ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-500 border-gray-200 hover:border-blue-300'}`}>{state}</button>
                  ))}
                </div>
              </div>
            )}

            {!isElite && subscription?.plan !== undefined && (
              <div className="mb-3 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-100 rounded-lg px-3 py-2 flex items-center justify-between flex-wrap gap-2">
                <p className="text-xs text-gray-700">
                  <span className="font-medium">Want to see events from other countries?</span>
                  <span className="text-gray-500"> Upgrade to ELITE for global event access.</span>
                </p>
                <button
                  onClick={() => { window.location.href = '/pricing' }}
                  className="text-xs bg-yellow-500 hover:bg-yellow-600 text-white font-medium px-3 py-1 rounded-lg whitespace-nowrap"
                >
                  Upgrade to ELITE →
                </button>
              </div>
            )}

            {events.length === 0 ? (
              <div className="bg-white border border-gray-100 rounded-xl p-8 text-center">
                <p className="text-sm font-medium text-gray-700 mb-1">
                  No live events {eliteCountryFilter !== 'all' ? `in ${eliteCountryFilter === 'home' ? userCountry : eliteCountryFilter}` : 'right now'}
                </p>
                <p className="text-xs text-gray-400">
                  Try switching to &quot;All countries&quot; to see global events.
                </p>
              </div>
            ) : (
              <>
                {events.length > 2 && (
                  <p className="text-xs text-gray-400 mb-2 md:hidden">Swipe to see more</p>
                )}
             <div ref={carouselRef} className="carousel-scroll flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
                  {announcements.map((ann) => (
                    <div
                      key={ann.id}
                      className="flex-shrink-0 w-[280px] md:w-[320px] snap-start bg-white rounded-xl border border-orange-100 overflow-hidden hover:border-orange-300 hover:shadow-md transition-all cursor-pointer"
                      onClick={() => {
const resolvedUrl = ann.url.startsWith('http')
                          ? ann.url
                          : ann.url.startsWith('/')
                          ? ann.url
                          : `/${ann.url}`
                        if (ann.open_new_tab) {
                          window.open(resolvedUrl, '_blank')
                        } else {
                          window.location.href = resolvedUrl
                        }
                      }}
                    >
                      {ann.thumbnail_url ? (
                        <img src={ann.thumbnail_url} alt={ann.title} className="w-full object-cover" style={{ aspectRatio: '1200/630' }} />
                      ) : (
                        <div className="w-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center px-6" style={{ aspectRatio: '1200/630' }}>
                          <span className="text-white font-bold text-base text-center leading-snug">{ann.title}</span>
                        </div>
                      )}
                      <div className="p-3">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 mr-2 min-w-0">
                            <h3 className="font-semibold text-gray-900 text-sm truncate">{ann.title}</h3>
                            {ann.description && (
                              <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{ann.description}</p>
                            )}
                          </div>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 flex-shrink-0">Info</span>
                        </div>
                        <div className="flex items-center justify-end">
                          <button className="text-xs bg-orange-500 text-white px-3 py-1 rounded-lg hover:bg-orange-600 font-medium">
                            {ann.open_new_tab ? 'Buka →' : 'Lihat →'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {events.map((event) => {
                    const noticeCount = noticeCounts[event.id] || 0
                    return (
                      <div
                        key={event.id}
                        className="flex-shrink-0 w-[280px] md:w-[320px] snap-start bg-white rounded-xl border border-green-100 overflow-hidden hover:border-green-300 hover:shadow-md transition-all cursor-pointer relative"
                        onClick={() => { window.location.href = `/events/${event.slug}` }}
                      >
                        {noticeCount > 0 && (
                          <div className="absolute top-3 right-3 z-10">
                            <div className="relative flex items-center gap-1.5 bg-red-500 text-white px-2.5 py-1 rounded-full shadow-lg">
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                              </span>
                              <span className="text-xs font-bold">
                                {noticeCount} <span className="hidden sm:inline">live</span>
                              </span>
                            </div>
                          </div>
                        )}

                        {event.poster_url && (
                          <img src={event.poster_url} alt={event.name} className="w-full object-cover" style={{ aspectRatio: '1200/630' }} />
                        )}
                        <div className="p-3">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 mr-2 min-w-0">
                              <h3 className="font-semibold text-gray-900 text-sm truncate">{event.name}</h3>
                              <p className="text-xs text-gray-400 mt-0.5 truncate">
                                {countryToFlag(event.country)} {event.country} · {event.location}
                              </p>
                            </div>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 flex-shrink-0 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                              Live
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                            <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{DISCIPLINE_LABELS[event.discipline] || event.discipline}</span>
                            {event.start_date && (
                              <span className="text-xs text-gray-400">
                                {new Date(event.start_date).toLocaleDateString('en-MY', { day: 'numeric', month: 'short' })}
                                {event.end_date ? `–${new Date(event.end_date).toLocaleDateString('en-MY', { day: 'numeric', month: 'short' })}` : ''}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400">{getEventQuestionLabel()}</span>
                            <button className="text-xs bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 font-medium">Open →</button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-base font-semibold text-gray-900 mb-3">Choose a discipline</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {disciplines.map((d) => {
              const isLive = liveDisciplines.includes(d.id)
              const hasAccess = canAccessDiscipline(d.id)
              const isSelected = subscription?.selected_discipline === d.id
              return (
                <div key={d.id} className={`bg-white rounded-xl border p-5 transition-all flex flex-col ${!isLive ? 'border-gray-100 opacity-50' : hasAccess ? `${d.isPara ? 'border-purple-200 hover:border-purple-400' : 'border-blue-200 hover:border-blue-400'} hover:shadow-sm cursor-pointer` : 'border-gray-200'}`}>
                  <div className="flex items-center justify-end mb-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${!isLive ? 'bg-gray-100 text-gray-400' : isSelected ? `${d.isPara ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}` : hasAccess ? `${d.isPara ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}` : 'bg-gray-100 text-gray-400'}`}>
                      {!isLive ? 'Coming Soon' : isSelected ? 'Your Plan' : hasAccess ? 'Live' : 'Locked'}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1 text-sm">{d.name}</h3>
                  <p className={`text-xs mb-1 ${d.isPara ? 'text-purple-500 font-medium' : 'text-gray-400'}`}>{d.code}</p>
                  {d.isPara && <p className="text-xs text-purple-400 mb-1">World Para Swimming (IPC)</p>}
                  <p className="text-xs text-gray-400 mb-3 leading-relaxed flex-1">{d.desc}</p>
                  {!isLive ? (
                    <button disabled className="w-full bg-gray-50 text-gray-300 py-2 rounded-lg text-sm font-medium cursor-not-allowed border border-gray-100">Coming Soon</button>
                  ) : hasAccess ? (
                    <button onClick={() => handleDisciplineClick(d.id)} className={`w-full py-2 rounded-lg text-sm font-medium transition-colors text-white ${d.isPara ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'}`}>Ask Rules Question →</button>
                  ) : (
                    <button onClick={() => { window.location.href = subscription?.plan === 'lite' ? '/choose-discipline' : '/pricing' }} className="w-full bg-gray-100 text-gray-500 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                      {subscription?.plan === 'lite' ? 'Select This Discipline' : isExpired() ? 'Renew Access' : 'Upgrade to Access'}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
          <p className="text-xs text-gray-400 mt-3">* Para Swimming rules are governed by World Para Swimming (WPS) under IPC, independent of World Aquatics.</p>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <h3 className="font-semibold text-blue-900 mb-2 text-sm">How AquaRef works</h3>
          <div className="grid md:grid-cols-2 gap-2">
            {['Ask any rules question in your language', 'AI answers only from official World Aquatics Regulations', 'Every answer includes the exact rule number', 'Always verify with your Meet Referee for official decisions'].map((tip, i) => (
              <p key={i} className="text-xs text-blue-700">• {tip}</p>
            ))}
          </div>
        </div>
      </div>

      <footer className="border-t border-gray-100 bg-white px-6 py-4 mt-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center"><span className="text-white font-bold text-xs">A</span></div>
            <span className="font-bold text-gray-900 text-sm">AquaRef</span>
          </div>
          <p className="text-xs text-gray-400 text-center">For reference only. Always verify with official World Aquatics Regulations and your Meet Referee.</p>
          <div className="flex gap-5 text-xs text-gray-400">
            <a href="/privacy-policy" className="hover:text-gray-600">Privacy Policy</a>
            <a href="/terms-of-service" className="hover:text-gray-600">Terms</a>
            <a href="/contact" className="hover:text-gray-600">Contact Us</a>
          </div>
        </div>
      </footer>
    </div>
  )
}