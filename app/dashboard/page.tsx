'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const disciplines = [
  { id: 'swimming', name: 'Swimming', code: 'SW Rules', icon: '🏊', desc: 'Freestyle, backstroke, breaststroke, butterfly, IM and relay rules', isPara: false },
  { id: 'waterpolo', name: 'Water Polo', code: 'WP Rules', icon: '🤽', desc: 'Field of play, players, referees, gameplay and penalty rules', isPara: false },
  { id: 'artistic', name: 'Artistic Swimming', code: 'AS Rules', icon: '💃', desc: 'Solo, duet, team and combo routine rules and judging criteria', isPara: false },
  { id: 'diving', name: 'Diving', code: 'DV Rules', icon: '🤿', desc: 'Springboard, platform, synchronised diving rules and scoring', isPara: false },
  { id: 'highdiving', name: 'High Diving', code: 'HD Rules', icon: '🏔️', desc: 'Platform heights, entry requirements and competition rules', isPara: false },
  { id: 'masters', name: 'Masters', code: 'MS Rules', icon: '🏅', desc: 'Age group categories, records and masters competition rules', isPara: false },
  { id: 'openwater', name: 'Open Water', code: 'OW Rules', icon: '🌊', desc: 'Open water swimming rules, equipment, officials and competition regulations', isPara: false },
  { id: 'paraswimming', name: 'Para Swimming', code: 'WPS Rules', icon: '🏋️', desc: 'Para swimming classifications, rules and competition regulations under World Para Swimming (IPC)', isPara: true },
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
  const [events, setEvents] = useState<AquaEvent[]>([])
  const [userCountry, setUserCountry] = useState<string | null>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = '/login'
        return
      }
      setUser(user)

      const { data: files } = await supabase
        .from('rulebook_files')
        .select('discipline')

      if (files) {
        const live = [...new Set(files.map((f: { discipline: string }) => f.discipline))]
        setLiveDisciplines(live)
      }

      const { data: sub, error } = await supabase
        .from('user_subscriptions')
        .select('plan, selected_discipline, status, current_period_end, stripe_customer_id, full_name, country')
        .eq('user_email', user.email)
        .single()

      if (error || !sub) {
        const country = await detectCountry()
        await supabase.from('user_subscriptions').insert({
          user_email: user.email,
          plan: 'lite',
          status: 'active',
          stripe_customer_id: null,
          current_period_end: null,
          selected_discipline: null,
          full_name: null,
          country
        })
        window.location.href = '/onboarding'
        return
      }

      if (!sub.country) {
        const country = await detectCountry()
        if (country) {
          await supabase
            .from('user_subscriptions')
            .update({ country })
            .eq('user_email', user.email)
          sub.country = country
        }
      }

      if (sub.status === 'active' && !sub.current_period_end && !sub.stripe_customer_id && sub.plan !== 'lite') {
        const expiryDate = new Date()
        expiryDate.setDate(expiryDate.getDate() + 14)
        await supabase
          .from('user_subscriptions')
          .update({ current_period_end: expiryDate.toISOString() })
          .eq('user_email', user.email)
        sub.current_period_end = expiryDate.toISOString()
      }

      if (sub.full_name) {
        setFullName(sub.full_name)
      } else if (sub.status === 'active') {
        window.location.href = '/onboarding'
        return
      }

      if (sub.plan === 'lite' && !sub.selected_discipline && sub.full_name) {
        window.location.href = '/choose-discipline'
        return
      }

      setSubscription(sub)
      setUserCountry(sub.country)

      // Load events based on plan
      const isElite = sub.plan === 'elite' || sub.plan === 'all_disciplines'
      let eventsQuery = supabase.from('events').select('*').eq('is_active', true)
      if (!isElite && sub.country) {
        eventsQuery = eventsQuery.eq('country', sub.country)
      }
      const { data: eventsData } = await eventsQuery.order('start_date', { ascending: true })
      if (eventsData) setEvents(eventsData)

      setLoading(false)

      const isBeta = sub.stripe_customer_id === null &&
        sub.plan !== 'lite' &&
        sub.current_period_end !== null
      if (isBeta) {
        const hasSeenWelcome = localStorage.getItem('aquaref_beta_welcome_v1')
        if (!hasSeenWelcome) {
          setShowBetaWelcome(true)
        }
      }
    }
    getUser()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const handleManageSubscription = async () => {
    if (!user?.email) return
    setPortalLoading(true)
    try {
      const response = await fetch('/api/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail: user.email })
      })
      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert('Unable to open billing portal. Please contact hello@aquaref.co')
      }
    } catch {
      alert('Something went wrong. Please try again.')
    }
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
    if (subscription.plan === 'pro') {
      if (isExpired()) return false
      return subscription.selected_discipline === disciplineId
    }
    if (subscription.plan === 'elite') {
      if (isExpired()) return false
      return true
    }
    if (subscription.plan === 'all_disciplines') {
      if (isExpired()) return false
      return true
    }
    if (subscription.plan === 'starter') {
      if (isExpired()) return false
      return subscription.selected_discipline === disciplineId
    }
    return false
  }

  const isBetaTester = () => {
    return subscription?.stripe_customer_id === null &&
      subscription?.plan !== 'lite' &&
      subscription?.current_period_end !== null
  }

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
    if (subscription?.plan === 'lite') return '5'
    if (subscription?.plan === 'all_disciplines') return '200'
    return '50'
  }

  const handleDisciplineClick = (disciplineId: string) => {
    if (canAccessDiscipline(disciplineId)) {
      window.location.href = `/chat/${disciplineId}`
    }
  }

  const handleDismissBetaWelcome = () => {
    localStorage.setItem('aquaref_beta_welcome_v1', 'seen')
    setShowBetaWelcome(false)
  }

  const isElite = subscription?.plan === 'elite' || subscription?.plan === 'all_disciplines'

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading your dashboard...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <a href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="font-bold text-xl text-gray-900">AquaRef</span>
          </a>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 hidden md:block">{user?.email}</span>
            {(subscription?.plan === 'pro' || subscription?.plan === 'lite' || subscription?.plan === 'starter') && !isExpired() && (
              <button onClick={() => { window.location.href = '/choose-discipline' }} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Switch Discipline
              </button>
            )}
            <button onClick={() => setShowPlanModal(true)} className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              My Plan
            </button>
            <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-gray-600">
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Beta Welcome Modal */}
      {showBetaWelcome && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="font-bold text-lg text-gray-900">AquaRef</span>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium ml-1">Beta</span>
            </div>
            <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
              <p>Dear {fullName || 'Beta Tester'},</p>
              <p>Thank you so much for being part of the <strong>AquaRef Beta programme</strong>. Your support and feedback mean a lot to me as I work to make this tool truly useful for the aquatics community.</p>
              <p>I would greatly appreciate it if you could test the AI for your respective discipline and share your honest feedback — whether the answers are accurate, helpful, and properly cited. Your insights as a Technical Official are invaluable.</p>
              <p>I'm also excited to share that <strong className="text-purple-700">Para Swimming 🏋️</strong> is now available on AquaRef, powered by the official <strong>World Para Swimming (WPS)</strong> regulations under IPC. Feel free to explore it!</p>
              <p>You can share your feedback directly in the chat using the <strong>👍</strong> or <strong>👎</strong> buttons after each answer.</p>
              <div className="pt-2 border-t border-gray-100">
                <p>Sincerely,</p>
                <p className="font-semibold text-gray-900 mt-1">Adhwa</p>
              </div>
            </div>
            <button onClick={handleDismissBetaWelcome} className="w-full mt-6 bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors">
              Got it, thanks! 🙏
            </button>
          </div>
        </div>
      )}

      {/* Plan Modal */}
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
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Status</span>
                <span className="font-medium text-green-600">Active</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Email</span>
                <span className="text-gray-700">{user?.email}</span>
              </div>
              {subscription?.country && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Country</span>
                  <span className="text-gray-700">{subscription.country}</span>
                </div>
              )}
              {subscription?.current_period_end && subscription?.plan !== 'lite' && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">{isBetaTester() ? 'Beta expires' : 'Renews on'}</span>
                  <span className="text-gray-700">{new Date(subscription.current_period_end).toLocaleDateString('en-MY', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
              )}
              {subscription?.plan === 'lite' && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Expiry</span>
                  <span className="text-green-600 font-medium">Never — Free forever</span>
                </div>
              )}
              {(subscription?.plan === 'pro' || subscription?.plan === 'lite' || subscription?.plan === 'starter') && subscription.selected_discipline && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Selected Discipline</span>
                  <span className="text-gray-700 capitalize">{disciplines.find(d => d.id === subscription.selected_discipline)?.name}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Questions</span>
                <span className="text-gray-700">{getQuestionsPerDay()}</span>
              </div>
            </div>
            <div className="space-y-2">
              {!isBetaTester() && subscription?.stripe_customer_id && (
                <button onClick={handleManageSubscription} disabled={portalLoading} className="w-full py-2.5 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-900 disabled:opacity-50 transition-colors">
                  {portalLoading ? 'Opening...' : '⚙️ Manage Subscription'}
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

      {/* Main content */}
      <div className="flex-1 max-w-6xl mx-auto w-full px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome back{fullName ? `, ${fullName}` : ''}! 👋</h1>
          <p className="text-gray-500">Select a discipline to get instant AI-powered rules answers</p>
        </div>

        {isExpired() && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-900">Your access has expired</p>
              <p className="text-xs text-red-600 mt-0.5">Subscribe to continue accessing AquaRef</p>
            </div>
            <button onClick={() => { window.location.href = '/pricing' }} className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700">View Plans</button>
          </div>
        )}

        {isBetaTester() && !isExpired() && (
          <div className="bg-green-50 border border-green-100 rounded-xl p-4 mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-900">✅ Beta Access — All Disciplines</p>
              <p className="text-xs text-green-600 mt-0.5">Access expires: {new Date(subscription!.current_period_end!).toLocaleDateString('en-MY', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
            <button onClick={() => { window.location.href = '/pricing' }} className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700">Subscribe Now</button>
          </div>
        )}

        {subscription?.plan === 'lite' && (
          <div className="bg-green-50 border border-green-100 rounded-xl p-4 mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-900">🆓 AquaRef LITE — Free Forever</p>
              <p className="text-xs text-green-600 mt-0.5">5 questions per month · 1 discipline · Upgrade anytime for more access</p>
            </div>
            <button onClick={() => { window.location.href = '/pricing' }} className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700">Upgrade</button>
          </div>
        )}

        {subscription?.plan === 'pro' && !isExpired() && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-900">AquaRef PRO — {subscription.selected_discipline ? `${disciplines.find(d => d.id === subscription.selected_discipline)?.name} selected` : 'No discipline selected'}</p>
              <p className="text-xs text-blue-600 mt-0.5">50 questions/day · Switch discipline once every 30 days</p>
            </div>
            <button onClick={() => { window.location.href = '/pricing' }} className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700">Upgrade to ELITE</button>
          </div>
        )}

        {subscription?.plan === 'starter' && !isExpired() && !isBetaTester() && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-900">Starter Plan — {subscription.selected_discipline ? `${disciplines.find(d => d.id === subscription.selected_discipline)?.name} selected` : 'No discipline selected'}</p>
              <p className="text-xs text-blue-600 mt-0.5">You can switch your discipline once per month</p>
            </div>
            <button onClick={() => { window.location.href = '/pricing' }} className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700">Upgrade Plan</button>
          </div>
        )}

        {!subscription && (
          <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-900">No active subscription</p>
              <p className="text-xs text-yellow-600 mt-0.5">Subscribe to access the AI rules assistant</p>
            </div>
            <button onClick={() => { window.location.href = '/pricing' }} className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700">View Plans</button>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{liveDisciplines.length}</div>
            <div className="text-xs text-gray-400 mt-1">Disciplines available</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{getQuestionsPerDay()}</div>
            <div className="text-xs text-gray-400 mt-1">Questions {subscription?.plan === 'lite' ? 'per month' : 'per day'}</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">90+</div>
            <div className="text-xs text-gray-400 mt-1">Languages supported</div>
          </div>
        </div>

        {/* Disciplines */}
        <div className="mb-10">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Choose a discipline</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {disciplines.map((d) => {
              const isLive = liveDisciplines.includes(d.id)
              const hasAccess = canAccessDiscipline(d.id)
              const isSelected = subscription?.selected_discipline === d.id

              return (
                <div key={d.id} className={`bg-white rounded-xl border p-6 transition-all ${!isLive ? 'border-gray-100 opacity-50' : hasAccess ? `${d.isPara ? 'border-purple-200 hover:border-purple-400' : 'border-blue-200 hover:border-blue-400'} hover:shadow-sm cursor-pointer` : 'border-gray-200'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl">{d.icon}</span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${!isLive ? 'bg-gray-100 text-gray-400' : isSelected ? `${d.isPara ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}` : hasAccess ? `${d.isPara ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}` : 'bg-gray-100 text-gray-400'}`}>
                      {!isLive ? 'Coming Soon' : isSelected ? '● Your Plan' : hasAccess ? '● Live' : '🔒 Locked'}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{d.name}</h3>
                  <p className={`text-xs mb-1 ${d.isPara ? 'text-purple-500 font-medium' : 'text-gray-400'}`}>{d.code}</p>
                  {d.isPara && <p className="text-xs text-purple-400 mb-1">World Para Swimming (IPC)</p>}
                  <p className="text-xs text-gray-400 mb-4 leading-relaxed">{d.desc}</p>
                  {!isLive ? (
                    <button disabled className="w-full bg-gray-50 text-gray-300 py-2.5 rounded-lg text-sm font-medium cursor-not-allowed border border-gray-100">Coming Soon</button>
                  ) : hasAccess ? (
                    <button onClick={() => handleDisciplineClick(d.id)} className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors text-white ${d.isPara ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'}`}>Ask Rules Question →</button>
                  ) : (
                    <button onClick={() => { window.location.href = subscription?.plan === 'lite' ? '/choose-discipline' : '/pricing' }} className="w-full bg-gray-100 text-gray-500 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                      {subscription?.plan === 'lite' ? 'Select This Discipline' : isExpired() ? 'Renew Access' : 'Upgrade to Access'}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
          <p className="text-xs text-gray-400 mt-4">* Para Swimming rules are governed by World Para Swimming (WPS) under the International Paralympic Committee (IPC), independent of World Aquatics.</p>
        </div>

        {/* Events Section */}
        {events.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">🏆 Live Events</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {isElite ? 'Showing events from all countries (ELITE access)' : `Showing events in ${userCountry || 'your country'}`}
                </p>
              </div>
              {!isElite && (
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                  🌍 ELITE: see all global events
                </span>
              )}
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {events.map((event) => (
                <div key={event.id} className="bg-white rounded-xl border border-green-100 p-5 hover:border-green-300 hover:shadow-sm transition-all cursor-pointer" onClick={() => { window.location.href = `/events/${event.slug}` }}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">{event.name}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">{countryToFlag(event.country)} {event.country} · 📍 {event.location}</p>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 flex-shrink-0 ml-2">🟢 Live</span>
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{DISCIPLINE_LABELS[event.discipline] || event.discipline}</span>
                    {event.start_date && (
                      <span className="text-xs text-gray-400">
                        📅 {new Date(event.start_date).toLocaleDateString('en-MY', { day: 'numeric', month: 'short' })}
                        {event.end_date ? ` — ${new Date(event.end_date).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })}` : ''}
                      </span>
                    )}
                  </div>
                  {event.description && <p className="text-xs text-gray-400 mb-3 line-clamp-2">{event.description}</p>}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      {subscription?.plan === 'lite' ? '3 free questions' : 'Unlimited questions'}
                    </span>
                    <button className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 font-medium">
                      Open Event AI →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-3">How AquaRef works</h3>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              '✓ Ask any rules question in your language',
              '✓ AI answers only from official World Aquatics Regulations',
              '✓ Every answer includes the exact rule number',
              '✓ Always verify with your Meet Referee for official decisions'
            ].map((tip, i) => (
              <p key={i} className="text-sm text-blue-700">{tip}</p>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white px-6 py-6 mt-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">A</span>
            </div>
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