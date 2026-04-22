'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const DISCIPLINES = [
  { id: 'swimming', name: 'Swimming', code: 'SW Rules', icon: '🏊', desc: 'Freestyle, backstroke, breaststroke, butterfly, IM and relay rules' },
  { id: 'waterpolo', name: 'Water Polo', code: 'WP Rules', icon: '🤽', desc: 'Field of play, players, referees, gameplay and penalty rules' },
  { id: 'artistic', name: 'Artistic Swimming', code: 'AS Rules', icon: '💃', desc: 'Solo, duet, team and combo routine rules and judging criteria' },
  { id: 'diving', name: 'Diving', code: 'DV Rules', icon: '🤿', desc: 'Springboard, platform, synchronised diving rules and scoring' },
  { id: 'highdiving', name: 'High Diving', code: 'HD Rules', icon: '🏔️', desc: 'Platform heights, entry requirements and competition rules' },
  { id: 'masters', name: 'Masters', code: 'MS Rules', icon: '🏅', desc: 'Age group categories, records and masters competition rules' },
  { id: 'openwater', name: 'Open Water', code: 'OW Rules', icon: '🌊', desc: 'Open water swimming rules, equipment, officials and competition regulations' },
]

export default function ChooseDisciplinePage() {
  const [user, setUser] = useState<{ email?: string } | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [currentDiscipline, setCurrentDiscipline] = useState<string | null>(null)
  const [plan, setPlan] = useState<string | null>(null)
  const [canSwitch, setCanSwitch] = useState(true)
  const [nextSwitchDate, setNextSwitchDate] = useState<string | null>(null)

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

      if (sub) {
        setPlan(sub.plan)
        setCurrentDiscipline(sub.selected_discipline)

        // Check 30-day cooldown
        if (sub.discipline_changed_at && sub.selected_discipline) {
          const lastChanged = new Date(sub.discipline_changed_at)
          const nextSwitch = new Date(lastChanged)
          nextSwitch.setDate(nextSwitch.getDate() + 30)
          if (new Date() < nextSwitch) {
            setCanSwitch(false)
            setNextSwitchDate(nextSwitch.toLocaleDateString('en-MY', { day: 'numeric', month: 'long', year: 'numeric' }))
          }
        }
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
            {currentDiscipline ? 'Switch your discipline' : 'Choose your discipline'}
          </h1>
          <p className="text-gray-500">
            Your <strong>{plan === 'lite' ? 'LITE' : plan === 'pro' ? 'PRO' : 'plan'}</strong> includes <strong>1 discipline</strong>. Pick the one you officiate most.
            You can switch once every 30 days.
          </p>
          {currentDiscipline && (
            <p className="text-sm text-blue-600 mt-2">
              Current discipline: <strong>{DISCIPLINES.find(d => d.id === currentDiscipline)?.name}</strong>
            </p>
          )}
        </div>

        {/* Cooldown warning */}
        {!canSwitch && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6 text-center">
            <p className="text-sm font-medium text-orange-800">⏳ Discipline switch not available yet</p>
            <p className="text-xs text-orange-600 mt-1">You can switch again on <strong>{nextSwitchDate}</strong></p>
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Back to Dashboard
            </button>
          </div>
        )}

        {/* Discipline grid */}
        {canSwitch && (
          <>
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              {DISCIPLINES.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setSelected(d.id)}
                  className={`text-left p-5 rounded-xl border-2 transition-all ${
                    selected === d.id
                      ? 'border-blue-600 bg-blue-50 shadow-sm'
                      : d.id === currentDiscipline
                      ? 'border-green-300 bg-green-50'
                      : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{d.icon}</span>
                    {selected === d.id && (
                      <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full">✓ Selected</span>
                    )}
                    {d.id === currentDiscipline && selected !== d.id && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Current</span>
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

            <div className="text-center">
              <button
                onClick={handleSave}
                disabled={!selected || saving || selected === currentDiscipline}
                className="bg-blue-600 text-white px-10 py-3 rounded-xl font-medium text-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : currentDiscipline ? 'Switch Discipline →' : 'Confirm My Discipline →'}
              </button>
              {selected === currentDiscipline && (
                <p className="text-xs text-orange-500 mt-2">This is already your current discipline</p>
              )}
              <div className="mt-3 flex items-center justify-center gap-4">
                <p className="text-xs text-gray-400">
                  You can switch once every 30 days
                </p>
                {currentDiscipline && (
                  <button
                    onClick={() => window.location.href = '/dashboard'}
                    className="text-xs text-blue-600 hover:text-blue-700"
                  >
                    ← Back to Dashboard
                  </button>
                )}
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  )
}