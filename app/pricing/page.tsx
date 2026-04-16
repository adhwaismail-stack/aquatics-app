'use client'

import { useState } from 'react'

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [showEmail, setShowEmail] = useState<string | null>(null)

  const handleCheckout = async (plan: string) => {
    if (!email) {
      setShowEmail(plan)
      return
    }

    setLoading(plan)

    const priceId = plan === 'starter'
      ? 'price_1TMpZKDEuI3kdko2OvQ4Ep5c'

      : 'price_1TMpcNDEuI3kdko2MSU0MDGB'


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
      <div className="max-w-4xl mx-auto">
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
            7-day free trial on all plans. Cancel anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Starter Plan */}
          <div className="bg-white p-8 rounded-xl border border-gray-200">
            <h3 className="font-bold text-xl text-gray-900 mb-2">Starter</h3>
            <p className="text-gray-500 text-sm mb-6">
              For officials who officiate one sport
            </p>
            <div className="mb-6">
              <span className="text-4xl font-bold text-gray-900">RM 11.99</span>
              <span className="text-gray-400 text-sm">/month</span>
            </div>
            <ul className="space-y-3 mb-8">
              {[
                'Choose 1 discipline',
                'Full AI rulebook chat',
                'Rule number citations',
                'Multilingual support',
                'Switch discipline once/month',
                '50 questions per day'
              ].map((f, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="text-blue-600">✓</span>{f}
                </li>
              ))}
            </ul>

            {showEmail === 'starter' && (
              <div className="mb-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            <button
              onClick={() => handleCheckout('starter')}
              disabled={loading === 'starter'}
              className="w-full border border-blue-600 text-blue-600 py-3 rounded-lg font-medium hover:bg-blue-50 disabled:opacity-50"
            >
              {loading === 'starter' ? 'Loading...' : 'Start 7-Day Free Trial'}
            </button>
          </div>

          {/* All Disciplines Plan */}
          <div className="bg-blue-600 p-8 rounded-xl">
            <div className="inline-block bg-blue-500 text-white text-xs px-3 py-1 rounded-full mb-4">
              Most Popular
            </div>
            <h3 className="font-bold text-xl text-white mb-2">All Disciplines</h3>
            <p className="text-blue-200 text-sm mb-6">
              For multi-sport officials and coaches
            </p>
            <div className="mb-6">
              <span className="text-4xl font-bold text-white">RM 27.99</span>
              <span className="text-blue-200 text-sm">/month</span>
            </div>
            <ul className="space-y-3 mb-8">
              {[
                'All 6 disciplines included',
                'Full AI rulebook chat',
                'Rule number citations',
                'Multilingual support',
                'New disciplines added free',
                'Rulebook update alerts',
                '50 questions per day'
              ].map((f, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-white">
                  <span className="text-blue-200">✓</span>{f}
                </li>
              ))}
            </ul>

            {showEmail === 'all' && (
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
              onClick={() => handleCheckout('all')}
              disabled={loading === 'all'}
              className="w-full bg-white text-blue-600 py-3 rounded-lg font-medium hover:bg-blue-50 disabled:opacity-50"
            >
              {loading === 'all' ? 'Loading...' : 'Start 7-Day Free Trial'}
            </button>
          </div>
        </div>

        <p className="text-center text-sm text-gray-400 mt-8">
          No charge for 7 days. Cancel anytime before trial ends.
        </p>
      </div>
    </div>
  )
}