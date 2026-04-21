'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async () => {
    if (!email) {
      setError('Please enter your email address')
      return
    }
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`
      }
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSent(true)
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-3">Check your inbox! 📧</h1>
          <p className="text-gray-500 mb-2">We sent a magic login link to:</p>
          <p className="font-medium text-blue-600 mb-6">{email}</p>

          {/* Spam warning box */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 text-left">
            <p className="text-sm font-medium text-yellow-800 mb-2">⚠️ Can't find the email?</p>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Check your <strong>Spam</strong> or <strong>Junk</strong> folder</li>
              <li>• The email is sent from <strong>Supabase Auth</strong></li>
              <li>• The link expires in <strong>1 hour</strong></li>
            </ul>
          </div>

          <p className="text-xs text-gray-400 mb-4">
            Once we set up our custom email, you will receive emails from <strong>hello@aquaref.co</strong> instead.
          </p>

          <button
            onClick={() => setSent(false)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Use a different email
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="font-bold text-xl text-gray-900">AquaRef</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome back</h1>
          <p className="text-gray-500">Enter your email to receive a login link</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-8">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="you@example.com"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm mb-4">{error}</p>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send Login Link'}
          </button>

          <p className="text-center text-sm text-gray-400 mt-4">
            No password needed. We email you a secure login link.
          </p>
        </div>

        <p className="text-center text-sm text-gray-400 mt-6">
          Don't have an account?{' '}
          <a href="/pricing" className="text-blue-600 hover:underline">
            Start free — no credit card needed
          </a>
        </p>
      </div>
    </div>
  )
}