'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSignup = async () => {
    if (!email.trim()) return
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { emailRedirectTo: `${window.location.origin}/dashboard` }
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSent(true)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 hover:opacity-80">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="font-bold text-xl text-gray-900">AquaRef</span>
          </a>
          <a href="/login" className="text-sm text-blue-600 hover:text-blue-700 font-medium">Log in →</a>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full">
          {sent ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm text-center">
              <div className="text-4xl mb-4">📬</div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Check your email</h2>
              <p className="text-gray-500 text-sm mb-2">We sent a magic link to</p>
              <p className="font-semibold text-gray-900 mb-4">{email}</p>
              <p className="text-xs text-gray-400">Click the link in your email to activate your account. No password needed.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Create your account</h1>
                <p className="text-gray-500 text-sm">Free forever · No credit card required</p>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="font-bold text-blue-600 text-lg">10</p>
                    <p className="text-xs text-gray-500">Q/month free</p>
                  </div>
                  <div>
                    <p className="font-bold text-blue-600 text-lg">8</p>
                    <p className="text-xs text-gray-500">Disciplines</p>
                  </div>
                  <div>
                    <p className="font-bold text-blue-600 text-lg">90+</p>
                    <p className="text-xs text-gray-500">Languages</p>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSignup()}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400 text-sm"
                />
              </div>

              {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

              <button
                onClick={handleSignup}
                disabled={loading || !email.trim()}
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors mb-4"
              >
                {loading ? 'Sending...' : 'Sign Up Free'}
              </button>

              <p className="text-xs text-gray-400 text-center mb-6">
                We will send a magic link to your email — no password needed.
              </p>

              <div className="border-t border-gray-100 pt-4 text-center">
                <p className="text-sm text-gray-500">
                  Already have an account?{' '}
                  <a href="/login" className="text-blue-600 hover:text-blue-700 font-medium">Log in</a>
                </p>
              </div>
            </div>
          )}

          <p className="text-xs text-gray-400 text-center mt-6">
            By signing up, you agree to our{' '}
            <a href="/terms-of-service" className="underline">Terms</a> and{' '}
            <a href="/privacy-policy" className="underline">Privacy Policy</a>.
          </p>
        </div>
      </div>

      <footer className="border-t border-gray-100 bg-white px-6 py-4">
        <div className="max-w-md mx-auto text-center">
          <p className="text-xs text-gray-400">AquaRef · AI-powered aquatics rules assistant</p>
        </div>
      </footer>
    </div>
  )
}