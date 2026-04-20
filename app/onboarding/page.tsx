'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function OnboardingPage() {
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<{ email?: string } | null>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = '/login'
        return
      }
      setUser(user)
    }
    getUser()
  }, [])

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)

    await supabase
      .from('user_subscriptions')
      .update({ full_name: name.trim() })
      .eq('user_email', user?.email)

    window.location.href = '/dashboard'
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">A</span>
            </div>
            <span className="font-bold text-2xl text-gray-900">AquaRef</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to AquaRef! 👋</h1>
          <p className="text-gray-500">Let us know what to call you</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-8">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              placeholder="e.g. Ahmad, Sarah, Coach Lee"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
              autoFocus
            />
            <p className="text-xs text-gray-400 mt-2">This is how we'll greet you on your dashboard</p>
          </div>

          <button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Continue to Dashboard →'}
          </button>
        </div>
      </div>
    </div>
  )
}