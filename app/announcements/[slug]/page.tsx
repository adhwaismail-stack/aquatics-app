'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { use } from 'react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const disciplines = [
  { id: 'swimming', name: 'Swimming', emoji: '🏊', desc: 'SW Rules — DQ, turns, strokes & relay rules' },
  { id: 'waterpolo', name: 'Water Polo', emoji: '🤽', desc: 'WP Rules — gameplay, fouls & referee duties' },
  { id: 'openwater', name: 'Open Water', emoji: '🌊', desc: 'OW Rules — equipment, feeding & safety rules' },
  { id: 'diving', name: 'Diving', emoji: '🤿', desc: 'DV Rules — scoring, degree of difficulty & platform rules' },
]

interface Announcement {
  id: string
  title: string
  description: string
  content: string | null
  url: string
  country: string
  state: string | null
  is_active: boolean
  thumbnail_url: string | null
  slug: string
  created_at: string
}

export default function AnnouncementPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [announcement, setAnnouncement] = useState<Announcement | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const load = async () => {
      // Check auth
      const { data: { user } } = await supabase.auth.getUser()
      setIsLoggedIn(!!user)

      const { data } = await supabase
        .from('announcements')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single()
      if (!data) setNotFound(true)
      else setAnnouncement(data)
      setLoading(false)
    }
    load()
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (notFound || !announcement) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-2xl mb-2">📭</p>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Announcement Not Found</h2>
          <p className="text-gray-400 text-sm mb-6">This announcement may have ended or been removed.</p>
          <a href="/" className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Go to AquaRef</a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-gray-50 flex flex-col">
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <a href={isLoggedIn ? '/dashboard' : '/'} className="flex items-center gap-2 hover:opacity-80">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="font-bold text-xl text-gray-900">AquaRef</span>
          </a>
          {isLoggedIn ? (
            <a href="/dashboard" className="text-sm text-blue-600 hover:text-blue-700 font-medium">Dashboard →</a>
          ) : (
            <a href="/login" className="text-sm text-blue-600 hover:text-blue-700 font-medium">Log in →</a>
          )}
        </div>
      </div>

      <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
        {announcement.thumbnail_url && (
          <div className="mb-6 rounded-2xl overflow-hidden shadow-lg border border-gray-200">
            <img src={announcement.thumbnail_url} alt={announcement.title} className="w-full object-cover" style={{ aspectRatio: '1200/630' }} />
          </div>
        )}

        <div className="mb-6">
          {announcement.state && (
            <span className="inline-block text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium mb-3">
              📍 {announcement.state}
            </span>
          )}
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{announcement.title}</h1>
          {announcement.description && (
            <p className="text-gray-500 text-sm leading-relaxed">{announcement.description}</p>
          )}
          <p className="text-xs text-gray-400 mt-2">
            {new Date(announcement.created_at).toLocaleDateString('en-MY', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        {announcement.content && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8 shadow-sm">
            <div className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm">{announcement.content}</div>
          </div>
        )}

        <div className="flex items-center gap-3 mb-8">
          <div className="flex-1 h-px bg-gray-200"></div>
          <span className="text-xs text-gray-400 font-medium">Powered by AquaRef</span>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>

        {/* Discipline cards */}
        <div className="bg-white rounded-2xl border border-blue-100 p-6 mb-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <div>
              <h2 className="font-bold text-gray-900">Try AquaRef Rules Assistant</h2>
              <p className="text-xs text-gray-400">Instant AI answers from official World Aquatics regulations</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
            {disciplines.map(d => (
              <a key={d.id} href={isLoggedIn ? `/chat/${d.id}` : '/login'} className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 hover:bg-blue-100 hover:border-blue-300 transition-all group">
                <span className="text-xl flex-shrink-0">{d.emoji}</span>
                <div>
                  <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-700">{d.name}</p>
                  <p className="text-xs text-gray-500">{d.desc}</p>
                </div>
              </a>
            ))}
          </div>

          {!isLoggedIn && (
            <>
              <a href="/login" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold text-center block transition-colors shadow-sm">
                Sign Up Free — 10 Questions/Month
              </a>
              <p className="text-xs text-gray-400 text-center mt-2">No credit card required</p>
            </>
          )}
        </div>

        {/* Upgrade section — no price boxes */}
        {!isLoggedIn && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-100 rounded-2xl p-6 mb-6">
            <h3 className="font-bold text-gray-900 mb-1">Want unlimited access?</h3>
            <p className="text-sm text-gray-500 mb-4">Upgrade to PRO or ELITE for full access to all disciplines and unlimited questions.</p>
            <a href="/pricing" className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold text-center block transition-colors">
              View All Plans →
            </a>
          </div>
        )}
      </div>

      <footer className="border-t border-gray-100 bg-white px-6 py-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs text-gray-400">AquaRef · For reference only. Always verify with official World Aquatics Regulations and your Meet Referee.</p>
        </div>
      </footer>
    </div>
  )
}