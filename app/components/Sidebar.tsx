'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

interface SidebarProps {
  userEmail?: string
  currentPath?: string
  inboxUnreadCount?: number
  onOpenInbox?: () => void
  onOpenMyPlan?: () => void
  onOpenSubmit?: () => void
}

const comingSoonItems = [
  { label: 'Daily Drill', icon: '🏋️', id: 'drill' },
  { label: 'Pathway Tracker', icon: '🗺️', id: 'pathway' },
  { label: 'Academy', icon: '🎓', id: 'academy' },
]

export default function Sidebar({
  userEmail,
  currentPath = '',
  inboxUnreadCount = 0,
  onOpenInbox,
  onOpenMyPlan,
  onOpenSubmit,
}: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [discipline, setDiscipline] = useState<string | null>(null)

  useEffect(() => {
    const loadDiscipline = async () => {
      if (!userEmail) return
      const { data } = await supabase
        .from('user_subscriptions')
        .select('selected_discipline')
        .eq('user_email', userEmail)
        .single()
      if (data?.selected_discipline) setDiscipline(data.selected_discipline)
    }
    loadDiscipline()
  }, [userEmail])

  const rulesHref = discipline ? `/chat/${discipline}` : '/dashboard'
  const isDashboard = currentPath === '/dashboard'
  const isRules = currentPath.startsWith('/chat/')

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const closeMobile = () => setMobileOpen(false)

  const navLinkClass = (active: boolean) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all w-full text-left ${
      active
        ? 'border-l-4 border-blue-600 bg-blue-50 text-blue-700 pl-2'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`

  const inner = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-gray-100 flex-shrink-0">
        <a href="/dashboard" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity" onClick={closeMobile}>
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <span className="font-bold text-lg text-gray-900">AquaRef</span>
        </a>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">

        <a href="/dashboard" onClick={closeMobile} className={navLinkClass(isDashboard)}>
          <span className="text-base">🏠</span>
          <span>Dashboard</span>
        </a>

        <a href={rulesHref} onClick={closeMobile} className={navLinkClass(isRules)}>
          <span className="text-base">💬</span>
          <span>Rules AI</span>
        </a>

  <button
          onClick={() => {
            closeMobile()
            if (window.location.pathname !== '/dashboard') {
              window.location.href = '/dashboard'
              return
            }
            const el = Array.from(document.querySelectorAll('h2')).find(h => h.textContent?.startsWith('Live Events'))
            el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }}
          className={navLinkClass(false)}
        >
          <span className="text-base">📅</span>
          <span>Events</span>
        </button>

        <button
          onClick={() => {
            closeMobile()
            if (window.location.pathname !== '/dashboard') {
              window.location.href = '/dashboard'
              return
            }
            const el = Array.from(document.querySelectorAll('h2')).find(h => h.textContent?.startsWith('My Submissions'))
            el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }}
          className={navLinkClass(false)}
        >
          <span className="text-base">📤</span>
          <span>My Submissions</span>
        </button>

        {/* Inbox */}
        <button
          onClick={() => { onOpenInbox?.(); closeMobile() }}
          className={navLinkClass(false)}
        >
          <span className="text-base">📥</span>
          <span className="flex-1">Inbox</span>
          {inboxUnreadCount > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center">
              {inboxUnreadCount > 99 ? '99+' : inboxUnreadCount}
            </span>
          )}
        </button>

        {/* Submit */}
        <button
          onClick={() => { onOpenSubmit?.(); closeMobile() }}
          className={navLinkClass(false)}
        >
          <span className="text-base">➕</span>
          <span>Submit</span>
        </button>

        {/* Coming Soon divider */}
        <div className="pt-4 pb-2">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3">Coming Soon</p>
        </div>

        {comingSoonItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 cursor-not-allowed"
          >
            <span className="text-base opacity-40">{item.icon}</span>
            <span className="flex-1">{item.label}</span>
            <span className="text-[10px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-full font-medium">Soon</span>
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-gray-100 space-y-1 flex-shrink-0">
        <button
          onClick={() => { onOpenMyPlan?.(); closeMobile() }}
          className={navLinkClass(false)}
        >
          <span className="text-base">⭐</span>
          <span>My Plan</span>
        </button>

        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 cursor-not-allowed">
          <span className="text-base opacity-40">👤</span>
          <span className="flex-1">Profile</span>
          <span className="text-[10px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-full font-medium">Soon</span>
        </div>

        {userEmail && (
          <div className="px-3 py-2">
            <p className="text-xs text-gray-400 truncate">{userEmail}</p>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-red-50 hover:text-red-600 transition-all w-full text-left"
        >
          <span className="text-base">🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-[220px] flex-shrink-0 bg-white border-r border-gray-100 h-screen sticky top-0 overflow-hidden">
        {inner}
      </aside>

      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-3.5 left-3.5 z-40 w-9 h-9 bg-white border border-gray-200 rounded-lg flex items-center justify-center shadow-sm hover:bg-gray-50"
        aria-label="Open menu"
      >
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div className="md:hidden fixed inset-0 bg-black bg-opacity-40 z-40" onClick={closeMobile} />
          <div className="md:hidden fixed top-0 left-0 h-full w-[70%] max-w-[280px] bg-white z-50 shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-end px-4 py-3 border-b border-gray-100 flex-shrink-0">
              <button onClick={closeMobile} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              {inner}
            </div>
          </div>
        </>
      )}
    </>
  )
}