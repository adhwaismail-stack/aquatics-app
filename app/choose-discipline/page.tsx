'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const DISCIPLINES = [
  { id: 'swimming', name: 'Swimming', code: 'SW Rules', icon: '🏊', desc: 'Freestyle, backstroke, breaststroke, butterfly, IM and relay rules' },
  { id: 'waterpolo', name: 'Water Polo', code: 'WP Rules', icon: '🤽', desc: 'Field of play, players, referees, gameplay and penalty rules' },
  { id: 'artistic', name: 'Artistic Swimming', code: 'AS Rules', icon: '💃', desc: 'Solo, duet, team and combo routine rules and judging criteria', comingSoon: true },
  { id: 'diving', name: 'Diving', code: 'DV Rules', icon: '🤿', desc: 'Springboard, platform, synchronised diving rules and scoring', comingSoon: true },
  { id: 'highdiving', name: 'High Diving', code: 'HD Rules', icon: '🏔️', desc: 'Platform heights, entry requirements and competition rules', comingSoon: true },
  { id: 'masters', name: 'Masters Swimming', code: 'MS Rules', icon: '🏅', desc: 'Age group categories, records and masters competition rules', comingSoon: true },
]

interface Discipline {
  id: string
  name: string
  code: string
  icon: string
  desc: string
  comingSoon?: boolean
}

export default function ChooseDisciplinePage() {
  const [user, setUser] = useState<{ email?: string } | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = '/login'
        return
      }
      setUser(user)

      const { data: sub } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_email', user.email)
        .single()

      if (sub?.selected_discipline) {
        window.location.href = '/dashboard'
        return
      }

      setLoading(false)
    }
    getUser()
  }, [])

  const handleSave = async () => {
    if (!selected || !user?.email) return
    setSaving(true)

    await supabase
      .from('user_subscriptions')
      .upsert({
        user_email: user.email,
        selected_discipline: selected,
        discipline_changed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_email' })

    window.location.href = '/dashboard'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="font-bold text-xl text-gray-900">AquaRef</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Choose your discipline
          </h1>
          <p className="text-gray-500">
            Your Starter plan includes <strong>1 discipline</strong>. Pick the one you officiate most.
            You can switch once per month.
          </p>
        </div>

        {/* Discipline grid */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {DISCIPLINES.map((d: Discipline) => (
            <button
              key={d.id}
              onClick={() => !d.comingSoon && setSelected(d.id)}
              disabled={d.comingSoon}
              className={`text-left p-5 rounded-xl border-2 transition-all ${
                d.comingSoon
                  ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                  : selected === d.id
                  ? 'border-blue-600 bg-blue-50 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{d.icon}</span>
                {d.comingSoon && (
                  <span className="text-xs bg-gray-100 text-gray-400 px-2 py-1 rounded-full">
                    Coming Soon
                  </span>
                )}
                {selected === d.id && (
                  <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full">
                    ✓ Selected
                  </span>
                )}
              </div>
              <h3 className={`font-semibold mb-1 ${selected === d.id ? 'text-blue-700' : 'text-gray-900'}`}>
                {d.name}
              </h3>
              <p className="text-xs text-gray-400">{d.code}</p>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">{d.desc}</p>
            </button>
          ))}
        </div>

        {/* Confirm button */}
        <div className="text-center">
          <button
            onClick={handleSave}
            disabled={!selected || saving}
            className="bg-blue-600 text-white px-10 py-3 rounded-xl font-medium text-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Confirm My Discipline →'}
          </button>
          <p className="text-xs text-gray-400 mt-3">
            You can switch your discipline once per month from your dashboard
          </p>
        </div>

      </div>
    </div>
  )
}