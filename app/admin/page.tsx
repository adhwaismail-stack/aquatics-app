'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react'

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

interface AquaEvent {
  id: string
  name: string
  slug: string
  description: string
  discipline: string
  secondary_disciplines?: string[]
  country: string
  location: string
  start_date: string
  end_date: string
  is_active: boolean
  created_at: string
  poster_url?: string
  chat_enabled?: boolean
  state?: string | null
}

interface BroadcastLog {
  id: string
  sent_by_email: string
  message_type: string
  title: string
  body: string
  link_url: string | null
  link_text: string | null
  filter_type: string
  filter_value: string | null
  recipients_count: number
  sent_at: string
}

interface EventNotice {
  id: string
  event_id: string
  category: string
  message: string
  is_active: boolean
  created_by: string | null
  created_at: string
  updated_at: string
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
  created_at: string
state?: string | null
  slug?: string | null
  content?: string | null
}

interface EventChatLog {
  id: string
  event_id: string
  user_email: string
  question: string
  answer: string
  tokens_input: number
  tokens_output: number
  cost_usd: number
  created_at: string
}

interface EventAnalytics {
  totalQuestions: number
  uniqueUsers: number
  totalCostUsd: number
  top20Users: { email: string; count: number }[]
}

const NOTICE_CATEGORIES = [
  { value: 'current_event', label: 'Current Event', color: 'bg-blue-100 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
  { value: 'call_room', label: 'Call Room', color: 'bg-orange-100 text-orange-700 border-orange-200', dot: 'bg-orange-500' },
  { value: 'announcement', label: 'Announcement', color: 'bg-purple-100 text-purple-700 border-purple-200', dot: 'bg-purple-500' },
  { value: 'venue', label: 'Venue', color: 'bg-green-100 text-green-700 border-green-200', dot: 'bg-green-500' },
  { value: 'schedule', label: 'Schedule', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', dot: 'bg-yellow-500' },
]

const getNoticeCategory = (value: string) =>
  NOTICE_CATEGORIES.find(c => c.value === value) || NOTICE_CATEGORIES[0]

const DISCIPLINES = [
  { name: 'Swimming', code: 'SW', discipline: 'swimming' },
  { name: 'Water Polo', code: 'WP', discipline: 'waterpolo' },
  { name: 'Artistic Swimming', code: 'AS', discipline: 'artistic' },
  { name: 'Diving', code: 'DV', discipline: 'diving' },
  { name: 'High Diving', code: 'HD', discipline: 'highdiving' },
  { name: 'Masters', code: 'MS', discipline: 'masters' },
  { name: 'Open Water', code: 'OW', discipline: 'openwater' },
  { name: 'Para Swimming', code: 'WPS', discipline: 'paraswimming' },
]

const DISCIPLINE_LABELS: Record<string, string> = {
  swimming: 'Swimming', waterpolo: 'Water Polo', artistic: 'Artistic Swimming',
  diving: 'Diving', highdiving: 'High Diving', masters: 'Masters',
  openwater: 'Open Water', paraswimming: 'Para Swimming',
}

const COUNTRIES = [
  'Malaysia', 'Singapore', 'Indonesia', 'Thailand', 'Philippines', 'Vietnam',
  'Brunei', 'Myanmar', 'Cambodia', 'Laos', 'Australia', 'New Zealand',
  'United Kingdom', 'United States', 'Canada', 'Japan', 'China', 'South Korea',
  'India', 'Germany', 'France', 'Netherlands', 'Spain', 'Italy',
  'United Arab Emirates', 'Saudi Arabia', 'Qatar', 'Bahrain', 'Kuwait',
  'Egypt', 'South Africa', 'Nigeria', 'Kenya', 'Hong Kong', 'Taiwan',
  'Pakistan', 'Bangladesh', 'Sri Lanka',
]

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
    'France': '🇫🇷', 'Netherlands': '🇳🇱', 'Spain': '🇪🇸', 'Italy': '🇮🇹',
    'United Arab Emirates': '🇦🇪', 'Saudi Arabia': '🇸🇦', 'Qatar': '🇶🇦',
    'Bahrain': '🇧🇭', 'Kuwait': '🇰🇼', 'Egypt': '🇪🇬', 'South Africa': '🇿🇦',
    'Nigeria': '🇳🇬', 'Kenya': '🇰🇪', 'Hong Kong': '🇭🇰', 'Taiwan': '🇹🇼',
    'Pakistan': '🇵🇰', 'Bangladesh': '🇧🇩', 'Sri Lanka': '🇱🇰',
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

const RM_PER_USD = 4.5

function ExpandableAnswer({ answer }: { answer: string }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div>
      <p className={`text-sm text-gray-500 ${expanded ? '' : 'line-clamp-2'}`}>A: {answer}</p>
      <button onClick={() => setExpanded(!expanded)} className="text-xs text-blue-500 hover:text-blue-600 mt-1">
        {expanded ? 'Show less' : 'Show full answer'}
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
  const [disciplinePrompts, setDisciplinePrompts] = useState<Record<string, string>>({})
  const [savingDisciplinePrompt, setSavingDisciplinePrompt] = useState<string | null>(null)
  const [savedDisciplinePrompt, setSavedDisciplinePrompt] = useState<string | null>(null)
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
  const [recentActiveUsers, setRecentActiveUsers] = useState<{ email: string, created_at: string }[]>([])

  // Events state
  const [events, setEvents] = useState<AquaEvent[]>([])
  const [eventsLoading, setEventsLoading] = useState(false)
  const [showCreateEvent, setShowCreateEvent] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<AquaEvent | null>(null)
const [newEvent, setNewEvent] = useState({
    name: '', slug: '', description: '', discipline: 'swimming',
    secondary_disciplines: [] as string[],
    country: 'Malaysia', location: '', start_date: '', end_date: '', state: ''
  })
  const [creatingEvent, setCreatingEvent] = useState(false)
  const [eventUploading, setEventUploading] = useState(false)
  const [eventUploadProgress, setEventUploadProgress] = useState('')
  const [eventFiles, setEventFiles] = useState<Record<string, { name: string, chunks: number }[]>>({})
  const [deletingEventFile, setDeletingEventFile] = useState<string | null>(null)
  const [eventPrompts, setEventPrompts] = useState<Record<string, string>>({})
  const [savingEventPrompt, setSavingEventPrompt] = useState(false)
  const [savedEventPrompt, setSavedEventPrompt] = useState(false)
  const [posterUploading, setPosterUploading] = useState(false)

  // Live Notices state
  const [eventNotices, setEventNotices] = useState<EventNotice[]>([])
  const [noticeCategory, setNoticeCategory] = useState('announcement')
  const [noticeMessage, setNoticeMessage] = useState('')
  const [pushingNotice, setPushingNotice] = useState(false)
  const [clearingNotice, setClearingNotice] = useState<string | null>(null)

  // Edit Event Details state
  const [editingDetails, setEditingDetails] = useState(false)
const [editForm, setEditForm] = useState({
    name: '', slug: '', discipline: '', secondary_disciplines: [] as string[], country: '', location: '', start_date: '', end_date: '', state: ''
  })
  const [savingDetails, setSavingDetails] = useState(false)
  const [slugWarningShown, setSlugWarningShown] = useState(false)

  // QR Code refs
  const qrPngRef = useRef<HTMLCanvasElement>(null)
  const qrSvgRef = useRef<SVGSVGElement>(null)
  const [copiedUrl, setCopiedUrl] = useState(false)

  // Announcements state
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [announcementsLoading, setAnnouncementsLoading] = useState(false)
  const [showCreateAnnouncement, setShowCreateAnnouncement] = useState(false)
const [newAnnouncement, setNewAnnouncement] = useState({
    title: '', description: '', url: '', country: 'Malaysia', open_new_tab: false, state: '', slug: '', content: ''
  })
  const [creatingAnnouncement, setCreatingAnnouncement] = useState(false)
  const [announcementThumbnailUploading, setAnnouncementThumbnailUploading] = useState<string | null>(null)
  const [editingAnnouncement, setEditingAnnouncement] = useState<string | null>(null)
 const [editAnnouncementForm, setEditAnnouncementForm] = useState({ title: '', description: '', url: '', country: 'Malaysia', open_new_tab: false, state: '', slug: '', content: '' })
  const [savingAnnouncement, setSavingAnnouncement] = useState(false)

  // Registrations state
  const [registrations, setRegistrations] = useState<any[]>([])
  const [registrationsLoading, setRegistrationsLoading] = useState(false)
  const [regSearch, setRegSearch] = useState('')
const [deletingAllReg, setDeletingAllReg] = useState(false)
  const [showRegPreview, setShowRegPreview] = useState(false)

  // ✅ NEW: Event inner tab state
  const [eventInnerTab, setEventInnerTab] = useState<'overview' | 'analytics' | 'chatlog'>('overview')

  // ✅ NEW: Event analytics state
  const [eventAnalytics, setEventAnalytics] = useState<EventAnalytics | null>(null)
  const [eventAnalyticsLoading, setEventAnalyticsLoading] = useState(false)

  // ✅ NEW: Event chat logs state
  const [eventChatLogs, setEventChatLogs] = useState<EventChatLog[]>([])
  const [eventChatLogsLoading, setEventChatLogsLoading] = useState(false)
  const [selectedEventLog, setSelectedEventLog] = useState<EventChatLog | null>(null)
  const [eventCorrectionText, setEventCorrectionText] = useState('')
  const [savingEventCorrection, setSavingEventCorrection] = useState(false)
const [eventLogKeyword, setEventLogKeyword] = useState('')
 const [userMessages, setUserMessages] = useState<{ id: string, user_email: string, message: string, created_at: string }[]>([])
  const [messagesLoading, setMessagesLoading] = useState(false)

  // Broadcast inbox state
  const [broadcastLogs, setBroadcastLogs] = useState<BroadcastLog[]>([])
  const [broadcastsLoading, setBroadcastsLoading] = useState(false)
  const [showBroadcastForm, setShowBroadcastForm] = useState(false)
  const [broadcastForm, setBroadcastForm] = useState({
    messageType: 'system',
    title: '',
    body: '',
    linkUrl: '',
    linkText: '',
    filterType: 'all' as 'all' | 'by_plan' | 'by_country' | 'by_email',
    filterValue: '',
  })
  const [broadcastSending, setBroadcastSending] = useState(false)
  const [broadcastPreview, setBroadcastPreview] = useState<{ count: number; sample: string[]; warning: boolean } | null>(null)
  const [broadcastResult, setBroadcastResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true)
      setError('')
      loadSystemPrompt()
      loadDisciplinePrompts()
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

  const loadDisciplinePrompts = async () => {
    const prompts: Record<string, string> = {}
    for (const d of DISCIPLINES) {
      const { data } = await supabase.from('system_prompts').select('prompt').eq('discipline', d.discipline).single()
      prompts[d.discipline] = data?.prompt || ''
    }
    setDisciplinePrompts(prompts)
  }

  const handleSaveDisciplinePrompt = async (discipline: string) => {
    setSavingDisciplinePrompt(discipline)
    const existing = await supabase.from('system_prompts').select('id').eq('discipline', discipline).single()
    if (existing.data) {
      await supabase.from('system_prompts').update({ prompt: disciplinePrompts[discipline], updated_at: new Date().toISOString() }).eq('discipline', discipline)
    } else {
      await supabase.from('system_prompts').insert({ discipline, prompt: disciplinePrompts[discipline] })
    }
    setSavingDisciplinePrompt(null)
    setSavedDisciplinePrompt(discipline)
    setTimeout(() => setSavedDisciplinePrompt(null), 3000)
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
    const { data } = await supabase.from('user_subscriptions').select('*').is('stripe_customer_id', null).eq('status', 'active').gt('current_period_end', new Date().toISOString()).order('created_at', { ascending: false })
    if (data) setBetaUsers(data)
    setBetaLoading(false)
  }

  const loadAnalytics = async () => {
    setAnalyticsLoading(true)
    const { data: usageData } = await supabase.from('daily_usage').select('date, count').order('date', { ascending: false }).limit(14)
    if (usageData) setDailyUsage(usageData)
    const { data: tokenData } = await supabase.from('chat_logs').select('input_tokens, output_tokens, created_at').not('input_tokens', 'is', null)
    if (tokenData) setTokenLogs(tokenData)
 const { data: recentSubs } = await supabase
      .from('user_subscriptions')
      .select('user_email, created_at')
      .order('created_at', { ascending: false })
      .limit(10)
    if (recentSubs) {
      setRecentActiveUsers(recentSubs.map((s: any) => ({ email: s.user_email, created_at: s.created_at })))
    }
    setAnalyticsLoading(false)
  }

  const loadEvents = async () => {
    setEventsLoading(true)
    const { data } = await supabase.from('events').select('*').order('created_at', { ascending: false })
    if (data) setEvents(data)
    setEventsLoading(false)
  }

  const loadEventFiles = async (eventId: string) => {
    const { data } = await supabase.from('event_chunks').select('source_file, chunk_index').eq('event_id', eventId).order('chunk_index', { ascending: false })
    if (data) {
      const fileMap: Record<string, number> = {}
      data.forEach((chunk: { source_file: string }) => { fileMap[chunk.source_file] = (fileMap[chunk.source_file] || 0) + 1 })
      setEventFiles(prev => ({ ...prev, [eventId]: Object.entries(fileMap).map(([name, chunks]) => ({ name, chunks })) }))
    }
  }

  const loadEventNotices = async (eventId: string) => {
    const { data } = await supabase
      .from('event_notices')
      .select('*')
      .eq('event_id', eventId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    if (data) setEventNotices(data)
  }

  // Load announcements
const loadMessages = async () => {
    setMessagesLoading(true)
    const { data } = await supabase.from('user_messages').select('*').order('created_at', { ascending: false })
    if (data) setUserMessages(data)
    setMessagesLoading(false)
  }

  const loadBroadcasts = async () => {
    setBroadcastsLoading(true)
    const { data, error } = await supabase
      .from('broadcast_log')
      .select('*')
      .order('sent_at', { ascending: false })
      .limit(100)
    if (error) {
      console.error('Failed to load broadcasts:', error.message)
    } else if (data) {
      setBroadcastLogs(data)
    }
    setBroadcastsLoading(false)
  }

  const loadAnnouncements = async () => {
    setAnnouncementsLoading(true)
    const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false })
    if (data) setAnnouncements(data)
    setAnnouncementsLoading(false)
  }

  // Load registrations
  const loadRegistrations = async () => {
    setRegistrationsLoading(true)
    const { data } = await supabase
      .from('swimmer_profiles')
      .select('*, swimmer_pbs(*)')
      .order('created_at', { ascending: false })
    if (data) setRegistrations(data)
    setRegistrationsLoading(false)
  }

  // ✅ NEW: Load event analytics
  const loadEventAnalytics = async (eventId: string) => {
    setEventAnalyticsLoading(true)
    const { data } = await supabase
      .from('event_chat_logs')
      .select('user_email, tokens_input, tokens_output, cost_usd')
      .eq('event_id', eventId)

    if (data) {
      const totalQuestions = data.length
      const uniqueUsers = new Set(data.map(l => l.user_email)).size
      const totalCostUsd = data.reduce((sum, l) => sum + (l.cost_usd || 0), 0)

      const userCounts: Record<string, number> = {}
      data.forEach(l => { userCounts[l.user_email] = (userCounts[l.user_email] || 0) + 1 })
      const top20Users = Object.entries(userCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
        .map(([email, count]) => ({ email, count }))

      setEventAnalytics({ totalQuestions, uniqueUsers, totalCostUsd, top20Users })
    }
    setEventAnalyticsLoading(false)
  }

  // ✅ NEW: Load event chat logs
  const loadEventChatLogs = async (eventId: string) => {
    setEventChatLogsLoading(true)
    const { data } = await supabase
      .from('event_chat_logs')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false })
      .limit(200)
    if (data) setEventChatLogs(data)
    setEventChatLogsLoading(false)
  }

  // ✅ NEW: Save event correction
  const handleAddEventCorrection = async () => {
    if (!selectedEventLog || !eventCorrectionText.trim() || !selectedEvent) return
    setSavingEventCorrection(true)
    await supabase.from('correction_notes').insert({
      discipline: selectedEvent.discipline,
      question: selectedEventLog.question,
      wrong_answer: selectedEventLog.answer,
      correct_note: eventCorrectionText.trim()
    })
    setSavingEventCorrection(false)
    setEventCorrectionText('')
    setSelectedEventLog(null)
    alert('Correction saved!')
    loadCorrections()
  }

  const handlePushNotice = async () => {
    if (!selectedEvent || !noticeMessage.trim()) return
    const activeCount = eventNotices.length
    if (activeCount >= 5) {
      alert('Maximum 5 active notices per event. Please clear an existing notice first.')
      return
    }
    setPushingNotice(true)
    const { error } = await supabase.from('event_notices').insert({
      event_id: selectedEvent.id,
      category: noticeCategory,
      message: noticeMessage.trim(),
      is_active: true,
      created_by: 'super_admin'
    })
    if (error) {
      alert('Error pushing notice: ' + error.message)
    } else {
      setNoticeMessage('')
      setNoticeCategory('announcement')
      await loadEventNotices(selectedEvent.id)
    }
    setPushingNotice(false)
  }

  const handleClearNotice = async (noticeId: string) => {
    if (!confirm('Clear this notice? (It will be hidden from users but kept for audit history.)')) return
    setClearingNotice(noticeId)
    const { error } = await supabase
      .from('event_notices')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', noticeId)
    if (error) {
      alert('Error clearing notice: ' + error.message)
    } else if (selectedEvent) {
      await loadEventNotices(selectedEvent.id)
    }
    setClearingNotice(null)
  }

const handleDeleteEventFile = async (eventId: string, fileName: string) => {
    if (!confirm(`Delete "${fileName}"?`)) return
    setDeletingEventFile(fileName)
    try {
      // Delete from storage
      const { data: storageFiles } = await supabase.storage.from('events').list(eventId)
      if (storageFiles) {
        const match = storageFiles.find(f => fileName.includes(f.name) || f.name.includes(fileName.replace(/^\d+_/, '')))
        if (match) {
          await supabase.storage.from('events').remove([`${eventId}/${match.name}`])
        }
      }
      // Delete from chunks
      await supabase.from('event_chunks').delete().eq('event_id', eventId).eq('source_file', fileName)
      await loadEventFiles(eventId)
    } catch { alert('Failed to delete file.') }
    setDeletingEventFile(null)
  }

  const handleSaveEventPrompt = async (eventId: string) => {
    setSavingEventPrompt(true)
    await supabase.from('events').update({ description: eventPrompts[eventId] }).eq('id', eventId)
    setSavingEventPrompt(false)
    setSavedEventPrompt(true)
    setTimeout(() => setSavedEventPrompt(false), 3000)
  }

  const handlePosterUpload = async (e: React.ChangeEvent<HTMLInputElement>, event: AquaEvent) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { alert('Poster must be under 2MB'); return }
    setPosterUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const fileName = `${event.id}/poster_${Date.now()}.${ext}`
      const { data: signedData, error: signedError } = await supabase.storage.from('events').createSignedUploadUrl(fileName)
      if (signedError || !signedData) throw new Error('Could not create upload URL')
      const uploadResponse = await fetch(signedData.signedUrl, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file })
      if (!uploadResponse.ok) throw new Error('Upload failed')
      const { data: { publicUrl } } = supabase.storage.from('events').getPublicUrl(fileName)
      await supabase.from('events').update({ poster_url: publicUrl }).eq('id', event.id)
      setSelectedEvent({ ...event, poster_url: publicUrl })
      await loadEvents()
      alert('Poster uploaded!')
    } catch (err) { alert('Upload failed: ' + (err instanceof Error ? err.message : 'Unknown error')) }
    setPosterUploading(false)
    e.target.value = ''
  }

  const openEventManagement = (event: AquaEvent) => {
    setSelectedEvent(event)
    setEventPrompts(prev => ({ ...prev, [event.id]: event.description || '' }))
    loadEventFiles(event.id)
    loadEventNotices(event.id)
    setEditingDetails(false)
    setEventInnerTab('overview')
    setEventAnalytics(null)
    setEventChatLogs([])
  }

  const handleStartEdit = () => {
    if (!selectedEvent) return
setEditForm({
      name: selectedEvent.name,
      slug: selectedEvent.slug,
      discipline: selectedEvent.discipline,
      secondary_disciplines: selectedEvent.secondary_disciplines || [],
      country: selectedEvent.country,
      location: selectedEvent.location,
      start_date: selectedEvent.start_date || '',
      end_date: selectedEvent.end_date || '',
      state: selectedEvent.state || '',
    })
    setSlugWarningShown(false)
    setEditingDetails(true)
  }

  const handleCancelEdit = () => {
    setEditingDetails(false)
    setSlugWarningShown(false)
  }

  const handleSaveDetails = async () => {
    if (!selectedEvent) return
    if (!editForm.name.trim() || !editForm.slug.trim()) {
      alert('Event name and URL slug are required.')
      return
    }

    if (editForm.slug !== selectedEvent.slug && !slugWarningShown) {
      const confirmed = confirm(
        'WARNING: Changing the URL slug will break any existing links, QR codes, or flyers using the current URL. Users with the old link will get a 404 error.\n\nOld URL: aquaref.co/events/' + selectedEvent.slug + '\nNew URL: aquaref.co/events/' + editForm.slug + '\n\nAre you sure?'
      )
      if (!confirmed) return
      setSlugWarningShown(true)
    }

    const cleanSlug = editForm.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-')

    setSavingDetails(true)
    const { error } = await supabase
      .from('events')
.update({
        name: editForm.name.trim(),
        slug: cleanSlug,
        discipline: editForm.discipline,
        secondary_disciplines: editForm.secondary_disciplines || [],
        country: editForm.country,
        location: editForm.location.trim(),
        start_date: editForm.start_date || null,
        end_date: editForm.end_date || null,
        state: editForm.state?.trim() || null,
      })
      .eq('id', selectedEvent.id)

    if (error) {
      alert('Error saving: ' + error.message)
    } else {
setSelectedEvent({
        ...selectedEvent,
        name: editForm.name.trim(),
        slug: cleanSlug,
        discipline: editForm.discipline,
        secondary_disciplines: editForm.secondary_disciplines || [],
        country: editForm.country,
        location: editForm.location.trim(),
        start_date: editForm.start_date,
        end_date: editForm.end_date,
      })
      await loadEvents()
      setEditingDetails(false)
      setSlugWarningShown(false)
    }
    setSavingDetails(false)
  }

  const getEventUrl = (event: AquaEvent) => {
    const base = typeof window !== 'undefined' ? window.location.origin : 'https://aquaref.co'
    return `${base}/events/${event.slug}?ref=qr`
  }

  const handleCopyUrl = async () => {
    if (!selectedEvent) return
    await navigator.clipboard.writeText(getEventUrl(selectedEvent))
    setCopiedUrl(true)
    setTimeout(() => setCopiedUrl(false), 2000)
  }

  const handleDownloadQRPNG = () => {
    if (!selectedEvent) return
    const canvas = qrPngRef.current
    if (!canvas) return
    const url = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.href = url
    link.download = `aquaref-qr-${selectedEvent.slug}.png`
    link.click()
  }

  const handleDownloadQRSVG = () => {
    if (!selectedEvent) return
    const svg = qrSvgRef.current
    if (!svg) return
    const serializer = new XMLSerializer()
    const source = serializer.serializeToString(svg)
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `aquaref-qr-${selectedEvent.slug}.svg`
    link.click()
    URL.revokeObjectURL(url)
  }

  // ✅ NEW: Handle inner tab switching with lazy loading
  const handleEventInnerTab = (tab: 'overview' | 'analytics' | 'chatlog') => {
    setEventInnerTab(tab)
    if (!selectedEvent) return
    if (tab === 'analytics' && !eventAnalytics) {
      loadEventAnalytics(selectedEvent.id)
    }
    if (tab === 'chatlog' && eventChatLogs.length === 0) {
      loadEventChatLogs(selectedEvent.id)
    }
  }

useEffect(() => {
    if (activeTab === 'chat logs') loadChatLogs()
    if (activeTab === 'corrections') loadCorrections()
    if (activeTab === 'subscribers') loadSubscribers()
    if (activeTab === 'feedback') loadFeedback()
    if (activeTab === 'beta users') loadBetaUsers()
    if (activeTab === 'analytics') { loadAnalytics(); loadFeedback(); loadSubscribers(); loadChatLogs() }
    if (activeTab === 'events') loadEvents()
    if (activeTab === 'registrations') loadRegistrations()
    if (activeTab === 'announcements') loadAnnouncements()
    if (activeTab === 'messages') loadMessages()
    if (activeTab === 'inbox') loadBroadcasts()
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
    await supabase.from('correction_notes').insert({ discipline: selectedLog.discipline, question: selectedLog.question, wrong_answer: selectedLog.answer, correct_note: correctionText.trim() })
    setSavingCorrection(false)
    setCorrectionText('')
    setSelectedLog(null)
    alert('Correction saved!')
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
      await fetch('/api/files', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fileId: file.id, discipline: file.discipline, originalName: file.original_name, fileName: file.file_name }) })
      await loadAllFiles()
    } catch { alert('Failed to delete file.') }
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
      setUploadProgress('Uploading...')
      const uploadResponse = await fetch(signedData.signedUrl, { method: 'PUT', headers: { 'Content-Type': file.type || 'application/octet-stream' }, body: file })
      if (!uploadResponse.ok) throw new Error(`Upload failed: ${uploadResponse.statusText}`)
      setUploadProgress('Processing with AI...')
      const response = await fetch('/api/upload', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fileName, discipline, originalName: file.name }) })
      const data = await response.json()
      if (data.success) { setUploadProgress(''); alert(`${data.chunks} chunks from ${file.name}`); await loadAllFiles() }
      else throw new Error(data.error)
    } catch (err) { alert('Upload failed: ' + (err instanceof Error ? err.message : 'Unknown error')); setUploadProgress('') }
    setUploading(null)
    e.target.value = ''
  }

  const handleCreateEvent = async () => {
    if (!newEvent.name || !newEvent.slug) { alert('Event name and URL slug are required!'); return }
    const slug = newEvent.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-')
    setCreatingEvent(true)
    const { data, error } = await supabase.from('events').insert({ ...newEvent, slug, is_active: false }).select().single()
    if (error) { alert('Error creating event: ' + error.message) }
    else {
setNewEvent({ name: '', slug: '', description: '', discipline: 'swimming', secondary_disciplines: [], country: 'Malaysia', location: '', start_date: '', end_date: '', state: '' })
      setShowCreateEvent(false)
      await loadEvents()
      if (data) openEventManagement(data)
    }
    setCreatingEvent(false)
  }

  const handleToggleEvent = async (event: AquaEvent) => {
    await supabase.from('events').update({ is_active: !event.is_active }).eq('id', event.id)
    loadEvents()
    if (selectedEvent?.id === event.id) setSelectedEvent({ ...event, is_active: !event.is_active })
  }

  const handleDeleteEvent = async (event: AquaEvent) => {
    if (!confirm(`Delete "${event.name}"?`)) return
    await supabase.from('events').delete().eq('id', event.id)
    setSelectedEvent(null)
    loadEvents()
  }

  const handleEventUpload = async (e: React.ChangeEvent<HTMLInputElement>, event: AquaEvent) => {
    const file = e.target.files?.[0]
    if (!file) return
    setEventUploading(true)
    setEventUploadProgress('Uploading file...')
    try {
      const fileName = `${event.id}/${Date.now()}_${file.name}`
      const { data: signedData, error: signedError } = await supabase.storage.from('events').createSignedUploadUrl(fileName)
      if (signedError || !signedData) throw new Error(`Could not create upload URL: ${signedError?.message}`)
      const uploadResponse = await fetch(signedData.signedUrl, { method: 'PUT', headers: { 'Content-Type': file.type || 'application/octet-stream' }, body: file })
      if (!uploadResponse.ok) throw new Error(`Upload failed: ${uploadResponse.statusText}`)
      setEventUploadProgress('Processing with AI...')
      const response = await fetch('/api/event-upload', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fileName, eventId: event.id, originalName: file.name }) })
      const data = await response.json()
      if (data.success) { setEventUploadProgress(''); alert(`${data.chunks} chunks (${data.textChunks} text + ${data.visualChunks} visual)`); loadEventFiles(event.id) }
      else throw new Error(data.error)
    } catch (err) { alert('Upload failed: ' + (err instanceof Error ? err.message : 'Unknown error')); setEventUploadProgress('') }
    setEventUploading(false)
    e.target.value = ''
  }

  const handleGrantBeta = async () => {
    if (!betaEmail.trim()) return
    setGrantingBeta(true)
    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() + parseInt(betaDays))
    const { data: existing } = await supabase.from('user_subscriptions').select('id').eq('user_email', betaEmail.trim().toLowerCase()).single()
    if (existing) { await supabase.from('user_subscriptions').update({ plan: 'elite', status: 'active', current_period_end: expiryDate.toISOString(), stripe_customer_id: null }).eq('user_email', betaEmail.trim().toLowerCase()) }
    else { await supabase.from('user_subscriptions').insert({ user_email: betaEmail.trim().toLowerCase(), plan: 'elite', status: 'active', current_period_end: expiryDate.toISOString(), stripe_customer_id: null }) }
    alert(`Beta access granted to ${betaEmail} for ${betaDays} days`)
    setBetaEmail(''); setBetaDays('14'); setGrantingBeta(false); loadBetaUsers()
  }

  const handleExtendBeta = async (email: string) => {
    const days = parseInt(extendDays)
    const { data: user } = await supabase.from('user_subscriptions').select('current_period_end').eq('user_email', email).single()
    if (!user) return
    const newExpiry = new Date(Math.max(new Date(user.current_period_end).getTime(), Date.now()))
    newExpiry.setDate(newExpiry.getDate() + days)
    await supabase.from('user_subscriptions').update({ current_period_end: newExpiry.toISOString(), status: 'active' }).eq('user_email', email)
    alert(`Extended by ${days} days.`)
    setExtendEmail(null); loadBetaUsers()
  }

  const handleRevokeBeta = async (email: string) => {
    if (!confirm(`Revoke beta access for ${email}?`)) return
    await supabase.from('user_subscriptions').update({ status: 'cancelled', current_period_end: new Date().toISOString() }).eq('user_email', email)
    loadBetaUsers()
  }

  const filteredLogs = chatLogs.filter(l => logDisciplineFilter === 'all' || l.discipline === logDisciplineFilter).filter(l => { if (!logKeyword) return true; const kw = logKeyword.toLowerCase(); return l.question?.toLowerCase().includes(kw) || l.answer?.toLowerCase().includes(kw) || l.user_email?.toLowerCase().includes(kw) }).filter(l => { if (logDateFrom && new Date(l.created_at) < new Date(logDateFrom)) return false; if (logDateTo && new Date(l.created_at) > new Date(logDateTo + 'T23:59:59')) return false; return true })
  const filteredCorrections = corrections.filter(c => correctionDiscipline === 'all' || c.discipline === correctionDiscipline).filter(c => { if (!correctionKeyword) return true; const kw = correctionKeyword.toLowerCase(); return c.question?.toLowerCase().includes(kw) || c.correct_note?.toLowerCase().includes(kw) })
  const filteredFeedback = feedback.filter(f => feedbackFilter === 'all' || f.feedback === feedbackFilter).filter(f => feedbackDiscipline === 'all' || f.discipline === feedbackDiscipline)
  const liteSubs = userSubscriptions.filter(s => s.plan === 'lite' && s.status === 'active')
  const proSubs = userSubscriptions.filter(s => (s.plan === 'pro' || s.plan === 'starter') && s.status === 'active' && s.stripe_customer_id)
  const eliteSubs = userSubscriptions.filter(s => (s.plan === 'elite' || s.plan === 'all_disciplines') && s.status === 'active' && s.stripe_customer_id)
  const estimatedMRR = (proSubs.length * 14.99) + (eliteSubs.length * 39.99)
  const totalLikes = feedback.filter(f => f.feedback === 'like').length
  const totalDislikes = feedback.filter(f => f.feedback === 'dislike').length
  const satisfactionRate = feedback.length > 0 ? Math.round((totalLikes / feedback.length) * 100) : 0
  const disciplineUsage = DISCIPLINES.map(d => ({ label: d.name, value: chatLogs.filter(l => l.discipline === d.discipline).length })).filter(d => d.value > 0).sort((a, b) => b.value - a.value)
  const last7Days = [...Array(7)].map((_, i) => { const d = new Date(); d.setDate(d.getDate() - i); const dateStr = d.toISOString().split('T')[0]; const usage = dailyUsage.find(u => u.date === dateStr); return { label: d.toLocaleDateString('en-MY', { weekday: 'short', day: 'numeric' }), value: usage?.count || 0 } }).reverse()
  const newSubsLast30Days = userSubscriptions.filter(s => { const created = new Date(s.created_at); const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30); return created > thirtyDaysAgo && s.stripe_customer_id !== null }).length
  const totalInputTokens = tokenLogs.reduce((sum, l) => sum + (l.input_tokens || 0), 0)
  const totalOutputTokens = tokenLogs.reduce((sum, l) => sum + (l.output_tokens || 0), 0)
  const costRM = ((totalInputTokens * 0.000001) + (totalOutputTokens * 0.000005)) * 4.5
  const thisMonthStart = new Date(); thisMonthStart.setDate(1); thisMonthStart.setHours(0, 0, 0, 0)
  const thisMonthLogs = tokenLogs.filter(l => new Date(l.created_at) >= thisMonthStart)
  const thisMonthCostRM = ((thisMonthLogs.reduce((s, l) => s + (l.input_tokens || 0), 0) * 0.000001) + (thisMonthLogs.reduce((s, l) => s + (l.output_tokens || 0), 0) * 0.000005)) * 4.5
  const userQuestionCounts = chatLogs.reduce((acc, log) => { acc[log.user_email] = (acc[log.user_email] || 0) + 1; return acc }, {} as Record<string, number>)
  const top10Users = Object.entries(userQuestionCounts).sort((a, b) => b[1] - a[1]).slice(0, 10)
  const countryCounts = userSubscriptions.filter(s => s.country).reduce((acc, s) => { acc[s.country!] = (acc[s.country!] || 0) + 1; return acc }, {} as Record<string, number>)
  const countryData = Object.entries(countryCounts).sort((a, b) => b[1] - a[1]).map(([label, value]) => ({ label: `${countryToFlag(label)} ${label}`, value }))

  // ✅ NEW: Filtered event chat logs
  const filteredEventChatLogs = eventChatLogs.filter(l => {
    if (!eventLogKeyword) return true
    const kw = eventLogKeyword.toLowerCase()
    return l.question?.toLowerCase().includes(kw) || l.answer?.toLowerCase().includes(kw) || l.user_email?.toLowerCase().includes(kw)
  })

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center"><span className="text-white font-bold text-sm">A</span></div>
              <span className="font-bold text-xl text-gray-900">AquaRef Admin</span>
            </div>
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
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center"><span className="text-white font-bold text-sm">A</span></div>
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
            { label: 'Active events', value: events.filter(e => e.is_active).length.toString() },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{s.value}</div>
              <div className="text-xs text-gray-400 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
        {['rulebooks', 'events', 'announcements', 'registrations', 'inbox', 'system prompt', 'chat logs', 'corrections', 'feedback', 'messages', 'beta users', 'subscribers', 'analytics'].map((tab) => (
           <button key={tab} onClick={() => { setActiveTab(tab); setSelectedEvent(null); setShowCreateEvent(false) }} className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${activeTab === tab ? tab === 'events' ? 'bg-green-600 text-white' : tab === 'registrations' ? 'bg-purple-600 text-white' : tab === 'announcements' ? 'bg-orange-500 text-white' : tab === 'inbox' ? 'bg-indigo-600 text-white' : 'bg-blue-600 text-white' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'}`}>
              {tab}
            </button>
          ))}
        </div>

        {/* Rulebooks tab */}
        {activeTab === 'rulebooks' && (
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-2">Rulebook Management</h2>
            <p className="text-sm text-gray-400 mb-6">Upload PDF, TXT, DOCX, XLSX, or PPTX files per discipline.</p>
            {uploadProgress && <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-700">Processing... {uploadProgress}</div>}
            <div className="space-y-6">
              {DISCIPLINES.map((d) => {
                const files = rulebookFiles[d.discipline] || []
                const isPara = d.discipline === 'paraswimming'
                return (
                  <div key={d.code} className={`border rounded-xl p-4 ${isPara ? 'border-purple-100' : 'border-gray-100'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className={`font-medium ${isPara ? 'text-purple-900' : 'text-gray-900'}`}>{d.name}</h3>
                        <p className="text-xs text-gray-400">{d.code} Rules{isPara ? ' · World Para Swimming (IPC)' : ''}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${files.length > 0 ? isPara ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                        {files.length > 0 ? `${files.length} file${files.length > 1 ? 's' : ''} uploaded` : 'No files'}
                      </span>
                    </div>
                    {files.length > 0 && (
                      <div className="mb-3 space-y-2">
                        {files.map((file) => (
                          <div key={file.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                            <div className="flex items-center gap-2">
                              <div>
                                <p className="text-sm text-gray-700 font-medium">{file.original_name}</p>
                                <p className="text-xs text-gray-400">{file.chunk_count} chunks · {new Date(file.uploaded_at).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <button onClick={() => handleDeleteFile(file)} disabled={deletingFile === file.id} className="text-xs text-red-500 hover:text-red-600 font-medium disabled:opacity-50">{deletingFile === file.id ? 'Deleting...' : 'Delete'}</button>
                          </div>
                        ))}
                      </div>
                    )}
                    <label className="cursor-pointer block mb-4">
                      <div className={`w-full text-center border py-2 rounded-lg text-sm transition-colors ${uploading === d.discipline ? 'border-gray-200 text-gray-400' : isPara ? 'border-purple-200 text-purple-600 hover:bg-purple-50' : 'border-blue-200 text-blue-600 hover:bg-blue-50'}`}>
                        {uploading === d.discipline ? 'Processing...' : files.length > 0 ? '+ Add another document' : 'Upload PDF, DOCX, XLSX, PPTX or TXT'}
                      </div>
                      <input type="file" accept=".pdf,.txt,.docx,.xlsx,.pptx" className="hidden" disabled={uploading !== null} onChange={(e) => handleUpload(e, d.discipline)} />
                    </label>
                    <div className={`border-t pt-4 ${isPara ? 'border-purple-100' : 'border-gray-100'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className={`text-xs font-medium ${isPara ? 'text-purple-700' : 'text-gray-700'}`}>{d.name} — Specific Prompt</p>
                          <p className="text-xs text-gray-400">Added on top of the base prompt</p>
                        </div>
                        <button onClick={() => handleSaveDisciplinePrompt(d.discipline)} disabled={savingDisciplinePrompt === d.discipline} className={`px-4 py-1.5 rounded-lg text-xs font-medium disabled:opacity-50 ${savedDisciplinePrompt === d.discipline ? 'bg-green-100 text-green-700' : isPara ? 'bg-purple-600 text-white hover:bg-purple-700' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                          {savingDisciplinePrompt === d.discipline ? 'Saving...' : savedDisciplinePrompt === d.discipline ? 'Saved!' : 'Save'}
                        </button>
                      </div>
                      <textarea value={disciplinePrompts[d.discipline] || ''} onChange={(e) => setDisciplinePrompts(prev => ({ ...prev, [d.discipline]: e.target.value }))} rows={3} placeholder={`Add ${d.name}-specific instructions here...`} className={`w-full px-3 py-2 border rounded-lg text-xs font-mono focus:outline-none focus:ring-2 text-gray-700 placeholder-gray-400 resize-y ${isPara ? 'border-purple-200 focus:ring-purple-500' : 'border-gray-200 focus:ring-blue-500'}`} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Events - List */}
        {activeTab === 'events' && !selectedEvent && !showCreateEvent && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-gray-900">All Events</h2>
                <p className="text-sm text-gray-400 mt-0.5">{events.length} event{events.length !== 1 ? 's' : ''} · {events.filter(e => e.is_active).length} active</p>
              </div>
              <div className="flex gap-2">
                <button onClick={loadEvents} className="text-sm text-green-600 hover:text-green-700">Refresh</button>
                <button onClick={() => setShowCreateEvent(true)} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">New Event</button>
              </div>
            </div>
            {eventsLoading ? <div className="text-center py-8 text-gray-400">Loading...</div> : events.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400">
                <p className="font-medium text-gray-500 mb-2">No events yet</p>
                <button onClick={() => setShowCreateEvent(true)} className="text-sm text-green-600 hover:text-green-700 font-medium">Create your first event</button>
              </div>
            ) : (
              <div className="space-y-3">
                {events.map((event) => (
                  <div key={event.id} onClick={() => openEventManagement(event)} className={`bg-white border rounded-xl p-4 cursor-pointer hover:shadow-sm transition-all ${event.is_active ? 'border-green-200 hover:border-green-400' : 'border-gray-100 hover:border-gray-300'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        {event.poster_url && (
                          <img src={event.poster_url} alt="" className="w-16 h-10 rounded-lg object-cover flex-shrink-0 border border-gray-100" />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-gray-900">{event.name}</h3>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${event.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{event.is_active ? 'Active' : 'Inactive'}</span>
                          </div>
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="text-xs text-gray-400">aquaref.co/events/{event.slug}</span>
                            <span className="text-xs text-gray-500">{countryToFlag(event.country)} {event.country}</span>
                            <span className="text-xs text-gray-500">{DISCIPLINE_LABELS[event.discipline] || event.discipline}</span>
                          </div>
                        </div>
                      </div>
                      <span className="text-gray-400 text-sm ml-4">→</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Events - Create */}
        {activeTab === 'events' && showCreateEvent && (
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-6">
              <button onClick={() => setShowCreateEvent(false)} className="text-gray-400 hover:text-gray-600 text-sm">← Back</button>
              <h2 className="font-semibold text-gray-900">Create New Event</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Name *</label>
                <input type="text" value={newEvent.name} onChange={(e) => { const name = e.target.value; const slug = name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-'); setNewEvent(prev => ({ ...prev, name, slug })) }} placeholder="e.g. National Age Group Championships 2026" className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL Slug *</label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">aquaref.co/events/</span>
                  <input type="text" value={newEvent.slug} onChange={(e) => setNewEvent(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') }))} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900" />
                </div>
              </div>
     <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Primary Discipline</label>
                  <select value={newEvent.discipline} onChange={(e) => setNewEvent(prev => ({ ...prev, discipline: e.target.value, secondary_disciplines: prev.secondary_disciplines.filter(d => d !== e.target.value) }))} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 bg-white">
                    {DISCIPLINES.map(d => <option key={d.discipline} value={d.discipline}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <select value={newEvent.country} onChange={(e) => setNewEvent(prev => ({ ...prev, country: e.target.value }))} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 bg-white">
                    {COUNTRIES.map(c => <option key={c} value={c}>{countryToFlag(c)} {c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Disciplines <span className="text-gray-400 font-normal">(optional — for multi-sport events)</span></label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-3 border border-gray-200 rounded-lg bg-gray-50">
                  {DISCIPLINES.filter(d => d.discipline !== newEvent.discipline).map(d => (
                    <label key={d.discipline} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newEvent.secondary_disciplines.includes(d.discipline)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewEvent(prev => ({ ...prev, secondary_disciplines: [...prev.secondary_disciplines, d.discipline] }))
                          } else {
                            setNewEvent(prev => ({ ...prev, secondary_disciplines: prev.secondary_disciplines.filter(x => x !== d.discipline) }))
                          }
                        }}
                        className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-xs text-gray-700">{d.name}</span>
                    </label>
                  ))}
                </div>
              </div>
           <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input type="text" value={newEvent.location} onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))} placeholder="e.g. Bukit Jalil Aquatic Centre" className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State / Region <span className="text-gray-400 font-normal">(optional)</span></label>
               <select value={newEvent.state} onChange={(e) => setNewEvent(prev => ({ ...prev, state: e.target.value }))} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 bg-white">
                  <option value="">— Select state —</option>
                  {MALAYSIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input type="date" value={newEvent.start_date} onChange={(e) => setNewEvent(prev => ({ ...prev, start_date: e.target.value }))} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input type="date" value={newEvent.end_date} onChange={(e) => setNewEvent(prev => ({ ...prev, end_date: e.target.value }))} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900" />
                </div>
              </div>
              <button onClick={handleCreateEvent} disabled={creatingEvent || !newEvent.name || !newEvent.slug} className="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50">
                {creatingEvent ? 'Creating...' : 'Create Event'}
              </button>
            </div>
          </div>
        )}

        {/* Events - Management Page */}
        {activeTab === 'events' && selectedEvent && (
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button onClick={() => setSelectedEvent(null)} className="text-gray-400 hover:text-gray-600 text-sm">← All Events</button>
                <div>
                  <h2 className="font-semibold text-gray-900">{selectedEvent.name}</h2>
                  <p className="text-xs text-gray-400">aquaref.co/events/{selectedEvent.slug}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded-full ${selectedEvent.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{selectedEvent.is_active ? 'Active' : 'Inactive'}</span>
                <button onClick={() => handleToggleEvent(selectedEvent)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${selectedEvent.is_active ? 'border-orange-200 text-orange-600 hover:bg-orange-50' : 'border-green-200 text-green-600 hover:bg-green-50'}`}>
                  {selectedEvent.is_active ? 'Deactivate' : 'Activate'}
                </button>
                <button onClick={() => handleDeleteEvent(selectedEvent)} className="px-3 py-1.5 border border-red-200 text-red-600 rounded-lg text-xs font-medium hover:bg-red-50">Delete</button>
              </div>
            </div>

            {/* ✅ NEW: Inner tab navigation */}
            <div className="flex gap-2">
              {[
                { key: 'overview', label: 'Overview' },
                { key: 'analytics', label: 'Analytics' },
                { key: 'chatlog', label: 'Chat Log' },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => handleEventInnerTab(tab.key as 'overview' | 'analytics' | 'chatlog')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    eventInnerTab === tab.key
                      ? 'bg-green-600 text-white'
                      : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* ✅ OVERVIEW TAB */}
            {eventInnerTab === 'overview' && (
              <div className="space-y-4">
           {/* Chat Toggle */}
                <div className="bg-white rounded-xl border border-gray-100 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 text-sm">Event AI Chat</h3>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {selectedEvent.chat_enabled === false ? 'Chat is OFF — users see download page instead' : 'Chat is ON — users can ask questions'}
                      </p>
                    </div>
                    <button
                      onClick={async () => {
                        const newValue = selectedEvent.chat_enabled === false ? true : false
                        await supabase.from('events').update({ chat_enabled: newValue }).eq('id', selectedEvent.id)
                        setSelectedEvent({ ...selectedEvent, chat_enabled: newValue })
                        await loadEvents()
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${selectedEvent.chat_enabled === false ? 'bg-green-600 text-white border-green-600 hover:bg-green-700' : 'border-orange-200 text-orange-600 hover:bg-orange-50'}`}
                    >
                      {selectedEvent.chat_enabled === false ? 'Enable Chat' : 'Disable Chat'}
                    </button>
                  </div>
                </div>

                {/* Poster Upload */}
                <div className="bg-white rounded-xl border border-gray-100 p-5">
                  <h3 className="font-medium text-gray-900 mb-1 text-sm">Event Poster</h3>
                  <p className="text-xs text-gray-400 mb-3">Recommended: 1200x630px, JPG or PNG, max 2MB.</p>
                  {selectedEvent.poster_url && (
                    <div className="mb-3">
                      <img src={selectedEvent.poster_url} alt="Event poster" className="w-full max-w-lg rounded-xl border border-gray-100 object-cover" style={{ aspectRatio: '1200/630' }} />
                    </div>
                  )}
                  <label className="cursor-pointer block">
                    <div className={`w-full text-center border py-3 rounded-lg text-sm transition-colors ${posterUploading ? 'border-gray-200 text-gray-400' : 'border-green-200 text-green-600 hover:bg-green-50'}`}>
                      {posterUploading ? 'Uploading poster...' : selectedEvent.poster_url ? 'Replace Poster' : 'Upload Poster (JPG, PNG)'}
                    </div>
                    <input type="file" accept=".jpg,.jpeg,.png" className="hidden" disabled={posterUploading} onChange={(e) => handlePosterUpload(e, selectedEvent)} />
                  </label>
                </div>

                {/* Event Details */}
                <div className="bg-white rounded-xl border border-gray-100 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900 text-sm">Event Details</h3>
                    {!editingDetails ? (
                      <button onClick={handleStartEdit} className="text-xs px-3 py-1.5 border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 font-medium">Edit</button>
                    ) : (
                      <div className="flex gap-2">
                        <button onClick={handleCancelEdit} disabled={savingDetails} className="text-xs px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50">Cancel</button>
                        <button onClick={handleSaveDetails} disabled={savingDetails} className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50">{savingDetails ? 'Saving...' : 'Save Changes'}</button>
                      </div>
                    )}
                  </div>

                  {!editingDetails ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      <div><p className="text-gray-400">Country</p><p className="font-medium text-gray-700">{countryToFlag(selectedEvent.country)} {selectedEvent.country}</p></div>
                      <div><p className="text-gray-400">Location</p><p className="font-medium text-gray-700">{selectedEvent.location}</p></div>
                      <div><p className="text-gray-400">Discipline</p><p className="font-medium text-gray-700">{DISCIPLINE_LABELS[selectedEvent.discipline] || selectedEvent.discipline}</p></div>
                      <div><p className="text-gray-400">Dates</p><p className="font-medium text-gray-700">{selectedEvent.start_date ? new Date(selectedEvent.start_date).toLocaleDateString('en-MY', { day: 'numeric', month: 'short' }) : '—'}{selectedEvent.end_date ? ` — ${new Date(selectedEvent.end_date).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })}` : ''}</p></div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Event Name *</label>
                        <input type="text" value={editForm.name} onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">URL Slug <span className="text-orange-600">Changing breaks existing links/QR codes</span></label>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">aquaref.co/events/</span>
                          <input type="text" value={editForm.slug} onChange={(e) => setEditForm(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') }))} className="flex-1 px-3 py-2 border border-orange-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 bg-orange-50" />
                        </div>
                      </div>
       <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Primary Discipline</label>
                          <select value={editForm.discipline} onChange={(e) => setEditForm(prev => ({ ...prev, discipline: e.target.value, secondary_disciplines: prev.secondary_disciplines.filter(d => d !== e.target.value) }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white">
                            {DISCIPLINES.map(d => <option key={d.discipline} value={d.discipline}>{d.name}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Country</label>
                          <select value={editForm.country} onChange={(e) => setEditForm(prev => ({ ...prev, country: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white">
                            {COUNTRIES.map(c => <option key={c} value={c}>{countryToFlag(c)} {c}</option>)}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Secondary Disciplines <span className="text-gray-400 font-normal">(optional)</span></label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-3 border border-gray-200 rounded-lg bg-gray-50">
                          {DISCIPLINES.filter(d => d.discipline !== editForm.discipline).map(d => (
                            <label key={d.discipline} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={editForm.secondary_disciplines.includes(d.discipline)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setEditForm(prev => ({ ...prev, secondary_disciplines: [...prev.secondary_disciplines, d.discipline] }))
                                  } else {
                                    setEditForm(prev => ({ ...prev, secondary_disciplines: prev.secondary_disciplines.filter(x => x !== d.discipline) }))
                                  }
                                }}
                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-xs text-gray-700">{d.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
     <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Location</label>
                        <input type="text" value={editForm.location} onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" />
                      </div>
                     <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">State / Region <span className="text-gray-400 font-normal">(optional)</span></label>
                   <select value={editForm.state || ''} onChange={(e) => setEditForm(prev => ({ ...prev, state: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white">
                          <option value="">— Select state —</option>
                          {MALAYSIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
                          <input type="date" value={editForm.start_date} onChange={(e) => setEditForm(prev => ({ ...prev, start_date: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
                          <input type="date" value={editForm.end_date} onChange={(e) => setEditForm(prev => ({ ...prev, end_date: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Share This Event */}
                <div className="bg-white rounded-xl border border-gray-100 p-5">
                  <h3 className="font-medium text-gray-900 mb-1 text-sm">Share This Event</h3>
                  <p className="text-xs text-gray-400 mb-4">Print this QR code at the pool deck. Every scan is tracked with ?ref=qr.</p>
                  <div className="flex flex-col md:flex-row gap-5 items-start">
                    <div className="flex-shrink-0 bg-white border-2 border-gray-100 rounded-xl p-4">
                      <QRCodeSVG ref={qrSvgRef} value={getEventUrl(selectedEvent)} size={180} level="H" includeMargin={false} />
                      <div style={{ display: 'none' }}>
                        <QRCodeCanvas ref={qrPngRef} value={getEventUrl(selectedEvent)} size={512} level="H" includeMargin={true} />
                      </div>
                    </div>
                    <div className="flex-1 space-y-4 w-full">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Event URL</label>
                        <div className="flex gap-2">
                          <input type="text" value={getEventUrl(selectedEvent)} readOnly className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-xs bg-gray-50 text-gray-700 font-mono" />
                          <button onClick={handleCopyUrl} className={`text-xs px-3 py-2 rounded-lg font-medium whitespace-nowrap ${copiedUrl ? 'bg-green-100 text-green-700' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>{copiedUrl ? 'Copied!' : 'Copy'}</button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Download QR Code</label>
                        <div className="flex gap-2 flex-wrap">
                          <button onClick={handleDownloadQRPNG} className="text-xs px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">PNG (web)</button>
                          <button onClick={handleDownloadQRSVG} className="text-xs px-4 py-2 border border-green-200 text-green-600 rounded-lg hover:bg-green-50 font-medium">SVG (print)</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Event AI Prompt */}
                <div className="bg-white rounded-xl border border-gray-100 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900 text-sm">Event AI Prompt</h3>
                      <p className="text-xs text-gray-400 mt-0.5">Custom instructions for this event's AI assistant</p>
                    </div>
                    <button onClick={() => handleSaveEventPrompt(selectedEvent.id)} disabled={savingEventPrompt} className={`px-4 py-1.5 rounded-lg text-xs font-medium disabled:opacity-50 ${savedEventPrompt ? 'bg-green-100 text-green-700' : 'bg-green-600 text-white hover:bg-green-700'}`}>
                      {savingEventPrompt ? 'Saving...' : savedEventPrompt ? 'Saved!' : 'Save Prompt'}
                    </button>
                  </div>
                  <textarea value={eventPrompts[selectedEvent.id] || ''} onChange={(e) => setEventPrompts(prev => ({ ...prev, [selectedEvent.id]: e.target.value }))} rows={4} placeholder="e.g. This is the 68th Malaysia Open Swimming Championships 2029. The Meet Referee is [name]." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-700 placeholder-gray-400 resize-y" />
                </div>

                {/* Document Upload */}
                <div className="bg-white rounded-xl border border-gray-100 p-5">
                  <h3 className="font-medium text-gray-900 mb-1 text-sm">Event Documents</h3>
                  <p className="text-xs text-gray-400 mb-3">Upload start lists, heat sheets, schedules, technical packages.</p>
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4">
                    <p className="text-xs text-blue-700">Tip: For best swimmer lookup, request start lists in XLSX format from HY-TEK Meet Manager.</p>
                  </div>
                  {eventFiles[selectedEvent.id]?.length > 0 && (
                    <div className="mb-4 space-y-2">
                      {eventFiles[selectedEvent.id].map((file, i) => (
                        <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                          <div>
                            <p className="text-sm text-gray-700 font-medium">{file.name}</p>
                            <p className="text-xs text-gray-400">{file.chunks} chunks</p>
                          </div>
                          <button onClick={() => handleDeleteEventFile(selectedEvent.id, file.name)} disabled={deletingEventFile === file.name} className="text-xs text-red-500 hover:text-red-600 font-medium disabled:opacity-50">
                            {deletingEventFile === file.name ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {eventUploadProgress && <div className="mb-3 p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-700">{eventUploadProgress}</div>}
                  <label className="cursor-pointer block">
                    <div className={`w-full text-center border py-3 rounded-lg text-sm transition-colors ${eventUploading ? 'border-gray-200 text-gray-400' : 'border-green-200 text-green-600 hover:bg-green-50'}`}>
                      {eventUploading ? 'Processing document with AI...' : '+ Upload Document (PDF, DOCX, XLSX, PPTX, TXT)'}
                    </div>
                    <input type="file" accept=".pdf,.txt,.docx,.xlsx,.pptx" className="hidden" disabled={eventUploading} onChange={(e) => handleEventUpload(e, selectedEvent)} />
                  </label>
                </div>

                {/* Live Notices */}
                <div className="bg-white rounded-xl border border-gray-100 p-5">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-gray-900 text-sm">Live Notices</h3>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${eventNotices.length >= 5 ? 'bg-red-100 text-red-700' : eventNotices.length >= 3 ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500'}`}>
                      {eventNotices.length} / 5 active
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mb-4">Push real-time notices that appear as a scrolling ticker on the event chat page.</p>

                  <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 mb-4">
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-2">Category</label>
                        <div className="flex flex-wrap gap-2">
                          {NOTICE_CATEGORIES.map(cat => (
                            <button key={cat.value} onClick={() => setNoticeCategory(cat.value)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${noticeCategory === cat.value ? `${cat.color} ring-2 ring-offset-1 ring-gray-300` : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}>
                              <span className={`inline-block w-2 h-2 rounded-full mr-1.5 ${cat.dot}`}></span>
                              {cat.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-xs font-medium text-gray-700">Message</label>
                          <span className={`text-xs ${noticeMessage.length > 450 ? 'text-orange-600' : 'text-gray-400'}`}>{noticeMessage.length} / 500</span>
                        </div>
                        <textarea value={noticeMessage} onChange={(e) => setNoticeMessage(e.target.value.slice(0, 500))} rows={2} placeholder="e.g. Session 3 delayed 30 minutes due to lightning. Heats will resume at 15:00." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-700 placeholder-gray-400 resize-y" />
                      </div>
                      <button onClick={handlePushNotice} disabled={pushingNotice || !noticeMessage.trim() || eventNotices.length >= 5} className="w-full py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed">
                        {pushingNotice ? 'Pushing...' : eventNotices.length >= 5 ? 'Max 5 active notices — clear one first' : 'Push Notice'}
                      </button>
                    </div>
                  </div>

                  {eventNotices.length === 0 ? (
                    <div className="text-center py-6 text-gray-400 border border-dashed border-gray-200 rounded-lg">
                      <p className="text-xs">No active notices. Push one above to show it live.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-500 mb-2">Currently live:</p>
                      {eventNotices.map((notice) => {
                        const cat = getNoticeCategory(notice.category)
                        return (
                          <div key={notice.id} className={`border rounded-lg p-3 ${cat.color}`}>
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={`inline-block w-2 h-2 rounded-full ${cat.dot}`}></span>
                                  <span className="text-xs font-semibold uppercase tracking-wide">{cat.label}</span>
                                  <span className="text-xs opacity-60">·</span>
                                  <span className="text-xs opacity-60">{new Date(notice.created_at).toLocaleString('en-MY', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <p className="text-sm text-gray-800 break-words">{notice.message}</p>
                              </div>
                              <button onClick={() => handleClearNotice(notice.id)} disabled={clearingNotice === notice.id} className="text-xs px-3 py-1 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 font-medium flex-shrink-0 disabled:opacity-50">
                                {clearingNotice === notice.id ? 'Clearing...' : 'Clear'}
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ✅ ANALYTICS TAB */}
            {eventInnerTab === 'analytics' && (
              <div className="space-y-4">
                {eventAnalyticsLoading ? (
                  <div className="text-center py-12 text-gray-400">Loading analytics...</div>
                ) : !eventAnalytics ? (
                  <div className="text-center py-12 text-gray-400">No data yet.</div>
                ) : (
                  <>
                    {/* Summary cards */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-white rounded-xl border border-gray-100 p-5 text-center">
                        <div className="text-3xl font-bold text-green-600">{eventAnalytics.totalQuestions}</div>
                        <div className="text-xs text-gray-400 mt-1">Total Questions</div>
                      </div>
                      <div className="bg-white rounded-xl border border-gray-100 p-5 text-center">
                        <div className="text-3xl font-bold text-blue-600">{eventAnalytics.uniqueUsers}</div>
                        <div className="text-xs text-gray-400 mt-1">Unique Users</div>
                      </div>
                      <div className="bg-white rounded-xl border border-gray-100 p-5 text-center">
                        <div className="text-lg font-bold text-purple-600">RM {(eventAnalytics.totalCostUsd * RM_PER_USD).toFixed(4)}</div>
                        <div className="text-xs text-gray-400 mt-0.5">${eventAnalytics.totalCostUsd.toFixed(6)} USD</div>
                        <div className="text-xs text-gray-400 mt-1">AI Cost</div>
                      </div>
                    </div>

                    {/* Top 20 users */}
                    {eventAnalytics.top20Users.length > 0 ? (
                      <div className="bg-white rounded-xl border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold text-gray-900">Top {Math.min(eventAnalytics.top20Users.length, 20)} Users</h3>
                          <button onClick={() => loadEventAnalytics(selectedEvent.id)} className="text-xs text-blue-600 hover:text-blue-700">Refresh</button>
                        </div>
                        <div className="space-y-2">
                          {eventAnalytics.top20Users.map((user, i) => (
                            <div key={user.email} className="flex items-center gap-3">
                              <span className={`text-xs font-bold w-6 text-center rounded-full py-0.5 ${i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-gray-100 text-gray-600' : i === 2 ? 'bg-orange-100 text-orange-600' : 'text-gray-400'}`}>{i + 1}</span>
                              <span className="text-sm text-gray-700 flex-1 truncate">{user.email}</span>
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">{user.count} Q</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-400">
                        <p className="text-sm">No questions asked yet for this event.</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* ✅ CHAT LOG TAB */}
            {eventInnerTab === 'chatlog' && (
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">Event Chat Log</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{eventChatLogs.length} questions logged for this event</p>
                  </div>
                  <button onClick={() => loadEventChatLogs(selectedEvent.id)} className="text-xs text-blue-600 hover:text-blue-700">Refresh</button>
                </div>

                {/* Search */}
                <div className="mb-4">
                  <input type="text" value={eventLogKeyword} onChange={(e) => setEventLogKeyword(e.target.value)} placeholder="Search questions, answers, or users..." className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-700 placeholder-gray-400" />
                </div>

                {eventChatLogsLoading ? (
                  <div className="text-center py-8 text-gray-400">Loading chat logs...</div>
                ) : filteredEventChatLogs.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <p className="text-sm">{eventLogKeyword ? 'No results found.' : 'No questions asked yet for this event.'}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredEventChatLogs.map((log) => (
                      <div key={log.id} className="border border-gray-100 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-gray-500 font-medium">{log.user_email}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                              ${(log.cost_usd || 0).toFixed(6)}
                            </span>
                            <span className="text-xs text-gray-400">{new Date(log.created_at).toLocaleString('en-MY', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                        <p className="text-sm font-medium text-gray-900 mb-2">Q: {log.question}</p>
                        <ExpandableAnswer answer={log.answer} />
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-400">{log.tokens_input || 0} in · {log.tokens_output || 0} out tokens</span>
                          <button
                            onClick={() => { setSelectedEventLog(log); setEventCorrectionText('') }}
                            className="text-xs text-orange-600 hover:text-orange-700 font-medium"
                          >
                            Add Correction
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Event Correction Modal */}
                {selectedEventLog && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 max-w-lg w-full">
                      <h3 className="font-semibold text-gray-900 mb-4">Add Correction Note</h3>
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Question:</p>
                        <p className="text-sm text-gray-700">{selectedEventLog.question}</p>
                      </div>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Correct information:</label>
                        <textarea value={eventCorrectionText} onChange={(e) => setEventCorrectionText(e.target.value)} rows={4} placeholder="Type the correct answer or note..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900" />
                      </div>
                      <div className="flex gap-3">
                        <button onClick={() => setSelectedEventLog(null)} className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                        <button onClick={handleAddEventCorrection} disabled={savingEventCorrection || !eventCorrectionText.trim()} className="flex-1 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50">
                          {savingEventCorrection ? 'Saving...' : 'Save Correction'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Announcements tab */}
        {activeTab === 'announcements' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-gray-900">Announcements</h2>
                <p className="text-sm text-gray-400 mt-0.5">Cards shown in the user dashboard alongside events. Country-targeted and toggleable.</p>
              </div>
              <div className="flex gap-2">
                <button onClick={loadAnnouncements} className="text-sm text-orange-600 hover:text-orange-700">Refresh</button>
                <button onClick={() => setShowCreateAnnouncement(true)} className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600">+ New Announcement</button>
              </div>
            </div>

            {/* Create form */}
            {showCreateAnnouncement && (
              <div className="bg-white rounded-xl border border-orange-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">New Announcement</h3>
                  <button onClick={() => setShowCreateAnnouncement(false)} className="text-gray-400 hover:text-gray-600 text-sm">Cancel</button>
                </div>
                <div className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                    <input type="text" value={newAnnouncement.title} onChange={e => {
                      const title = e.target.value
                     const slug = title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60)
                      setNewAnnouncement(prev => ({ ...prev, title, slug }))
                    }} placeholder="e.g. Borang Maklumat Atlet — MSSNS 2026" className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea value={newAnnouncement.description} onChange={e => setNewAnnouncement(prev => ({ ...prev, description: e.target.value }))} rows={2} placeholder="Short description shown on the card" className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 resize-y" />
                  </div>
       {newAnnouncement.slug && (
                    <div className="bg-orange-50 border border-orange-100 rounded-lg px-3 py-2">
                      <p className="text-xs text-gray-500">Auto page URL: <span className="font-mono font-medium text-orange-700">aquaref.co/announcements/{newAnnouncement.slug}</span></p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Content <span className="text-gray-400 font-normal">(shown on the announcement page)</span></label>
                    <textarea value={newAnnouncement.content} onChange={e => setNewAnnouncement(prev => ({ ...prev, content: e.target.value }))} rows={6} placeholder="Write the full announcement here. This appears on the dedicated announcement page." className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 resize-y" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">URL <span className="text-gray-400 font-normal">(leave blank to use auto page)</span></label>
                    <input type="text" value={newAnnouncement.url} onChange={e => setNewAnnouncement(prev => ({ ...prev, url: e.target.value }))} placeholder="/atlet/mssns-2026 or https://example.com" className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Target Country</label>
                      <select value={newAnnouncement.country} onChange={e => setNewAnnouncement(prev => ({ ...prev, country: e.target.value }))} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 bg-white">
                        <option value="all">All Countries</option>
                        {COUNTRIES.map(c => <option key={c} value={c}>{countryToFlag(c)} {c}</option>)}
                      </select>
                    </div>
                    <div className="flex items-end">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={newAnnouncement.open_new_tab} onChange={e => setNewAnnouncement(prev => ({ ...prev, open_new_tab: e.target.checked }))} className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500" />
                        <span className="text-sm text-gray-700">Open in new tab</span>
                      </label>
                    </div>
                  </div>
          <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State / Region <span className="text-gray-400 font-normal">(optional)</span></label>
                    <select value={newAnnouncement.state} onChange={e => setNewAnnouncement(prev => ({ ...prev, state: e.target.value }))} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 bg-white">
                      <option value="">— All states —</option>
                      {MALAYSIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <button
                    onClick={async () => {
                   if (!newAnnouncement.title) { alert('Title is required.'); return }
                      if (!newAnnouncement.url && !newAnnouncement.slug) { alert('URL is required (or title must generate a slug).'); return }
                      setCreatingAnnouncement(true)
              const autoUrl = `/announcements/${newAnnouncement.slug}`
                      const { error } = await supabase.from('announcements').insert({
                        title: newAnnouncement.title.trim(),
                        description: newAnnouncement.description.trim(),
                        content: newAnnouncement.content.trim() || null,
                        url: newAnnouncement.url.trim() || autoUrl,
                        slug: newAnnouncement.slug || null,
                        country: newAnnouncement.country,
                        state: newAnnouncement.state || null,
                        is_active: false,
                        open_new_tab: newAnnouncement.open_new_tab,
                        thumbnail_url: null
                      })
                      if (error) { alert('Error: ' + error.message) }
                      else {
                 setNewAnnouncement({ title: '', description: '', url: '', country: 'Malaysia', open_new_tab: false, state: '', slug: '', content: '' })
                        setShowCreateAnnouncement(false)
                        loadAnnouncements()
                      }
                      setCreatingAnnouncement(false)
                    }}
                    disabled={creatingAnnouncement || !newAnnouncement.title || !newAnnouncement.url}
                    className="w-full py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50"
                  >
                    {creatingAnnouncement ? 'Creating...' : 'Create Announcement'}
                  </button>
                </div>
              </div>
            )}

            {/* List */}
            {announcementsLoading ? (
              <div className="text-center py-8 text-gray-400">Loading...</div>
            ) : announcements.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400">
                <p className="font-medium text-gray-500 mb-2">No announcements yet</p>
                <button onClick={() => setShowCreateAnnouncement(true)} className="text-sm text-orange-500 hover:text-orange-600 font-medium">Create your first announcement</button>
              </div>
            ) : (
              <div className="space-y-3">
                {announcements.map(ann => (
                  <div key={ann.id} className={`bg-white border rounded-xl p-5 ${ann.is_active ? 'border-orange-200' : 'border-gray-100'}`}>
                    {editingAnnouncement === ann.id ? (
                      /* ✅ EDIT MODE */
                      <div className="space-y-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-semibold text-gray-900">Editing: {ann.title}</p>
                          <button onClick={() => setEditingAnnouncement(null)} className="text-xs text-gray-400 hover:text-gray-600">Cancel</button>
                        </div>

                        {/* Thumbnail upload in edit mode */}
                        <div>
                          <p className="text-xs font-medium text-gray-700 mb-2">Thumbnail Image</p>
                          <div className="flex items-center gap-4">
                            {ann.thumbnail_url ? (
                              <img src={ann.thumbnail_url} alt="" className="w-24 h-14 rounded-lg object-cover border border-gray-100" />
                            ) : (
                              <div className="w-24 h-14 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-1">
                                <span className="text-white font-bold text-xs text-center leading-tight line-clamp-2">{ann.title}</span>
                              </div>
                            )}
                            <label className="cursor-pointer">
                              <div className="text-xs text-orange-600 border border-orange-200 px-3 py-1.5 rounded-lg hover:bg-orange-50 font-medium">
                                {announcementThumbnailUploading === ann.id ? 'Uploading...' : ann.thumbnail_url ? 'Replace Image' : 'Upload Image'}
                              </div>
                              <input type="file" accept=".jpg,.jpeg,.png" className="hidden" disabled={announcementThumbnailUploading !== null}
                                onChange={async (e) => {
                                  const file = e.target.files?.[0]
                                  if (!file) return
                                  if (file.size > 2 * 1024 * 1024) { alert('Image must be under 2MB'); return }
                                  setAnnouncementThumbnailUploading(ann.id)
                                  try {
                                    const ext = file.name.split('.').pop()
                                    const fileName = `announcements/${ann.id}/thumb_${Date.now()}.${ext}`
                                    const { data: signedData, error: signedError } = await supabase.storage.from('events').createSignedUploadUrl(fileName)
                                    if (signedError || !signedData) throw new Error('Could not create upload URL')
                                    const uploadResponse = await fetch(signedData.signedUrl, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file })
                                    if (!uploadResponse.ok) throw new Error('Upload failed')
                                    const { data: { publicUrl } } = supabase.storage.from('events').getPublicUrl(fileName)
                                    await supabase.from('announcements').update({ thumbnail_url: publicUrl }).eq('id', ann.id)
                                    loadAnnouncements()
                                  } catch (err) { alert('Upload failed: ' + (err instanceof Error ? err.message : 'Unknown')) }
                                  setAnnouncementThumbnailUploading(null)
                                  e.target.value = ''
                                }}
                              />
                            </label>
                            {ann.thumbnail_url && (
                              <button onClick={async () => {
                                await supabase.from('announcements').update({ thumbnail_url: null }).eq('id', ann.id)
                                loadAnnouncements()
                              }} className="text-xs text-red-500 hover:text-red-600">Remove</button>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 mt-1">Recommended: 1200x630px, JPG or PNG, max 2MB</p>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Title *</label>
                          <input type="text" value={editAnnouncementForm.title} onChange={e => setEditAnnouncementForm(prev => ({ ...prev, title: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                          <textarea value={editAnnouncementForm.description} onChange={e => setEditAnnouncementForm(prev => ({ ...prev, description: e.target.value }))} rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 resize-y" />
                        </div>
                       <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Full Content <span className="text-gray-400 font-normal">(shown on announcement page)</span></label>
                          <textarea value={editAnnouncementForm.content || ''} onChange={e => setEditAnnouncementForm(prev => ({ ...prev, content: e.target.value }))} rows={5} placeholder="Write the full announcement content here..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 resize-y" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">URL</label>
                          <input type="text" value={editAnnouncementForm.url} onChange={e => setEditAnnouncementForm(prev => ({ ...prev, url: e.target.value }))} placeholder="/atlet/mssns-2026 or https://..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Target Country</label>
                            <select value={editAnnouncementForm.country} onChange={e => setEditAnnouncementForm(prev => ({ ...prev, country: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 bg-white">
                              <option value="all">All Countries</option>
                              {COUNTRIES.map(c => <option key={c} value={c}>{countryToFlag(c)} {c}</option>)}
                            </select>
                          </div>
                          <div className="flex items-end">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input type="checkbox" checked={editAnnouncementForm.open_new_tab} onChange={e => setEditAnnouncementForm(prev => ({ ...prev, open_new_tab: e.target.checked }))} className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500" />
                              <span className="text-sm text-gray-700">Open in new tab</span>
                            </label>
                          </div>
                        </div>
        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">State / Region <span className="text-gray-400 font-normal">(optional)</span></label>
                          <select value={editAnnouncementForm.state || ''} onChange={e => setEditAnnouncementForm(prev => ({ ...prev, state: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 bg-white">
                            <option value="">— All states —</option>
                            {MALAYSIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => setEditingAnnouncement(null)} className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                          <button
                            onClick={async () => {
                            if (!editAnnouncementForm.title) { alert('Title is required.'); return }
                              setSavingAnnouncement(true)
              await supabase.from('announcements').update({
                                title: editAnnouncementForm.title.trim(),
                                description: editAnnouncementForm.description.trim(),
                                content: editAnnouncementForm.content?.trim() || null,
                                url: editAnnouncementForm.url.trim(),
                                country: editAnnouncementForm.country,
                                state: editAnnouncementForm.state || null,
                                open_new_tab: editAnnouncementForm.open_new_tab,
                              }).eq('id', ann.id)
                              setSavingAnnouncement(false)
                              setEditingAnnouncement(null)
                              loadAnnouncements()
                            }}
                            disabled={savingAnnouncement}
                            className="flex-1 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-50"
                          >
                            {savingAnnouncement ? 'Saving...' : 'Save Changes'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* ✅ VIEW MODE */
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="flex-shrink-0">
                            {ann.thumbnail_url ? (
                              <img src={ann.thumbnail_url} alt="" className="w-20 h-12 rounded-lg object-cover border border-gray-100" />
                            ) : (
                              <div className="w-20 h-12 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-1">
                                <span className="text-white font-bold text-xs text-center leading-tight line-clamp-2">{ann.title}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <p className="font-semibold text-gray-900 text-sm">{ann.title}</p>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${ann.is_active ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500'}`}>
                                {ann.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                            {ann.description && <p className="text-xs text-gray-500 mb-1">{ann.description}</p>}
                           <div className="flex items-center gap-3 flex-wrap">
                              <span className="text-xs text-gray-400 font-mono truncate">{ann.url}</span>
                              {ann.slug && <span className="text-xs text-orange-500 font-mono">aquaref.co/announcements/{ann.slug}</span>}
                              <span className="text-xs text-gray-400">{countryToFlag(ann.country)} {ann.country}</span>
                              {ann.open_new_tab && <span className="text-xs text-gray-400">Opens new tab</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => {
                              setEditingAnnouncement(ann.id)
            setEditAnnouncementForm({
                                title: ann.title,
                                description: ann.description || '',
                                content: ann.content || '',
                                url: ann.url,
                                slug: ann.slug || '',
                                country: ann.country,
                                open_new_tab: ann.open_new_tab,
                                state: ann.state || ''
                              })
                            }}
                            className="px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-50"
                          >
                            Edit
                          </button>
                          <button
                            onClick={async () => {
                              await supabase.from('announcements').update({ is_active: !ann.is_active }).eq('id', ann.id)
                              loadAnnouncements()
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${ann.is_active ? 'border-orange-200 text-orange-600 hover:bg-orange-50' : 'border-green-200 text-green-600 hover:bg-green-50'}`}
                          >
                            {ann.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={async () => {
                              if (!confirm('Delete this announcement?')) return
                              await supabase.from('announcements').delete().eq('id', ann.id)
                              loadAnnouncements()
                            }}
                            className="px-3 py-1.5 border border-red-200 text-red-600 rounded-lg text-xs font-medium hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Registrations tab */}
        {activeTab === 'registrations' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                <div>
                  <h2 className="font-semibold text-gray-900">Borang Maklumat Atlet — MSSNS 2026</h2>
                  <p className="text-xs text-gray-400 mt-0.5">{registrations.length} atlet didaftarkan</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                <button onClick={loadRegistrations} className="text-xs text-blue-600 hover:text-blue-700 px-3 py-1.5 border border-blue-200 rounded-lg">Refresh</button>
                  <button onClick={() => setShowRegPreview(true)} disabled={registrations.length === 0} className="text-xs bg-purple-600 text-white px-3 py-1.5 rounded-lg hover:bg-purple-700 font-medium disabled:opacity-50">Preview Jadual</button>
                  <button onClick={() => {
                      const filtered = registrations.filter(r => {
                        if (!regSearch) return true
                        const kw = regSearch.toLowerCase()
                        return r.swimmer_name?.toLowerCase().includes(kw) ||
                          r.school_club?.toLowerCase().includes(kw) ||
                          r.district?.toLowerCase().includes(kw) ||
                          r.parent_name?.toLowerCase().includes(kw)
                      })
                const headers = ['Nama Atlet', 'No. IC', 'Tarikh Lahir', 'Jantina', 'No. Telefon Atlet', 'Nama Sekolah', 'Alamat Sekolah', 'Nama Kelab', 'Daerah', 'Nama Ibu Bapa / Penjaga', 'Hubungan', 'No. Telefon', 'Emel', 'PB 1 Acara', 'PB 1 Masa', 'PB 1 Kejohanan', 'PB 1 Tahun', 'PB 2 Acara', 'PB 2 Masa', 'PB 2 Kejohanan', 'PB 2 Tahun', 'PB 3 Acara', 'PB 3 Masa', 'PB 3 Kejohanan', 'PB 3 Tahun', 'Tarikh Daftar']
                      const rows = filtered.map(r => {
                        const pbs = r.swimmer_pbs || []
                        return [
                          r.swimmer_name || '',
                          r.ic_number || '',
                          r.date_of_birth || '',
                          r.gender || '',
                          r.swimmer_phone || '',
                          r.school_name || r.school_club || '',
                          r.school_address || '',
                          r.club_name || '',
                          r.district || '',
                          r.parent_name || '',
                          r.parent_relationship || '',
                          r.parent_phone || '',
                          r.parent_email || '',
                          pbs[0]?.event_name || '', pbs[0]?.time || '', pbs[0]?.nama_kejohanan || pbs[0]?.competition_or_training || '', pbs[0]?.tahun || '',
                          pbs[1]?.event_name || '', pbs[1]?.time || '', pbs[1]?.nama_kejohanan || pbs[1]?.competition_or_training || '', pbs[1]?.tahun || '',
                          pbs[2]?.event_name || '', pbs[2]?.time || '', pbs[2]?.nama_kejohanan || pbs[2]?.competition_or_training || '', pbs[2]?.tahun || '',
                          new Date(r.created_at).toLocaleDateString('en-MY')
                        ]
                      })
                      const csv = [headers, ...rows].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n')
                      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
                      const url = URL.createObjectURL(blob)
                      const link = document.createElement('a')
                      link.href = url
                      link.download = `mssns-2026-atlet-${new Date().toISOString().split('T')[0]}.csv`
                      link.click()
                      URL.revokeObjectURL(url)
                    }}
                    className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 font-medium"
                  >
                    Export Excel (CSV)
                  </button>
                  <button
                    onClick={async () => {
                      if (!confirm('Padam SEMUA data pendaftaran? Tindakan ini tidak boleh dibatalkan.')) return
                      setDeletingAllReg(true)
                      await supabase.from('swimmer_pbs').delete().neq('id', '00000000-0000-0000-0000-000000000000')
                      await supabase.from('swimmer_profiles').delete().neq('id', '00000000-0000-0000-0000-000000000000')
                      setRegistrations([])
                      setDeletingAllReg(false)
                      alert('Semua data telah dipadam.')
                    }}
                    disabled={deletingAllReg || registrations.length === 0}
                    className="text-xs bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 font-medium disabled:opacity-50"
                  >
                    {deletingAllReg ? 'Memadam...' : 'Padam Semua'}
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <input
                  type="text"
                  value={regSearch}
                  onChange={e => setRegSearch(e.target.value)}
                  placeholder="Cari nama atlet, sekolah, daerah, ibu bapa..."
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 placeholder-gray-400"
                />
              </div>

              {registrationsLoading ? (
                <div className="text-center py-8 text-gray-400">Memuatkan...</div>
              ) : registrations.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <p className="text-sm">Tiada pendaftaran lagi.</p>
                  <p className="text-xs mt-1">Kongsi pautan: <strong>aquaref.co/atlet/mssns-2026</strong></p>
                </div>
              ) : (
                <div className="space-y-3">
                  {registrations
                    .filter(r => {
                      if (!regSearch) return true
                      const kw = regSearch.toLowerCase()
                      return r.swimmer_name?.toLowerCase().includes(kw) ||
                        r.school_club?.toLowerCase().includes(kw) ||
                        r.district?.toLowerCase().includes(kw) ||
                        r.parent_name?.toLowerCase().includes(kw)
                    })
                    .map((r) => (
                      <div key={r.id} className="border border-gray-100 rounded-xl p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <p className="font-semibold text-gray-900 text-sm">{r.swimmer_name}</p>
                              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">{r.gender}</span>
                              <span className="text-xs text-gray-400">{r.district}</span>
                            </div>
                            <p className="text-xs text-gray-500">{r.school_club}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              Ibu Bapa: {r.parent_name} ({r.parent_relationship}) · {r.parent_phone} · {r.parent_email}
                            </p>
                            {r.swimmer_pbs && r.swimmer_pbs.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-2">
                                {r.swimmer_pbs.map((pb: any, i: number) => (
                                  <span key={i} className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full border border-green-100">
                                    {pb.event_name}: {pb.time}
                                    {pb.competition_or_training ? ` (${pb.competition_or_training})` : ''}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                            <p className="text-xs text-gray-400">{new Date(r.created_at).toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  }
                </div>
              )}
            </div>

     {/* Preview Table Modal */}
            {showRegPreview && (
              <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex flex-col">
                <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
                  <div>
                    <h3 className="font-semibold text-gray-900">Preview Jadual — MSSNS 2026</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{registrations.length} atlet · Skrol kanan untuk lihat semua kolum</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const headers = ['Nama Atlet', 'No. IC', 'Tarikh Lahir', 'Jantina', 'No. Telefon Atlet', 'Nama Sekolah', 'Alamat Sekolah', 'Nama Kelab', 'Daerah', 'Nama Ibu Bapa / Penjaga', 'Hubungan', 'No. Telefon', 'Emel', 'PB 1 Acara', 'PB 1 Masa', 'PB 1 Kejohanan', 'PB 1 Tahun', 'PB 2 Acara', 'PB 2 Masa', 'PB 2 Kejohanan', 'PB 2 Tahun', 'PB 3 Acara', 'PB 3 Masa', 'PB 3 Kejohanan', 'PB 3 Tahun', 'Tarikh Daftar']
                        const rows = registrations.map(r => {
                          const pbs = r.swimmer_pbs || []
                          return [
                            r.swimmer_name || '', r.ic_number || '', r.date_of_birth || '', r.gender || '', r.swimmer_phone || '',
                            r.school_name || r.school_club || '', r.school_address || '', r.club_name || '', r.district || '',
                            r.parent_name || '', r.parent_relationship || '', r.parent_phone || '', r.parent_email || '',
                            pbs[0]?.event_name || '', pbs[0]?.time || '', pbs[0]?.nama_kejohanan || '', pbs[0]?.tahun || '',
                            pbs[1]?.event_name || '', pbs[1]?.time || '', pbs[1]?.nama_kejohanan || '', pbs[1]?.tahun || '',
                            pbs[2]?.event_name || '', pbs[2]?.time || '', pbs[2]?.nama_kejohanan || '', pbs[2]?.tahun || '',
                            new Date(r.created_at).toLocaleDateString('en-MY')
                          ]
                        })
                        const csv = [headers, ...rows].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n')
                        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
                        const url = URL.createObjectURL(blob)
                        const link = document.createElement('a')
                        link.href = url
                        link.download = `mssns-2026-atlet-${new Date().toISOString().split('T')[0]}.csv`
                        link.click()
                        URL.revokeObjectURL(url)
                      }}
                      className="text-xs bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-medium"
                    >
                      Export CSV
                    </button>
                    <button onClick={() => setShowRegPreview(false)} className="text-xs bg-gray-100 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-200 font-medium">Tutup</button>
                  </div>
                </div>
                <div className="flex-1 overflow-auto p-4">
                  <table className="min-w-full text-xs border-collapse bg-white rounded-xl overflow-hidden shadow">
                    <thead className="bg-purple-600 text-white sticky top-0">
                      <tr>
                        {['#', 'Nama Atlet', 'No. IC', 'Tarikh Lahir', 'Jantina', 'Tel. Atlet', 'Nama Sekolah', 'Alamat Sekolah', 'Kelab', 'Daerah', 'Ibu Bapa', 'Hubungan', 'Tel. IB', 'Emel', 'PB1 Acara', 'PB1 Masa', 'PB1 Kejohanan', 'PB1 Tahun', 'PB2 Acara', 'PB2 Masa', 'PB2 Kejohanan', 'PB2 Tahun', 'PB3 Acara', 'PB3 Masa', 'PB3 Kejohanan', 'PB3 Tahun', 'Tarikh Daftar'].map((h, i) => (
                          <th key={i} className="px-3 py-2 text-left font-semibold whitespace-nowrap border-r border-purple-500 last:border-r-0">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {registrations.map((r, idx) => {
                        const pbs = r.swimmer_pbs || []
                        return (
                          <tr key={r.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-3 py-2 border-r border-gray-100 text-gray-400 font-medium">{idx + 1}</td>
                            <td className="px-3 py-2 border-r border-gray-100 font-medium text-gray-900 whitespace-nowrap">{r.swimmer_name}</td>
                            <td className="px-3 py-2 border-r border-gray-100 text-gray-600 whitespace-nowrap">{r.ic_number || '—'}</td>
                            <td className="px-3 py-2 border-r border-gray-100 text-gray-600 whitespace-nowrap">{r.date_of_birth || '—'}</td>
                            <td className="px-3 py-2 border-r border-gray-100 text-gray-600">{r.gender || '—'}</td>
                            <td className="px-3 py-2 border-r border-gray-100 text-gray-600 whitespace-nowrap">{r.swimmer_phone || '—'}</td>
                            <td className="px-3 py-2 border-r border-gray-100 text-gray-600 whitespace-nowrap max-w-[150px] truncate">{r.school_name || r.school_club || '—'}</td>
                            <td className="px-3 py-2 border-r border-gray-100 text-gray-600 max-w-[200px] truncate">{r.school_address || '—'}</td>
                            <td className="px-3 py-2 border-r border-gray-100 text-gray-600 whitespace-nowrap">{r.club_name || '—'}</td>
                            <td className="px-3 py-2 border-r border-gray-100 text-gray-600">{r.district || '—'}</td>
                            <td className="px-3 py-2 border-r border-gray-100 text-gray-600 whitespace-nowrap">{r.parent_name || '—'}</td>
                            <td className="px-3 py-2 border-r border-gray-100 text-gray-600">{r.parent_relationship || '—'}</td>
                            <td className="px-3 py-2 border-r border-gray-100 text-gray-600 whitespace-nowrap">{r.parent_phone || '—'}</td>
                            <td className="px-3 py-2 border-r border-gray-100 text-gray-600 whitespace-nowrap">{r.parent_email || '—'}</td>
                            <td className="px-3 py-2 border-r border-gray-100 text-gray-600 whitespace-nowrap">{pbs[0]?.event_name || '—'}</td>
                            <td className="px-3 py-2 border-r border-gray-100 text-gray-600">{pbs[0]?.time || '—'}</td>
                            <td className="px-3 py-2 border-r border-gray-100 text-gray-600 whitespace-nowrap">{pbs[0]?.nama_kejohanan || '—'}</td>
                            <td className="px-3 py-2 border-r border-gray-100 text-gray-600">{pbs[0]?.tahun || '—'}</td>
                            <td className="px-3 py-2 border-r border-gray-100 text-gray-600 whitespace-nowrap">{pbs[1]?.event_name || '—'}</td>
                            <td className="px-3 py-2 border-r border-gray-100 text-gray-600">{pbs[1]?.time || '—'}</td>
                            <td className="px-3 py-2 border-r border-gray-100 text-gray-600 whitespace-nowrap">{pbs[1]?.nama_kejohanan || '—'}</td>
                            <td className="px-3 py-2 border-r border-gray-100 text-gray-600">{pbs[1]?.tahun || '—'}</td>
                            <td className="px-3 py-2 border-r border-gray-100 text-gray-600 whitespace-nowrap">{pbs[2]?.event_name || '—'}</td>
                            <td className="px-3 py-2 border-r border-gray-100 text-gray-600">{pbs[2]?.time || '—'}</td>
                            <td className="px-3 py-2 border-r border-gray-100 text-gray-600 whitespace-nowrap">{pbs[2]?.nama_kejohanan || '—'}</td>
                            <td className="px-3 py-2 border-r border-gray-100 text-gray-600">{pbs[2]?.tahun || '—'}</td>
                            <td className="px-3 py-2 text-gray-400 whitespace-nowrap">{new Date(r.created_at).toLocaleDateString('en-MY')}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <p className="text-sm font-medium text-blue-900 mb-1">Pautan Borang</p>
              <p className="text-xs text-blue-700 mb-2">Kongsi pautan ini dengan ibu bapa / penjaga atlet MSSNS 2026:</p>
              <div className="flex gap-2">
                <input type="text" value="https://aquaref.co/atlet/mssns-2026" readOnly className="flex-1 px-3 py-2 border border-blue-200 rounded-lg text-xs bg-white text-gray-700 font-mono" />
                <button
                  onClick={() => navigator.clipboard.writeText('https://aquaref.co/atlet/mssns-2026')}
                  className="text-xs bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 font-medium whitespace-nowrap"
                >
                  Salin
                </button>
              </div>
            </div>
          </div>
        )}

  {/* Messages tab */}
        {activeTab === 'messages' && (
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-semibold text-gray-900">User Messages</h2>
                <p className="text-xs text-gray-400 mt-0.5">{userMessages.length} messages received</p>
              </div>
              <button onClick={loadMessages} className="text-sm text-blue-600 hover:text-blue-700">Refresh</button>
            </div>
            {messagesLoading ? (
              <div className="text-center py-8 text-gray-400">Loading...</div>
            ) : userMessages.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p className="text-2xl mb-2">💬</p>
                <p className="text-sm">No messages yet. Share the feedback button with your users!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {userMessages.map((msg) => (
                  <div key={msg.id} className="border border-gray-100 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">{msg.user_email}</span>
                      <span className="text-xs text-gray-400">{new Date(msg.created_at).toLocaleString('en-MY', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                  </div>
                ))}
              </div>
)}  
          </div>
        )}

        {/* Inbox tab — Broadcast Messages */}
        {activeTab === 'inbox' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-indigo-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-semibold text-gray-900">Broadcast Inbox Messages</h2>
                  <p className="text-sm text-gray-400 mt-0.5">Send messages directly to users&apos; inboxes. {broadcastLogs.length} broadcast{broadcastLogs.length !== 1 ? 's' : ''} sent so far.</p>
                </div>
                <button onClick={loadBroadcasts} className="text-sm text-indigo-600 hover:text-indigo-700">Refresh</button>
              </div>

              <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 text-center">
                <p className="text-sm text-indigo-700 font-medium">Inbox tab is working!</p>
                <p className="text-xs text-indigo-600 mt-1">Broadcast form and history list coming next.</p>
                <p className="text-xs text-indigo-500 mt-2">
                  Loading state: {broadcastsLoading ? 'loading...' : 'ready'} · Records: {broadcastLogs.length}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* System Prompt tab */}
        {activeTab === 'system prompt' && (
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-2">Base System Prompt</h2>
            <p className="text-sm text-gray-400 mb-4">Base prompt for ALL disciplines.</p>
            {promptLoading ? <div className="text-center py-8 text-gray-400">Loading...</div> : (
              <>
                <textarea value={systemPrompt} onChange={(e) => setSystemPrompt(e.target.value)} rows={20} className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700" />
                <div className="flex items-center justify-between mt-4">
                  <p className="text-xs text-gray-400">Discipline-specific notes go in the Rulebooks tab</p>
                  <button onClick={handleSavePrompt} disabled={promptLoading} className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">{promptSaved ? 'Saved!' : 'Save Changes'}</button>
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
            <div className="mb-4"><input type="text" value={logKeyword} onChange={(e) => setLogKeyword(e.target.value)} placeholder="Search..." className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 placeholder-gray-400" /></div>
            <div className="flex gap-3 mb-4">
              <div className="flex-1"><label className="block text-xs text-gray-400 mb-1">From</label><input type="date" value={logDateFrom} onChange={(e) => setLogDateFrom(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700" /></div>
              <div className="flex-1"><label className="block text-xs text-gray-400 mb-1">To</label><input type="date" value={logDateTo} onChange={(e) => setLogDateTo(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700" /></div>
              <div className="flex items-end"><button onClick={() => { setLogKeyword(''); setLogDateFrom(''); setLogDateTo(''); setLogDisciplineFilter('all') }} className="px-4 py-2 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50">Clear</button></div>
            </div>
            <div className="flex gap-2 mb-6 flex-wrap">
              {['all', 'swimming', 'waterpolo', 'artistic', 'diving', 'highdiving', 'masters', 'openwater', 'paraswimming'].map((tab) => {
                const count = tab === 'all' ? chatLogs.length : chatLogs.filter(l => l.discipline === tab).length
                return <button key={tab} onClick={() => setLogDisciplineFilter(tab)} className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${logDisciplineFilter === tab ? tab === 'paraswimming' ? 'bg-purple-600 text-white' : 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>{tab === 'all' ? 'All' : DISCIPLINE_LABELS[tab] || tab} ({count})</button>
              })}
            </div>
            {logsLoading ? <div className="text-center py-8 text-gray-400">Loading...</div> : filteredLogs.length === 0 ? (
              <div className="text-center py-12 text-gray-400"><p>No conversations found</p></div>
            ) : (
              <div className="space-y-4">
                {filteredLogs.map((log) => (
                  <div key={log.id} className="border border-gray-100 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${log.discipline === 'paraswimming' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>{DISCIPLINE_LABELS[log.discipline] || log.discipline}</span>
                        <span className="text-xs text-gray-400">{log.user_email}</span>
                      </div>
                      <span className="text-xs text-gray-400">{new Date(log.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 mb-1">Q: {log.question}</p>
                    <ExpandableAnswer answer={log.answer} />
                    <button onClick={() => { setSelectedLog(log); setCorrectionText('') }} className="mt-2 text-xs text-orange-600 hover:text-orange-700 font-medium">Add Correction</button>
                  </div>
                ))}
              </div>
            )}
            {selectedLog && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl p-6 max-w-lg w-full">
                  <h3 className="font-semibold text-gray-900 mb-4">Add Correction Note</h3>
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg"><p className="text-xs text-gray-500 mb-1">Question:</p><p className="text-sm text-gray-700">{selectedLog.question}</p></div>
                  <div className="mb-4"><label className="block text-sm font-medium text-gray-700 mb-2">Correct information:</label><textarea value={correctionText} onChange={(e) => setCorrectionText(e.target.value)} rows={4} placeholder="Type the correct answer..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" /></div>
                  <div className="flex gap-3">
                    <button onClick={() => setSelectedLog(null)} className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                    <button onClick={handleAddCorrection} disabled={savingCorrection || !correctionText.trim()} className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">{savingCorrection ? 'Saving...' : 'Save Correction'}</button>
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
              <h2 className="font-semibold text-gray-900">Correction Notes</h2>
              <button onClick={loadCorrections} className="text-sm text-blue-600 hover:text-blue-700">Refresh</button>
            </div>
            <div className="mb-4"><input type="text" value={correctionKeyword} onChange={(e) => setCorrectionKeyword(e.target.value)} placeholder="Search..." className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 placeholder-gray-400" /></div>
            {filteredCorrections.length === 0 ? <div className="text-center py-12 text-gray-400"><p>No corrections found</p></div> : (
              <div className="space-y-4">
                {filteredCorrections.map((c) => (
                  <div key={c.id} className="border border-gray-100 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${c.discipline === 'paraswimming' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>{DISCIPLINE_LABELS[c.discipline] || c.discipline}</span>
                      <div className="flex items-center gap-3"><span className="text-xs text-gray-400">{new Date(c.created_at).toLocaleDateString()}</span><button onClick={() => handleDeleteCorrection(c.id)} className="text-xs text-red-500 hover:text-red-600">Delete</button></div>
                    </div>
                    <p className="text-sm font-medium text-gray-900 mb-1">Q: {c.question}</p>
                    <p className="text-sm text-green-700 bg-green-50 p-2 rounded-lg">{c.correct_note}</p>
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
              <h2 className="font-semibold text-gray-900">User Feedback</h2>
              <button onClick={loadFeedback} className="text-sm text-blue-600 hover:text-blue-700">Refresh</button>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-green-50 rounded-xl p-4 text-center"><div className="text-2xl font-bold text-green-600">{totalLikes}</div><div className="text-xs text-gray-400 mt-1">Helpful</div></div>
              <div className="bg-red-50 rounded-xl p-4 text-center"><div className="text-2xl font-bold text-red-500">{totalDislikes}</div><div className="text-xs text-gray-400 mt-1">Not Helpful</div></div>
              <div className="bg-blue-50 rounded-xl p-4 text-center"><div className="text-2xl font-bold text-blue-600">{satisfactionRate}%</div><div className="text-xs text-gray-400 mt-1">Satisfaction</div></div>
            </div>
            {feedbackLoading ? <div className="text-center py-8 text-gray-400">Loading...</div> : filteredFeedback.length === 0 ? <div className="text-center py-12 text-gray-400"><p>No feedback found</p></div> : (
              <div className="space-y-4">
                {filteredFeedback.map((f) => (
                  <div key={f.id} className={`border rounded-xl p-4 ${f.feedback === 'like' ? 'border-green-100 bg-green-50' : 'border-red-100 bg-red-50'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">{DISCIPLINE_LABELS[f.discipline] || f.discipline}</span>
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
              <h2 className="font-semibold text-gray-900 mb-4">Grant Beta Access</h2>
              <div className="flex gap-3 flex-wrap">
                <div className="flex-1 min-w-48"><label className="block text-xs text-gray-400 mb-1">Email</label><input type="email" value={betaEmail} onChange={(e) => setBetaEmail(e.target.value)} placeholder="user@example.com" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400" /></div>
                <div><label className="block text-xs text-gray-400 mb-1">Duration</label><select value={betaDays} onChange={(e) => setBetaDays(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white"><option value="7">7 days</option><option value="14">14 days</option><option value="30">30 days</option><option value="60">60 days</option><option value="90">90 days</option></select></div>
                <div className="flex items-end"><button onClick={handleGrantBeta} disabled={grantingBeta || !betaEmail.trim()} className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">{grantingBeta ? 'Granting...' : 'Grant Beta'}</button></div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-semibold text-gray-900">Active Beta Users ({betaUsers.length})</h2>
                <button onClick={loadBetaUsers} className="text-sm text-blue-600 hover:text-blue-700">Refresh</button>
              </div>
              {betaLoading ? <div className="text-center py-8 text-gray-400">Loading...</div> : betaUsers.length === 0 ? <div className="text-center py-12 text-gray-400"><p>No active beta users</p></div> : (
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
                              <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">{daysLeft}d left</span>
                              <span className="text-xs text-gray-400">Expires {expiry.toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {extendEmail === u.user_email ? (
                              <div className="flex items-center gap-2">
                                <select value={extendDays} onChange={(e) => setExtendDays(e.target.value)} className="px-2 py-1 border border-gray-200 rounded-lg text-xs text-gray-900 bg-white"><option value="7">+7d</option><option value="14">+14d</option><option value="30">+30d</option><option value="60">+60d</option></select>
                                <button onClick={() => handleExtendBeta(u.user_email)} className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700">Confirm</button>
                                <button onClick={() => setExtendEmail(null)} className="px-3 py-1 border border-gray-200 text-gray-500 rounded-lg text-xs">Cancel</button>
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
            {subscribersLoading ? <div className="text-center py-8 text-gray-400">Loading...</div> : (
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-3 mb-6">
                  <div className="bg-green-50 rounded-xl p-3 text-center"><div className="text-xl font-bold text-green-600">{liteSubs.length}</div><div className="text-xs text-gray-400 mt-1">LITE</div></div>
                  <div className="bg-blue-50 rounded-xl p-3 text-center"><div className="text-xl font-bold text-blue-600">{proSubs.length}</div><div className="text-xs text-gray-400 mt-1">PRO</div></div>
                  <div className="bg-yellow-50 rounded-xl p-3 text-center"><div className="text-xl font-bold text-yellow-600">{eliteSubs.length}</div><div className="text-xs text-gray-400 mt-1">ELITE</div></div>
                  <div className="bg-gray-50 rounded-xl p-3 text-center"><div className="text-xl font-bold text-gray-600">{userSubscriptions.filter(s => s.status === 'cancelled').length}</div><div className="text-xs text-gray-400 mt-1">Cancelled</div></div>
                </div>
                {userSubscriptions.map((sub) => (
                  <div key={sub.id} className="border border-gray-100 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{sub.full_name || '—'}</p>
                        <p className="text-xs text-gray-400">{sub.user_email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getPlanColor(sub.plan)}`}>{getPlanLabel(sub.plan)}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${sub.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{sub.status}</span>
                          {sub.country && <span className="text-xs text-gray-400">{countryToFlag(sub.country)} {sub.country}</span>}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">Joined {new Date(sub.created_at).toLocaleDateString()}</p>
                        {lastLogins[sub.user_email] && <p className="text-xs text-gray-400">Active {new Date(lastLogins[sub.user_email]).toLocaleDateString()}</p>}
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
            {analyticsLoading ? <div className="text-center py-8 text-gray-400">Loading...</div> : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-xl border border-gray-100 p-4 text-center"><div className="text-2xl font-bold text-green-600">RM {estimatedMRR.toFixed(2)}</div><div className="text-xs text-gray-400 mt-1">Est. MRR</div></div>
                  <div className="bg-white rounded-xl border border-gray-100 p-4 text-center"><div className="text-2xl font-bold text-blue-600">{newSubsLast30Days}</div><div className="text-xs text-gray-400 mt-1">New Paid (30d)</div></div>
                  <div className="bg-white rounded-xl border border-gray-100 p-4 text-center"><div className="text-2xl font-bold text-purple-600">{satisfactionRate}%</div><div className="text-xs text-gray-400 mt-1">Satisfaction</div></div>
                  <div className="bg-white rounded-xl border border-gray-100 p-4 text-center"><div className="text-2xl font-bold text-orange-600">{chatLogs.length}</div><div className="text-xs text-gray-400 mt-1">Total Questions</div></div>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">AI Cost (Rules Chat)</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-purple-50 rounded-xl p-4"><p className="text-xs text-gray-400 mb-1">This Month</p><p className="text-2xl font-bold text-purple-700">RM {thisMonthCostRM.toFixed(4)}</p></div>
                    <div className="bg-gray-50 rounded-xl p-4"><p className="text-xs text-gray-400 mb-1">All Time</p><p className="text-2xl font-bold text-gray-700">RM {costRM.toFixed(4)}</p></div>
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-6"><h3 className="font-semibold text-gray-900 mb-4">Questions — Last 7 Days</h3><SimpleBarChart data={last7Days} /></div>
                {disciplineUsage.length > 0 && <div className="bg-white rounded-xl border border-gray-100 p-6"><h3 className="font-semibold text-gray-900 mb-4">Popular Disciplines</h3><SimpleBarChart data={disciplineUsage} /></div>}
                {top10Users.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-100 p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Top 10 Users (Rules Chat)</h3>
                    <div className="space-y-2">
                      {top10Users.map(([email, count], i) => (
                        <div key={email} className="flex items-center gap-3">
                          <span className="text-xs text-gray-400 w-4">{i + 1}</span>
                          <span className="text-sm text-gray-700 flex-1 truncate">{email}</span>
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{count} q</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {countryData.length > 0 && <div className="bg-white rounded-xl border border-gray-100 p-6"><h3 className="font-semibold text-gray-900 mb-4">Users by Country</h3><SimpleBarChart data={countryData} /></div>}
                {recentActiveUsers.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-100 p-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Last 10 Signups</h3>
                    <p className="text-xs text-gray-400 mb-3">Most recent accounts created</p>
                    <div className="space-y-2">
                      {recentActiveUsers.map((user) => (
                        <div key={user.email} className="flex items-center justify-between">
                          <span className="text-sm text-gray-700 truncate flex-1">{user.email}</span>
                          <span className="text-xs text-gray-400">{new Date(user.created_at).toLocaleString('en-MY', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}