'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const disciplines = [
  { id: 'swimming', name: 'Swimming', code: 'SW Rules', icon: '🏊', desc: 'Freestyle, backstroke, breaststroke, butterfly, IM and relay rules' },
  { id: 'waterpolo', name: 'Water Polo', code: 'WP Rules', icon: '🤽', desc: 'Field of play, players, referees, gameplay and penalty rules' },
  { id: 'artistic', name: 'Artistic Swimming', code: 'AS Rules', icon: '💃', desc: 'Solo, duet, team and combo routine rules and judging criteria' },
  { id: 'diving', name: 'Diving', code: 'DV Rules', icon: '🤿', desc: 'Springboard, platform, synchronised diving rules and scoring' },
  { id: 'highdiving', name: 'High Diving', code: 'HD Rules', icon: '🏔️', desc: 'Platform heights, entry requirements and competition rules' },
  { id: 'masters', name: 'Masters Swimming', code: 'MS Rules', icon: '🏅', desc: 'Age group categories, records and masters competition rules' },
]

export default function DashboardPage() {
  const [user, setUser] = useState<{ email?: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [liveDisciplines, setLiveDisciplines] = useState<string[]>([])

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = '/login'
        return
      }
      setUser(user)

      // Check which disciplines have uploaded documents
      const { data } = await supabase
        .from('rulebook_files')
        .select('discipline')
      
      if (data) {
        const live = [...new Set(data.map(f => f.discipline))]
        setLiveDisciplines(live)
      }

      setLoading(false)
    }
    getUser()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading your dashboard...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="font-bold text-xl text-gray-900">AquaRef</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 hidden md:block">{user?.email}</span>
            <a href="/pricing" className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Upgrade Plan
            </a>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-400 hover:text-gray-600"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back! 👋
          </h1>
          <p className="text-gray-500">
            Select a discipline to get instant AI-powered rules answers
          </p>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {liveDisciplines.length}
            </div>
            <div className="text-xs text-gray-400 mt-1">Disciplines available</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">50</div>
            <div className="text-xs text-gray-400 mt-1">Questions per day</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">90+</div>
            <div className="text-xs text-gray-400 mt-1">Languages supported</div>
          </div>
        </div>

        {/* Discipline grid */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Choose a discipline</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {disciplines.map((d) => {
              const isLive = liveDisciplines.includes(d.id)
              return (
                <div
                  key={d.id}
                  className={`bg-white rounded-xl border p-6 transition-all ${
                    isLive
                      ? 'border-blue-200 hover:border-blue-400 hover:shadow-sm cursor-pointer'
                      : 'border-gray-100 opacity-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl">{d.icon}</span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      isLive
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      {isLive ? '● Live' : 'Coming Soon'}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{d.name}</h3>
                  <p className="text-xs text-gray-400 mb-1">{d.code}</p>
                  <p className="text-xs text-gray-400 mb-4 leading-relaxed">{d.desc}</p>
                  {isLive ? (
                    <button
                      onClick={() => window.location.href = `/chat/${d.id}`}
                      className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      Ask Rules Question →
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full bg-gray-50 text-gray-300 py-2.5 rounded-lg text-sm font-medium cursor-not-allowed border border-gray-100"
                    >
                      Coming Soon
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Info box */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-3">
            How AquaRef works
          </h3>
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
    </div>
  )
}