'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [showEmail, setShowEmail] = useState<string | null>(null)
  const router = useRouter()

  const handleCheckout = async (plan: string) => {
    if (plan === 'lite') {
      if (!email) {
        setShowEmail('lite')
        return
      }
      router.push(`/login?email=${encodeURIComponent(email)}&plan=lite`)
      return
    }

    if (!email) {
      setShowEmail(plan)
      return
    }

    setLoading(plan)

    const priceId = plan === 'pro'
      ? process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || 'price_1TOdBiDEuI3kdko2HWgCLV4s'
      : process.env.NEXT_PUBLIC_STRIPE_ELITE_PRICE_ID || 'price_1TMpcNDEuI3kdko2MSU0MDGB'

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, email })
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        alert('Something went wrong. Please try again.')
        setLoading(null)
      }
    } catch {
      alert('Something went wrong. Please try again.')
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="font-bold text-xl text-gray-900">AquaRef</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Simple, honest pricing
          </h1>
          <p className="text-xl text-gray-500">
            Start free. Upgrade when you're ready.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">

          {/* LITE Plan */}
          <div className="bg-white p-8 rounded-xl border border-gray-200 flex flex-col">
            <div className="mb-6">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-2">For The Casual Observer</p>
              <h3 className="font-bold text-2xl text-gray-900 mb-1">AquaRef LITE</h3>
              <p className="text-gray-400 text-sm italic mb-4">Your "Just-In-Case" Safety Net</p>
              <div className="mb-2">
                <span className="text-4xl font-bold text-gray-900">RM 0</span>
                <span className="text-gray-400 text-sm">/month</span>
              </div>
              <p className="text-xs text-gray-400">Free forever. No credit card needed.</p>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {[
                '5 Questions per month',
                '1 Chosen Discipline (30-day lock)',
                'Official WA 2025-29 Rule Citations',
                '90+ Language Support',
                'Instant AI Rule Search',
                'Web & Mobile Access',
                'Verification Disclaimer included',
              ].map((f, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="text-green-500">✓</span>{f}
                </li>
              ))}
            </ul>

            {showEmail === 'lite' && (
              <div className="mb-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-400 text-gray-900"
                />
              </div>
            )}

            <button
              onClick={() => handleCheckout('lite')}
              className="w-full border border-green-500 text-green-600 py-3 rounded-lg font-medium hover:bg-green-50 transition-colors"
            >
              Get Started Free
            </button>
          </div>

          {/* PRO Plan */}
          <div className="bg-blue-600 p-8 rounded-xl flex flex-col relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-orange-400 text-white text-xs px-4 py-1 rounded-full font-medium">Most Popular</span>
            </div>
            <div className="mb-6">
              <p className="text-xs font-medium text-blue-200 uppercase tracking-widest mb-2">The Dedicated Specialist</p>
              <h3 className="font-bold text-2xl text-white mb-1">AquaRef PRO</h3>
              <p className="text-blue-200 text-sm italic mb-4">The standard for professional officials and coaches</p>
              <div className="mb-2">
                <span className="text-4xl font-bold text-white">RM 14.99</span>
                <span className="text-blue-200 text-sm">/month</span>
              </div>
              <p className="text-xs text-blue-200">7-day free trial. Cancel anytime.</p>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {[
                '50 Questions per day',
                '1 Chosen Discipline (30-day lock)',
                'Switch discipline once every 30 days',
                'Official WA 2025-29 Rule Citations',
                '90+ Language Support',
                'Ad-Free Experience',
                'Standard Email Support',
              ].map((f, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-white">
                  <span className="text-blue-200">✓</span>{f}
                </li>
              ))}
            </ul>

            {showEmail === 'pro' && (
              <div className="mb-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 border border-blue-400 rounded-lg text-sm mb-2 bg-blue-500 text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-white"
                />
              </div>
            )}

            <button
              onClick={() => handleCheckout('pro')}
              disabled={loading === 'pro'}
              className="w-full bg-white text-blue-600 py-3 rounded-lg font-medium hover:bg-blue-50 disabled:opacity-50 transition-colors"
            >
              {loading === 'pro' ? 'Loading...' : 'Start 7-Day Free Trial'}
            </button>
          </div>

          {/* ELITE Plan */}
          <div className="bg-gray-900 p-8 rounded-xl flex flex-col">
            <div className="mb-6">
              <p className="text-xs font-medium text-yellow-400 uppercase tracking-widest mb-2">The Global Authority</p>
              <h3 className="font-bold text-2xl text-white mb-1">AquaRef ELITE</h3>
              <p className="text-gray-400 text-sm italic mb-4">Total access for high-level Referees and multi-sport Officials</p>
              <div className="mb-2">
                <span className="text-4xl font-bold text-white">RM 39.99</span>
                <span className="text-gray-400 text-sm">/month</span>
              </div>
              <p className="text-xs text-gray-400">7-day free trial. Cancel anytime.</p>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {[
                'UNLIMITED Questions (Fair Use)',
                'ALL 7 Disciplines included',
                'Instant Discipline Switching',
                'Official WA 2025-29 Rule Citations',
                '90+ Language Support',
                'Priority VIP Support',
                'Early Access to new features',
              ].map((f, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-gray-300">
                  <span className="text-yellow-400">✓</span>{f}
                </li>
              ))}
            </ul>

            {showEmail === 'elite' && (
              <div className="mb-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 border border-gray-600 rounded-lg text-sm mb-2 bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
            )}

            <button
              onClick={() => handleCheckout('elite')}
              disabled={loading === 'elite'}
              className="w-full bg-yellow-400 text-gray-900 py-3 rounded-lg font-medium hover:bg-yellow-300 disabled:opacity-50 transition-colors"
            >
              {loading === 'elite' ? 'Loading...' : 'Start 7-Day Free Trial'}
            </button>
          </div>

        </div>

        <p className="text-center text-sm text-gray-400 mt-8">
          No charge for 7 days on paid plans. Cancel anytime before trial ends. LITE plan is free forever.
        </p>
      </div>
    </div>
  )
}