'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'

const ADMIN_PASSWORD = 'aquaref-admin-2026'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface ChatLog {
  id: string
  user_email: string
  discipline: string
  question: string
  answer: string
  created_at: string
  input_tokens?: number
  output_tokens?: number
}

interface CorrectionNote {
  id: string
  discipline: string
  question: string
  correct_note: string
  created_at: string
}

interface RulebookFile {
  id: string
  discipline: string
  file_name: string
  original_name: string
  chunk_count: number
  uploaded_at: string
}

interface Subscriber {
  id: string
  email: string
  plan: string
  status: string
  current_period_end: string
  created_at: string
}

interface UserSubscription {
  id: string
  user_email: string
  plan: string
  status: string
  current_period_end: string
  stripe_customer_id: string | null
  full_name: string | null
  selected_discipline: string | null
  created_at: string
  country?: string | null
}

interface FeedbackItem {
  id: string
  user_email: string
  feedback: string
  discipline: string
  question: string
  answer: string
  created_at: string
}

interface BetaUser {
  id: string
  user_email: string
  plan: string
  status: string
  current_period_end: string
  stripe_customer_id: string | null
  created_at: string
}

interface DailyUsage {
  date: string
  count: number
}

interface TokenLog {
  input_tokens: number
  output_tokens: number
  created_at: string
}

const DISCIPLINES = [
  { name: 'Swimming', code: 'SW', discipline: 'swimming' },
  { name: 'Water Polo', code: 'WP', discipline: 'waterpolo' },
  { name: 'Artistic Swimming', code: 'AS', discipline: 'artistic' },
  { name: 'Diving', code: 'DV', discipline: 'diving' },
  { name: 'High Diving', code: 'HD', discipline: 'highdiving' },
  { name: 'Masters', code: 'MS', discipline: 'masters' },
  { name: 'Open Water', code: 'OW', discipline: 'openwater' },
]

const DISCIPLINE_LABELS: Record<string, string> = {
  swimming: 'Swimming',
  waterpolo: 'Water Polo',
  artistic: 'Artistic Swimming',
  diving: 'Diving',
  highdiving: 'High Diving',
  masters: 'Masters',
  openwater: 'Open Water',
}

const countryToFlag = (countryName: string): string => {
  const countries: Record<string, string> = {
    'Malaysia': '🇲🇾',
    'Singapore': '🇸🇬',
    'Indonesia': '🇮🇩',
    'Thailand': '🇹🇭',
    'Philippines': '🇵🇭',
    'Vietnam': '🇻🇳',
    'Brunei': '🇧🇳',
    'Myanmar': '🇲🇲',
    'Cambodia': '🇰🇭',
    'Laos': '🇱🇦',
    'Australia': '🇦🇺',
    'New Zealand': '🇳🇿',
    'United Kingdom': '🇬🇧',
    'United States': '🇺🇸',
    'Canada': '🇨🇦',
    'Japan': '🇯🇵',
    'China': '🇨🇳',
    'South Korea': '🇰🇷',
    'India': '🇮🇳',
    'Germany': '🇩🇪',
    'France': '🇫🇷',
    'Netherlands': '🇳🇱',
    'Spain': '🇪🇸',
    'Italy': '🇮🇹',
    'United Arab Emirates': '🇦🇪',
    'Saudi Arabia': '🇸🇦',
    'Qatar': '🇶🇦',
    'Bahrain': '🇧🇭',
    'Kuwait': '🇰🇼',
    'Egypt': '🇪🇬',
    'South Africa': '🇿🇦',
    'Nigeria': '🇳🇬',
    'Kenya': '🇰🇪',
    'Hong Kong': '🇭🇰',
    'Taiwan': '🇹🇼',
    'Pakistan': '🇵🇰',
    'Bangladesh': '🇧🇩',
    'Sri Lanka': '🇱🇰',
  }
  return countries[countryName] || '🌍'
}

const getPlanLabel = (plan: string) => {
  if (plan === 'lite') return 'LITE'
  if (plan === 'pro') return 'PRO'
  if (plan === 'elite') return 'ELITE'
  if (plan === 'all_disciplines') return 'ELITE (legacy)'
  if (plan === 'starter') return 'PRO (legacy)'
  return plan
}

const getPlanColor = (plan: string) => {
  if (plan === 'elite' || plan === 'all_disciplines') return 'bg-yellow-100 text-yellow-800'
  if (plan === 'pro' || plan === 'starter') return 'bg-blue-100 text-blue-700'
  if (plan === 'lite') return 'bg-green-100 text-green-700'
  return 'bg-gray-100 text-gray-500'
}

function ExpandableAnswer({ answer }: { answer: string }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div>
      <p className={`text-sm text-gray-500 ${expanded ? '' : 'line-clamp-2'}`}>A: {answer}</p>
      <button onClick={() => setExpanded(!expanded)} className="text-xs text-blue-500 hover:text-blue-600 mt-1">
        {expanded ? '▲ Show less' : '▼ Show full answer'}
      </button>
    </div>
  )
}

function SimpleBarChart({ data }: { data: { label: string, value: number }[] }) {
  const max = Math.max(...data.map(d => d.value), 1)
  return (
    <div className="space-y-2">
      {data.map((d, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="text-xs text-gray-500 w-28 truncate">{d.label}</div>
          <div className="flex-1 bg-gray-100 rounded-full h-5 relative">
            <div className="bg-blue-500 h-5 rounded-full transition-all" style={{ width: `${(d.value / max) * 100}%` }} />
            <span className="absolute right-2 top-0 text-xs text-gray-600 leading-5">{d.value}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function AdminPage() {
  const [password, setPassword] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('rulebooks')
  const [uploading, setUploading] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<string>('')
  const [systemPrompt, setSystemPrompt] = useState('')
  const [promptSaved, setPromptSaved] = useState(false)
  const [promptLoading, setPromptLoading] = useState(false)
  const [chatLogs, setChatLogs] = useState<ChatLog[]>([])
  const [corrections, setCorrections] = useState<CorrectionNote[]>([])
  const [selectedLog, setSelectedLog] = useState<ChatLog | null>(null)
  const [correctionText, setCorrectionText] = useState('')
  const [savingCorrection, setSavingCorrection] = useState(false)
  const [logsLoading, setLogsLoading] = useState(false)
  const [logDisciplineFilter, setLogDisciplineFilter] = useState('all')
  const [logKeyword, setLogKeyword] = useState('')
  const [logDateFrom, setLogDateFrom] = useState('')
  const [logDateTo, setLogDateTo] = useState('')
  const [correctionKeyword, setCorrectionKeyword] = useState('')
  const [correctionDiscipline, setCorrectionDiscipline] = useState('all')
  const [rulebookFiles, setRulebookFiles] = useState<Record<string, RulebookFile[]>>({})
  const [deletingFile, setDeletingFile] = useState<string | null>(null)
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [userSubscriptions, setUserSubscriptions] = useState<UserSubscription[]>([])
  const [subscribersLoading, setSubscribersLoading] = useState(false)
  const [feedback, setFeedback] = useState<FeedbackItem[]>([])
  const [feedbackFilter, setFeedbackFilter] = useState('all')
  const [feedbackDiscipline, setFeedbackDiscipline] = useState('all')
  const [feedbackLoading, setFeedbackLoading] = useState(false)
  const [dailyUsage, setDailyUsage] = useState<DailyUsage[]>([])
  const [analyticsLoading, setAnalyticsLoading] = useState(false)
  const [betaUsers, setBetaUsers] = useState<BetaUser[]>([])
  const [betaLoading, setBetaLoading] = useState(false)
  const [betaEmail, setBetaEmail] = useState('')
  const [betaDays, setBetaDays] = useState('14')
  const [grantingBeta, setGrantingBeta] = useState(false)
  const [extendEmail, setExtendEmail] = useState<string | null>(null)
  const [extendDays, setExtendDays] = useState('14')
  const [tokenLogs, setTokenLogs] = useState<TokenLog[]>([])
  const [lastLogins, setLastLogins] = useState<Record<string, string>>({})

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true)
      setError('')
      loadSystemPrompt()
      loadAllFiles()
      loadChatLogs()
      loadCorrections()
      loadSubscribers()
    } else {
      setError('Incorrect password')
    }
  }

  const loadSystemPrompt = async () => {
    setPromptLoading(true)
    const { data } = await supabase.from('system_prompts').select('prompt').eq('discipline', 'all').single()
    if (data) setSystemPrompt(data.prompt)
    setPromptLoading(false)
  }

  const loadAllFiles = useCallback(async () => {
    const filesByDiscipline: Record<string, RulebookFile[]> = {}
    for (const d of DISCIPLINES) {
      const res = await fetch(`/api/files?discipline=${d.discipline}`)
      const data = await res.json()
      filesByDiscipline[d.discipline] = data.files || []
    }
    setRulebookFiles(filesByDiscipline)
  }, [])

  const loadChatLogs = async () => {
    setLogsLoading(true)
    const { data } = await supabase.from('chat_logs').select('*').order('created_at', { ascending: false }).limit(100)
    if (data) {
      setChatLogs(data)
      const loginMap: Record<string, string> = {}
      data.forEach((log: ChatLog) => {
        if (!loginMap[log.user_email] || new Date(log.created_at) > new Date(loginMap[log.user_email])) {
          loginMap[log.user_email] = log.created_at
        }
      })
      setLastLogins(loginMap)
    }
    setLogsLoading(false)
  }

  const loadCorrections = async () => {
    const { data } = await supabase.from('correction_notes').select('*').order('created_at', { ascending: false })
    if (data) setCorrections(data)
  }

  const loadSubscribers = async () => {
    setSubscribersLoading(true)
    const { data: subs } = await supabase.from('subscribers').select('*').order('created_at', { ascending: false })
    if (subs) setSubscribers(subs)
    const { data: userSubs } = await supabase.from('user_subscriptions').select('*').order('created_at', { ascending: false })
    if (userSubs) setUserSubscriptions(userSubs)
    setSubscribersLoading(false)
  }

  const loadFeedback = async () => {
    setFeedbackLoading(true)
    const { data } = await supabase.from('answer_feedback').select('*').order('created_at', { ascending: false })
    if (data) setFeedback(data)
    setFeedbackLoading(false)
  }

  const loadBetaUsers = async () => {
    setBetaLoading(true)
    const { data } = await supabase
      .from('user_subscriptions')
      .select('*')
      .is('stripe_customer_id', null)
      .eq('status', 'active')
      .gt('current_period_end', new Date().toISOString())
      .order('created_at', { ascending: false })
    if (data) setBetaUsers(data)
    setBetaLoading(false)
  }

  const loadAnalytics = async () => {
    setAnalyticsLoading(true)
    const { data: usageData } = await supabase.from('daily_usage').select('date, count').order('date', { ascending: false }).limit(14)
    if (usageData) setDailyUsage(usageData)
    const { data: tokenData } = await supabase
      .from('chat_logs')
      .select('input_tokens, output_tokens, created_at')
      .not('input_tokens', 'is', null)
    if (tokenData) setTokenLogs(tokenData)
    setAnalyticsLoading(false)
  }

  useEffect(() => {
    if (activeTab === 'chat logs') loadChatLogs()
    if (activeTab === 'corrections') loadCorrections()
    if (activeTab === 'subscribers') loadSubscribers()
    if (activeTab === 'feedback') loadFeedback()
    if (activeTab === 'beta users') loadBetaUsers()
    if (activeTab === 'analytics') { loadAnalytics(); loadFeedback(); loadSubscribers(); loadChatLogs() }
  }, [activeTab])

  const handleSavePrompt = async () => {
    setPromptLoading(true)
    await supabase.from('system_prompts').update({ prompt: systemPrompt, updated_at: new Date().toISOString() }).eq('discipline', 'all')
    setPromptLoading(false)
    setPromptSaved(true)
    setTimeout(() => setPromptSaved(false), 3000)
  }

  const handleAddCorrection = async () => {
    if (!selectedLog || !correctionText.trim()) return
    setSavingCorrection(true)
    await supabase.from('correction_notes').insert({
      discipline: selectedLog.discipline,
      question: selectedLog.question,
      wrong_answer: selectedLog.answer,
      correct_note: correctionText.trim()
    })
    setSavingCorrection(false)
    setCorrectionText('')
    setSelectedLog(null)
    alert('✅ Correction saved!')
    loadCorrections()
  }

  const handleDeleteCorrection = async (id: string) => {
    if (!confirm('Delete this correction?')) return
    await supabase.from('correction_notes').delete().eq('id', id)
    loadCorrections()
  }

  const handleDeleteFile = async (file: RulebookFile) => {
    if (!confirm(`Delete "${file.original_name}"?`)) return
    setDeletingFile(file.id)
    try {
      await fetch('/api/files', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId: file.id, discipline: file.discipline, originalName: file.original_name, fileName: file.file_name })
      })
      await loadAllFiles()
    } catch {
      alert('Failed to delete file.')
    }
    setDeletingFile(null)
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, discipline: string) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(discipline)
    setUploadProgress('Preparing upload...')
    try {
      const fileName = `${discipline}/${Date.now()}_${file.name}`
      const { data: signedData, error: signedError } = await supabase.storage.from('rulebook').createSignedUploadUrl(fileName)
      if (signedError || !signedData) throw new Error(`Could not create upload URL: ${signedError?.message}`)
      setUploadProgress('Uploading file to storage...')
      const uploadResponse = await fetch(signedData.signedUrl, { method: 'PUT', headers: { 'Content-Type': file.type || 'application/pdf' }, body: file })
      if (!uploadResponse.ok) throw new Error(`Direct upload failed: ${uploadResponse.statusText}`)
      setUploadProgress('Generating AI embeddings...')
      const response = await fetch('/api/upload', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fileName, discipline, originalName: file.name }) })
      const data = await response.json()
      if (data.success) {
        setUploadProgress('')
        alert(`✓ Successfully processed ${data.chunks} chunks from ${file.name}`)
        await loadAllFiles()
      } else throw new Error(data.error)
    } catch (err) {
      alert('Upload failed: ' + (err instanceof Error ? err.message : 'Unknown error'))
      setUploadProgress('')
    }
    setUploading(null)
    e.target.value = ''
  }

  const handleGrantBeta = async () => {
    if (!betaEmail.trim()) return
    setGrantingBeta(true)
    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() + parseInt(betaDays))
    const { data: existing } = await supabase.from('user_subscriptions').select('id').eq('user_email', betaEmail.trim().toLowerCase()).single()
    if (existing) {
      await supabase.from('user_subscriptions').update({ plan: 'elite', status: 'active', current_period_end: expiryDate.toISOString(), stripe_customer_id: null }).eq('user_email', betaEmail.trim().toLowerCase())
    } else {
      await supabase.from('user_subscriptions').insert({ user_email: betaEmail.trim().toLowerCase(), plan: 'elite', status: 'active', current_period_end: expiryDate.toISOString(), stripe_customer_id: null })
    }
    alert(`✅ Beta access granted to ${betaEmail} for ${betaDays} days`)
    setBetaEmail('')
    setBetaDays('14')
    setGrantingBeta(false)
    loadBetaUsers()
  }

  const handleExtendBeta = async (email: string) => {
    const days = parseInt(extendDays)
    const { data: user } = await supabase.from('user_subscriptions').select('current_period_end').eq('user_email', email).single()
    if (!user) return
    const currentExpiry = new Date(user.current_period_end)
    const newExpiry = new Date(Math.max(currentExpiry.getTime(), Date.now()))
    newExpiry.setDate(newExpiry.getDate() + days)
    await supabase.from('user_subscriptions').update({ current_period_end: newExpiry.toISOString(), status: 'active' }).eq('user_email', email)
    alert(`✅ Extended by ${days} days. New expiry: ${newExpiry.toLocaleDateString()}`)
    setExtendEmail(null)
    loadBetaUsers()
  }

  const handleRevokeBeta = async (email: string) => {
    if (!confirm(`Revoke beta access for ${email}? They will lose access immediately.`)) return
    await supabase.from('user_subscriptions').update({ status: 'cancelled', current_period_end: new Date().toISOString() }).eq('user_email', email)
    alert(`✅ Beta access revoked for ${email}`)
    loadBetaUsers()
  }

  const filteredLogs = chatLogs
    .filter(l => logDisciplineFilter === 'all' || l.discipline === logDisciplineFilter)
    .filter(l => {
      if (!logKeyword) return true
      const kw = logKeyword.toLowerCase()
      return l.question?.toLowerCase().includes(kw) || l.answer?.toLowerCase().includes(kw) || l.user_email?.toLowerCase().includes(kw)
    })
    .filter(l => {
      if (logDateFrom && new Date(l.created_at) < new Date(logDateFrom)) return false
      if (logDateTo && new Date(l.created_at) > new Date(logDateTo + 'T23:59:59')) return false
      return true
    })

  const filteredCorrections = corrections
    .filter(c => correctionDiscipline === 'all' || c.discipline === correctionDiscipline)
    .filter(c => {
      if (!correctionKeyword) return true
      const kw = correctionKeyword.toLowerCase()
      return c.question?.toLowerCase().includes(kw) || c.correct_note?.toLowerCase().includes(kw)
    })

  const filteredFeedback = feedback
    .filter(f => feedbackFilter === 'all' || f.feedback === feedbackFilter)
    .filter(f => feedbackDiscipline === 'all' || f.discipline === feedbackDiscipline)

  const liteSubs = userSubscriptions.filter(s => s.plan === 'lite' && s.status === 'active')
  const proSubs = userSubscriptions.filter(s => (s.plan === 'pro' || s.plan === 'starter') && s.status === 'active' && s.stripe_customer_id)
  const eliteSubs = userSubscriptions.filter(s => (s.plan === 'elite' || s.plan === 'all_disciplines') && s.status === 'active' && s.stripe_customer_id)
  const estimatedMRR = (proSubs.length * 14.99) + (eliteSubs.length * 39.99)

  const totalLikes = feedback.filter(f => f.feedback === 'like').length
  const totalDislikes = feedback.filter(f => f.feedback === 'dislike').length
  const satisfactionRate = feedback.length > 0 ? Math.round((totalLikes / feedback.length) * 100) : 0

  const disciplineUsage = DISCIPLINES.map(d => ({
    label: d.name,
    value: chatLogs.filter(l => l.discipline === d.discipline).length
  })).filter(d => d.value > 0).sort((a, b) => b.value - a.value)

  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    const usage = dailyUsage.find(u => u.date === dateStr)
    return { label: d.toLocaleDateString('en-MY', { weekday: 'short', day: 'numeric' }), value: usage?.count || 0 }
  }).reverse()

  const newSubsLast30Days = userSubscriptions.filter(s => {
    const created = new Date(s.created_at)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    return created > thirtyDaysAgo && s.stripe_customer_id !== null
  }).length

  const totalInputTokens = tokenLogs.reduce((sum, l) => sum + (l.input_tokens || 0), 0)
  const totalOutputTokens = tokenLogs.reduce((sum, l) => sum + (l.output_tokens || 0), 0)
  const costRM = ((totalInputTokens * 0.0000008) + (totalOutputTokens * 0.000004)) * 4.5

  const thisMonthStart = new Date()
  thisMonthStart.setDate(1)
  thisMonthStart.setHours(0, 0, 0, 0)
  const thisMonthLogs = tokenLogs.filter(l => new Date(l.created_at) >= thisMonthStart)
  const thisMonthInputTokens = thisMonthLogs.reduce((sum, l) => sum + (l.input_tokens || 0), 0)
  const thisMonthOutputTokens = thisMonthLogs.reduce((sum, l) => sum + (l.output_tokens || 0), 0)
  const thisMonthCostRM = ((thisMonthInputTokens * 0.0000008) + (thisMonthOutputTokens * 0.000004)) * 4.5

  const userQuestionCounts = chatLogs.reduce((acc, log) => {
    acc[log.user_email] = (acc[log.user_email] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const top10Users = Object.entries(userQuestionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)

  const last10Logins = [...chatLogs]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .filter((log, index, self) => self.findIndex(l => l.user_email === log.user_email) === index)
    .slice(0, 10)

  const countryCounts = userSubscriptions
    .filter(s => s.country)
    .reduce((acc, s) => {
      acc[s.country!] = (acc[s.country!] || 0) + 1
      return acc
    }, {} as Record<string, number>)

  const countryData = Object.entries(countryCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([label, value]) => ({ label: `${countryToFlag(label)} ${label}`, value }))

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="font-bold text-xl text-gray-900">AquaRef Admin</span>
            </div>
            <p className="text-gray-500 text-sm">Admin access only</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-8">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Admin password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} placeholder="Enter admin password" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <button onClick={handleLogin} className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700">Login to Admin</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="font-bold text-xl text-gray-900">AquaRef Admin</span>
          </div>
          <button onClick={() => setAuthenticated(false)} className="text-sm text-gray-400 hover:text-gray-600">Logout</button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total users', value: userSubscriptions.length.toString() },
            { label: 'Paid subscribers', value: (proSubs.length + eliteSubs.length).toString() },
            { label: 'Questions today', value: chatLogs.filter(l => l.created_at?.startsWith(new Date().toISOString().split('T')[0])).length.toString() },
            { label: 'Corrections saved', value: corrections.length.toString() },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{s.value}</div>
              <div className="text-xs text-gray-400 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {['rulebooks', 'system prompt', 'chat logs', 'corrections', 'feedback', 'beta users', 'subscribers', 'analytics'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${activeTab === tab ? 'bg-blue-600 text-white' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'}`}>
              {tab}
            </button>
          ))}
        </div>

        {/* Rulebooks tab */}
        {activeTab === 'rulebooks' && (
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-2">Rulebook Management</h2>
            <p className="text-sm text-gray-400 mb-6">Upload multiple PDF or TXT files per discipline</p>
            {uploadProgress && <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-700">⏳ {uploadProgress}</div>}
            <div className="space-y-4">
              {DISCIPLINES.map((d) => {
                const files = rulebookFiles[d.discipline] || []
                return (
                  <div key={d.code} className="border border-gray-100 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-medium text-gray-900">{d.name}</h3>
                        <p className="text-xs text-gray-400">{d.code} Rules</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${files.length > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                        {files.length > 0 ? `${files.length} file${files.length > 1 ? 's' : ''} uploaded` : 'No files'}
                      </span>
                    </div>
                    {files.length > 0 && (
                      <div className="mb-3 space-y-2">
                        {files.map((file) => (
                          <div key={file.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                            <div className="flex items-center gap-2">
                              <span className="text-green-600">📄</span>
                              <div>
                                <p className="text-sm text-gray-700 font-medium">{file.original_name}</p>
                                <p className="text-xs text-gray-400">{file.chunk_count} chunks · {new Date(file.uploaded_at).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <button onClick={() => handleDeleteFile(file)} disabled={deletingFile === file.id} className="text-xs text-red-500 hover:text-red-600 font-medium disabled:opacity-50">
                              {deletingFile === file.id ? 'Deleting...' : 'Delete'}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <label className="cursor-pointer block">
                      <div className={`w-full text-center border py-2 rounded-lg text-sm transition-colors ${uploading === d.discipline ? 'border-gray-200 text-gray-400' : 'border-blue-200 text-blue-600 hover:bg-blue-50'}`}>
                        {uploading === d.discipline ? 'Processing...' : files.length > 0 ? '+ Add another document' : 'Upload PDF or TXT'}
                      </div>
                      <input type="file" accept=".pdf,.txt" className="hidden" disabled={uploading !== null} onChange={(e) => handleUpload(e, d.discipline)} />
                    </label>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* System Prompt tab */}
        {activeTab === 'system prompt' && (
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-2">System Prompt Editor</h2>
            <p className="text-sm text-gray-400 mb-4">This controls how the AI behaves for ALL disciplines.</p>
            {promptLoading ? <div className="text-center py-8 text-gray-400">Loading...</div> : (
              <>
                <textarea value={systemPrompt} onChange={(e) => setSystemPrompt(e.target.value)} rows={16} className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700" />
                <div className="flex items-center justify-between mt-4">
                  <p className="text-xs text-gray-400">Tip: Add TC clarifications or rule corrections directly here</p>
                  <button onClick={handleSavePrompt} disabled={promptLoading} className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                    {promptSaved ? 'Saved! ✓' : 'Save Changes'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Chat Logs tab */}
        {activeTab === 'chat logs' && (
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold text-gray-900">Chat Logs</h2>
              <button onClick={loadChatLogs} className="text-sm text-blue-600 hover:text-blue-700">Refresh</button>
            </div>
            <div className="mb-4">
              <input type="text" value={logKeyword} onChange={(e) => setLogKeyword(e.target.value)} placeholder="Search by keyword, email, question or answer..." className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 placeholder-gray-400" />
            </div>
            <div className="flex gap-3 mb-4">
              <div className="flex-1">
                <label className="block text-xs text-gray-400 mb-1">Date from</label>
                <input type="date" value={logDateFrom} onChange={(e) => setLogDateFrom(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700" />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-gray-400 mb-1">Date to</label>
                <input type="date" value={logDateTo} onChange={(e) => setLogDateTo(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700" />
              </div>
              <div className="flex items-end">
                <button onClick={() => { setLogKeyword(''); setLogDateFrom(''); setLogDateTo(''); setLogDisciplineFilter('all') }} className="px-4 py-2 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50">Clear</button>
              </div>
            </div>
            <div className="flex gap-2 mb-6 flex-wrap">
              {['all', 'swimming', 'waterpolo', 'artistic', 'diving', 'highdiving', 'masters', 'openwater'].map((tab) => {
                const count = tab === 'all' ? chatLogs.length : chatLogs.filter(l => l.discipline === tab).length
                return (
                  <button key={tab} onClick={() => setLogDisciplineFilter(tab)} className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${logDisciplineFilter === tab ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                    {tab === 'all' ? 'All' : tab === 'waterpolo' ? 'Water Polo' : tab === 'highdiving' ? 'High Diving' : tab === 'openwater' ? 'Open Water' : tab.charAt(0).toUpperCase() + tab.slice(1)} ({count})
                  </button>
                )
              })}
            </div>
            {logsLoading ? <div className="text-center py-8 text-gray-400">Loading...</div> : filteredLogs.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p className="text-4xl mb-4">💬</p>
                <p className="font-medium text-gray-500">No conversations found</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-gray-400">Showing {filteredLogs.length} result{filteredLogs.length !== 1 ? 's' : ''}</p>
                {filteredLogs.map((log) => (
                  <div key={log.id} className="border border-gray-100 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">{DISCIPLINE_LABELS[log.discipline] || log.discipline}</span>
                        <span className="text-xs text-gray-400">{log.user_email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {log.input_tokens && <span className="text-xs text-gray-300">{(log.input_tokens + (log.output_tokens || 0)).toLocaleString()} tokens</span>}
                        <span className="text-xs text-gray-400">{new Date(log.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-gray-900 mb-1">Q: {log.question}</p>
                    <ExpandableAnswer answer={log.answer} />
                    <button onClick={() => { setSelectedLog(log); setCorrectionText('') }} className="mt-2 text-xs text-orange-600 hover:text-orange-700 font-medium">✏️ Add Correction</button>
                  </div>
                ))}
              </div>
            )}
            {selectedLog && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl p-6 max-w-lg w-full">
                  <h3 className="font-semibold text-gray-900 mb-4">Add Correction Note</h3>
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Original question:</p>
                    <p className="text-sm text-gray-700">{selectedLog.question}</p>
                  </div>
                  <div className="mb-4 p-3 bg-red-50 rounded-lg">
                    <p className="text-xs text-red-500 mb-1">Wrong/incomplete answer:</p>
                    <p className="text-sm text-gray-700 line-clamp-3">{selectedLog.answer}</p>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Correct information:</label>
                    <textarea value={correctionText} onChange={(e) => setCorrectionText(e.target.value)} rows={4} placeholder="Type the correct answer..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 text-gray-900" />
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setSelectedLog(null)} className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                    <button onClick={handleAddCorrection} disabled={savingCorrection || !correctionText.trim()} className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                      {savingCorrection ? 'Saving...' : 'Save Correction'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Corrections tab */}
        {activeTab === 'corrections' && (
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-semibold text-gray-900">Correction Notes</h2>
                <p className="text-sm text-gray-400 mt-1">These override AI answers for similar questions</p>
              </div>
              <button onClick={loadCorrections} className="text-sm text-blue-600 hover:text-blue-700">Refresh</button>
            </div>
            <div className="mb-4">
              <input type="text" value={correctionKeyword} onChange={(e) => setCorrectionKeyword(e.target.value)} placeholder="Search by question or correction..." className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 placeholder-gray-400" />
            </div>
            <div className="flex gap-2 mb-6 flex-wrap">
              {['all', 'swimming', 'waterpolo', 'artistic', 'diving', 'highdiving', 'masters', 'openwater'].map((tab) => {
                const count = tab === 'all' ? corrections.length : corrections.filter(c => c.discipline === tab).length
                return (
                  <button key={tab} onClick={() => setCorrectionDiscipline(tab)} className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${correctionDiscipline === tab ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                    {tab === 'all' ? 'All' : tab === 'waterpolo' ? 'Water Polo' : tab === 'highdiving' ? 'High Diving' : tab === 'openwater' ? 'Open Water' : tab.charAt(0).toUpperCase() + tab.slice(1)} ({count})
                  </button>
                )
              })}
            </div>
            {filteredCorrections.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p className="text-4xl mb-4">✏️</p>
                <p className="font-medium text-gray-500">No corrections found</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-gray-400">Showing {filteredCorrections.length} result{filteredCorrections.length !== 1 ? 's' : ''}</p>
                {filteredCorrections.map((c) => (
                  <div key={c.id} className="border border-gray-100 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">{DISCIPLINE_LABELS[c.discipline] || c.discipline}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-400">{new Date(c.created_at).toLocaleDateString()}</span>
                        <button onClick={() => handleDeleteCorrection(c.id)} className="text-xs text-red-500 hover:text-red-600">Delete</button>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-gray-900 mb-1">Q: {c.question}</p>
                    <p className="text-sm text-green-700 bg-green-50 p-2 rounded-lg">✓ {c.correct_note}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Feedback tab */}
        {activeTab === 'feedback' && (
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-semibold text-gray-900">User Feedback</h2>
                <p className="text-sm text-gray-400 mt-1">Like/dislike ratings from users</p>
              </div>
              <button onClick={loadFeedback} className="text-sm text-blue-600 hover:text-blue-700">Refresh</button>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-green-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-green-600">👍 {totalLikes}</div>
                <div className="text-xs text-gray-400 mt-1">Helpful</div>
              </div>
              <div className="bg-red-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-red-500">👎 {totalDislikes}</div>
                <div className="text-xs text-gray-400 mt-1">Not Helpful</div>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{satisfactionRate}%</div>
                <div className="text-xs text-gray-400 mt-1">Satisfaction Rate</div>
              </div>
            </div>
            <div className="flex gap-3 mb-4 flex-wrap">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Rating</label>
                <div className="flex gap-2">
                  {['all', 'like', 'dislike'].map(f => (
                    <button key={f} onClick={() => setFeedbackFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${feedbackFilter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                      {f === 'all' ? 'All' : f === 'like' ? '👍 Helpful' : '👎 Not Helpful'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Discipline</label>
                <div className="flex gap-2 flex-wrap">
                  {['all', 'swimming', 'waterpolo', 'openwater', 'artistic', 'diving', 'highdiving', 'masters'].map(d => (
                    <button key={d} onClick={() => setFeedbackDiscipline(d)} className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${feedbackDiscipline === d ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                      {d === 'all' ? 'All' : DISCIPLINE_LABELS[d] || d}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {feedbackLoading ? <div className="text-center py-8 text-gray-400">Loading...</div> : filteredFeedback.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p className="text-4xl mb-4">💬</p>
                <p className="font-medium text-gray-500">No feedback found</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-gray-400">Showing {filteredFeedback.length} result{filteredFeedback.length !== 1 ? 's' : ''}</p>
                {filteredFeedback.map((f) => (
                  <div key={f.id} className={`border rounded-xl p-4 ${f.feedback === 'like' ? 'border-green-100 bg-green-50' : 'border-red-100 bg-red-50'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{f.feedback === 'like' ? '👍' : '👎'}</span>
                        <span className="text-xs bg-white px-2 py-1 rounded-full text-gray-600">{DISCIPLINE_LABELS[f.discipline] || f.discipline}</span>
                        <span className="text-xs text-gray-400">{f.user_email}</span>
                      </div>
                      <span className="text-xs text-gray-400">{new Date(f.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 mb-1">Q: {f.question}</p>
                    <ExpandableAnswer answer={f.answer} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Beta Users tab */}
        {activeTab === 'beta users' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-900 mb-2">Grant Beta Access</h2>
              <p className="text-sm text-gray-400 mb-4">Give a user free ELITE access for a set period</p>
              <div className="flex gap-3 flex-wrap">
                <div className="flex-1 min-w-48">
                  <label className="block text-xs text-gray-400 mb-1">Email address</label>
                  <input type="email" value={betaEmail} onChange={(e) => setBetaEmail(e.target.value)} placeholder="user@example.com" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Duration</label>
                  <select value={betaDays} onChange={(e) => setBetaDays(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white">
                    <option value="7">7 days</option>
                    <option value="14">14 days</option>
                    <option value="30">30 days</option>
                    <option value="60">60 days</option>
                    <option value="90">90 days</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button onClick={handleGrantBeta} disabled={grantingBeta || !betaEmail.trim()} className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                    {grantingBeta ? 'Granting...' : '✅ Grant Beta Access'}
                  </button>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-semibold text-gray-900">Active Beta Users</h2>
                  <p className="text-sm text-gray-400 mt-1">{betaUsers.length} beta user{betaUsers.length !== 1 ? 's' : ''}</p>
                </div>
                <button onClick={loadBetaUsers} className="text-sm text-blue-600 hover:text-blue-700">Refresh</button>
              </div>
              {betaLoading ? <div className="text-center py-8 text-gray-400">Loading...</div> : betaUsers.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <p className="text-4xl mb-4">🧪</p>
                  <p className="font-medium text-gray-500">No active beta users</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {betaUsers.map((u) => {
                    const expiry = new Date(u.current_period_end)
                    const daysLeft = Math.ceil((expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                    return (
                      <div key={u.id} className="border border-green-100 bg-green-50 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{u.user_email}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">✅ {daysLeft} day{daysLeft !== 1 ? 's' : ''} left</span>
                              <span className="text-xs text-gray-400">Expires: {expiry.toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {extendEmail === u.user_email ? (
                              <div className="flex items-center gap-2">
                                <select value={extendDays} onChange={(e) => setExtendDays(e.target.value)} className="px-2 py-1 border border-gray-200 rounded-lg text-xs text-gray-900 bg-white">
                                  <option value="7">+7 days</option>
                                  <option value="14">+14 days</option>
                                  <option value="30">+30 days</option>
                                  <option value="60">+60 days</option>
                                </select>
                                <button onClick={() => handleExtendBeta(u.user_email)} className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700">Confirm</button>
                                <button onClick={() => setExtendEmail(null)} className="px-3 py-1 border border-gray-200 text-gray-500 rounded-lg text-xs hover:bg-gray-50">Cancel</button>
                              </div>
                            ) : (
                              <>
                                <button onClick={() => { setExtendEmail(u.user_email); setExtendDays('14') }} className="px-3 py-1 border border-blue-200 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-50">Extend</button>
                                <button onClick={() => handleRevokeBeta(u.user_email)} className="px-3 py-1 border border-red-200 text-red-600 rounded-lg text-xs font-medium hover:bg-red-50">Revoke</button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Subscribers tab */}
        {activeTab === 'subscribers' && (
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold text-gray-900">All Users</h2>
              <button onClick={loadSubscribers} className="text-sm text-blue-600 hover:text-blue-700">Refresh</button>
            </div>
            {subscribersLoading ? <div className="text-center py-8 text-gray-400">Loading...</div> : userSubscriptions.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p className="text-4xl mb-4">👥</p>
                <p className="font-medium text-gray-500">No users yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-3 mb-6">
                  <div className="bg-green-50 rounded-xl p-3 text-center">
                    <div className="text-xl font-bold text-green-600">{liteSubs.length}</div>
                    <div className="text-xs text-gray-400 mt-1">LITE (Free)</div>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-3 text-center">
                    <div className="text-xl font-bold text-blue-600">{proSubs.length}</div>
                    <div className="text-xs text-gray-400 mt-1">PRO</div>
                  </div>
                  <div className="bg-yellow-50 rounded-xl p-3 text-center">
                    <div className="text-xl font-bold text-yellow-600">{eliteSubs.length}</div>
                    <div className="text-xs text-gray-400 mt-1">ELITE</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <div className="text-xl font-bold text-gray-600">{userSubscriptions.filter(s => s.status === 'cancelled').length}</div>
                    <div className="text-xs text-gray-400 mt-1">Cancelled</div>
                  </div>
                </div>
                {userSubscriptions.map((sub) => (
                  <div key={sub.id} className="border border-gray-100 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{sub.full_name || '—'}</p>
                        <p className="text-xs text-gray-400">{sub.user_email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getPlanColor(sub.plan)}`}>{getPlanLabel(sub.plan)}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${sub.status === 'active' ? 'bg-green-100 text-green-700' : sub.status === 'past_due' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500'}`}>{sub.status}</span>
                          {sub.selected_discipline && <span className="text-xs text-gray-400">{DISCIPLINE_LABELS[sub.selected_discipline] || sub.selected_discipline}</span>}
                          {sub.country && <span className="text-xs text-gray-400">{countryToFlag(sub.country)} {sub.country}</span>}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">Joined</p>
                        <p className="text-xs text-gray-600">{new Date(sub.created_at).toLocaleDateString()}</p>
                        {lastLogins[sub.user_email] && (
                          <>
                            <p className="text-xs text-gray-400 mt-1">Last active</p>
                            <p className="text-xs text-gray-600">{new Date(lastLogins[sub.user_email]).toLocaleDateString()}</p>
                          </>
                        )}
                        {sub.current_period_end && sub.plan !== 'lite' && (
                          <>
                            <p className="text-xs text-gray-400 mt-1">Renews</p>
                            <p className="text-xs text-gray-600">{new Date(sub.current_period_end).toLocaleDateString()}</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Analytics tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {analyticsLoading ? <div className="text-center py-8 text-gray-400">Loading analytics...</div> : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">RM {estimatedMRR.toFixed(2)}</div>
                    <div className="text-xs text-gray-400 mt-1">Est. Monthly Revenue</div>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{newSubsLast30Days}</div>
                    <div className="text-xs text-gray-400 mt-1">New Paid (30 days)</div>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">{satisfactionRate}%</div>
                    <div className="text-xs text-gray-400 mt-1">Satisfaction Rate</div>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
                    <div className="text-2xl font-bold text-orange-600">{chatLogs.length}</div>
                    <div className="text-xs text-gray-400 mt-1">Total Questions Asked</div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Subscription Breakdown</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-green-50 rounded-xl p-4">
                      <p className="text-xs text-gray-400 mb-1">AquaRef LITE (Free)</p>
                      <p className="text-2xl font-bold text-green-700">{liteSubs.length}</p>
                      <p className="text-xs text-gray-400 mt-1">RM 0.00/month</p>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-4">
                      <p className="text-xs text-gray-400 mb-1">AquaRef PRO (RM14.99)</p>
                      <p className="text-2xl font-bold text-blue-900">{proSubs.length}</p>
                      <p className="text-xs text-green-600 mt-1">RM {(proSubs.length * 14.99).toFixed(2)}/month</p>
                    </div>
                    <div className="bg-yellow-50 rounded-xl p-4">
                      <p className="text-xs text-gray-400 mb-1">AquaRef ELITE (RM39.99)</p>
                      <p className="text-2xl font-bold text-yellow-800">{eliteSubs.length}</p>
                      <p className="text-xs text-green-600 mt-1">RM {(eliteSubs.length * 39.99).toFixed(2)}/month</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">🤖 AI Token Cost</h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-purple-50 rounded-xl p-4">
                      <p className="text-xs text-gray-400 mb-1">This Month</p>
                      <p className="text-2xl font-bold text-purple-700">RM {thisMonthCostRM.toFixed(4)}</p>
                      <p className="text-xs text-gray-400 mt-1">{(thisMonthInputTokens + thisMonthOutputTokens).toLocaleString()} tokens used</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs text-gray-400 mb-1">All Time</p>
                      <p className="text-2xl font-bold text-gray-700">RM {costRM.toFixed(4)}</p>
                      <p className="text-xs text-gray-400 mt-1">{(totalInputTokens + totalOutputTokens).toLocaleString()} tokens used</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-xl p-3 text-center">
                      <p className="text-xs text-gray-400 mb-1">Input Tokens (all time)</p>
                      <p className="text-lg font-bold text-blue-700">{totalInputTokens.toLocaleString()}</p>
                      <p className="text-xs text-gray-400">RM {(totalInputTokens * 0.0000008 * 4.5).toFixed(4)}</p>
                    </div>
                    <div className="bg-orange-50 rounded-xl p-3 text-center">
                      <p className="text-xs text-gray-400 mb-1">Output Tokens (all time)</p>
                      <p className="text-lg font-bold text-orange-700">{totalOutputTokens.toLocaleString()}</p>
                      <p className="text-xs text-gray-400">RM {(totalOutputTokens * 0.000004 * 4.5).toFixed(4)}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-3 text-center">Haiku: $0.80/M input · $4.00/M output · USD×4.5 = RM</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Questions Asked — Last 7 Days</h3>
                  <SimpleBarChart data={last7Days} />
                </div>

                {disciplineUsage.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-100 p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Most Popular Disciplines</h3>
                    <SimpleBarChart data={disciplineUsage} />
                  </div>
                )}

                {top10Users.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-100 p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">🏆 Top 10 Most Active Users</h3>
                    <div className="space-y-2">
                      {top10Users.map(([email, count], i) => (
                        <div key={email} className="flex items-center gap-3">
                          <span className="text-xs text-gray-400 w-4">{i + 1}</span>
                          <span className="text-sm text-gray-700 flex-1 truncate">{email}</span>
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{count} questions</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {countryData.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-100 p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">🌍 Users by Country</h3>
                    <SimpleBarChart data={countryData} />
                    <p className="text-xs text-gray-400 mt-3 text-center">{userSubscriptions.filter(s => s.country).length} users with known location</p>
                  </div>
                )}

                {last10Logins.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-100 p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">🕐 Last 10 Active Users</h3>
                    <div className="space-y-2">
                      {last10Logins.map((log) => (
                        <div key={log.user_email} className="flex items-center justify-between">
                          <span className="text-sm text-gray-700 truncate flex-1">{log.user_email}</span>
                          <span className="text-xs text-gray-400">{new Date(log.created_at).toLocaleString('en-MY', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-white rounded-xl border border-gray-100 p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">User Feedback</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">👍 {totalLikes}</p>
                      <p className="text-xs text-gray-400 mt-1">Helpful</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-500">👎 {totalDislikes}</p>
                      <p className="text-xs text-gray-400 mt-1">Not helpful</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{satisfactionRate}%</p>
                      <p className="text-xs text-gray-400 mt-1">Satisfaction</p>
                    </div>
                  </div>
                  {feedback.length > 0 && (
                    <div className="mt-4">
                      <div className="w-full bg-gray-100 rounded-full h-3">
                        <div className="bg-green-500 h-3 rounded-full" style={{ width: `${satisfactionRate}%` }} />
                      </div>
                      <p className="text-xs text-gray-400 mt-1 text-center">{feedback.length} total ratings</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

      </div>
    </div>
  )
}