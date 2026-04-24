'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [showEmail, setShowEmail] = useState<string | null>(null)
  const [userLoggedIn, setUserLoggedIn] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email) {
        setEmail(user.email)
        setUserLoggedIn(true)
      }
    }
    getUser()
  }, [])

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
      ? 'price_1TOdBiDEuI3kdko2HWgCLV4s'
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
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <a href="/" className="inline-flex items-center justify-center gap-2 mb-6 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="font-bold text-xl text-gray-900">AquaRef</span>
          </a>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Simple, honest pricing</h1>
          <p className="text-xl text-gray-500">Start free. Upgrade when you&apos;re ready.</p>
          {userLoggedIn && (
            <div className="mt-4 inline-block bg-blue-50 border border-blue-100 rounded-lg px-4 py-2">
              <p className="text-sm text-blue-700">Logged in as <strong>{email}</strong></p>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">

          {/* LITE Plan */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 flex flex-col">
            <div className="mb-6">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-2">Casual</p>
              <h3 className="font-bold text-2xl text-gray-900 mb-1">LITE</h3>
              <p className="text-gray-400 text-sm italic mb-4">Your safety net</p>
              <div className="mb-2">
                <span className="text-3xl font-bold text-gray-900">RM 0</span>
                <span className="text-gray-400 text-sm">/month</span>
              </div>
              <p className="text-xs text-gray-400">Free forever. No credit card.</p>
            </div>

            <ul className="space-y-3 mb-8 flex-1 text-sm">
              <li>
                <p className="font-semibold text-gray-700 mb-1">Rules Chat</p>
                <ul className="space-y-1 ml-2">
                  <li className="flex items-start gap-2 text-gray-600">
                    <span className="text-green-500 mt-0.5">&#10003;</span>
                    <span>5 questions per month</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-600">
                    <span className="text-green-500 mt-0.5">&#10003;</span>
                    <span>1 chosen discipline (30-day lock)</span>
                  </li>
                </ul>
              </li>
              <li>
                <p className="font-semibold text-gray-700 mb-1">Event Chat</p>
                <ul className="space-y-1 ml-2">
                  <li className="flex items-start gap-2 text-gray-600">
                    <span className="text-green-500 mt-0.5">&#10003;</span>
                    <span>5 questions per event</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-600">
                    <span className="text-green-500 mt-0.5">&#10003;</span>
                    <span>Events in your country only</span>
                  </li>
                </ul>
              </li>
              <li>
                <p className="font-semibold text-gray-700 mb-1">Other</p>
                <ul className="space-y-1 ml-2">
                  <li className="flex items-start gap-2 text-gray-600">
                    <span className="text-green-500 mt-0.5">&#10003;</span>
                    <span>90+ language support</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-600">
                    <span className="text-green-500 mt-0.5">&#10003;</span>
                    <span>Web &amp; mobile access</span>
                  </li>
                </ul>
              </li>
            </ul>

            {showEmail === 'lite' && !userLoggedIn && (
              <div className="mb-4">
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-400 text-gray-900" />
              </div>
            )}

            {userLoggedIn ? (
              <button onClick={() => router.push('/dashboard')} className="w-full border border-green-500 text-green-600 py-3 rounded-lg font-medium hover:bg-green-50 transition-colors">Go to Dashboard</button>
            ) : (
              <button onClick={() => handleCheckout('lite')} className="w-full border border-green-500 text-green-600 py-3 rounded-lg font-medium hover:bg-green-50 transition-colors">Get Started Free</button>
            )}
          </div>

          {/* PRO Plan */}
          <div className="bg-blue-400 p-6 rounded-xl flex flex-col relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-white text-blue-600 text-xs px-4 py-1 rounded-full font-semibold shadow-sm">Most Popular</span>
            </div>
            <div className="mb-6">
              <p className="text-xs font-medium text-blue-100 uppercase tracking-widest mb-2">Specialist</p>
              <h3 className="font-bold text-2xl text-white mb-1">PRO</h3>
              <p className="text-blue-100 text-sm italic mb-4">For active officials &amp; coaches</p>
              <div className="mb-2">
                <span className="text-3xl font-bold text-white">RM 14.99</span>
                <span className="text-blue-100 text-sm">/month</span>
              </div>
              <p className="text-xs text-blue-100">7-day free trial. Cancel anytime.</p>
            </div>

            <ul className="space-y-3 mb-8 flex-1 text-sm">
              <li>
                <p className="font-semibold text-white mb-1">Rules Chat</p>
                <ul className="space-y-1 ml-2">
                  <li className="flex items-start gap-2 text-white">
                    <span className="text-blue-100 mt-0.5">&#10003;</span>
                    <span>50 questions per day</span>
                  </li>
                  <li className="flex items-start gap-2 text-white">
                    <span className="text-blue-100 mt-0.5">&#10003;</span>
                    <span>1 discipline (switch every 30 days)</span>
                  </li>
                </ul>
              </li>
              <li>
                <p className="font-semibold text-white mb-1">Event Chat</p>
                <ul className="space-y-1 ml-2">
                  <li className="flex items-start gap-2 text-white">
                    <span className="text-blue-100 mt-0.5">&#10003;</span>
                    <span>50 questions per day per event</span>
                  </li>
                  <li className="flex items-start gap-2 text-white">
                    <span className="text-blue-100 mt-0.5">&#10003;</span>
                    <span>Events in your country only</span>
                  </li>
                </ul>
              </li>
              <li>
                <p className="font-semibold text-white mb-1">Other</p>
                <ul className="space-y-1 ml-2">
                  <li className="flex items-start gap-2 text-white">
                    <span className="text-blue-100 mt-0.5">&#10003;</span>
                    <span>90+ language support</span>
                  </li>
                  <li className="flex items-start gap-2 text-white">
                    <span className="text-blue-100 mt-0.5">&#10003;</span>
                    <span>Standard email support</span>
                  </li>
                </ul>
              </li>
            </ul>

            {showEmail === 'pro' && !userLoggedIn && (
              <div className="mb-4">
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" className="w-full px-4 py-3 border border-blue-300 rounded-lg text-sm mb-2 bg-blue-300 text-white placeholder-blue-100 focus:outline-none focus:ring-2 focus:ring-white" />
              </div>
            )}

            {userLoggedIn && (
              <div className="mb-4 bg-blue-300 rounded-lg px-3 py-2">
                <p className="text-xs text-blue-100">Upgrading as: <strong className="text-white">{email}</strong></p>
              </div>
            )}

            <button onClick={() => handleCheckout('pro')} disabled={loading === 'pro'} className="w-full bg-white text-blue-500 py-3 rounded-lg font-medium hover:bg-blue-50 disabled:opacity-50 transition-colors">{loading === 'pro' ? 'Loading...' : 'Start 7-Day Free Trial'}</button>
          </div>

          {/* ELITE Plan */}
          <div className="bg-slate-800 p-6 rounded-xl flex flex-col">
            <div className="mb-6">
              <p className="text-xs font-medium text-yellow-400 uppercase tracking-widest mb-2">Authority</p>
              <h3 className="font-bold text-2xl text-white mb-1">ELITE</h3>
              <p className="text-slate-400 text-sm italic mb-4">All disciplines, all events</p>
              <div className="mb-2">
                <span className="text-3xl font-bold text-white">RM 39.99</span>
                <span className="text-slate-400 text-sm">/month</span>
              </div>
              <p className="text-xs text-slate-400">7-day free trial. Cancel anytime.</p>
            </div>

            <ul className="space-y-3 mb-8 flex-1 text-sm">
              <li>
                <p className="font-semibold text-white mb-1">Rules Chat</p>
                <ul className="space-y-1 ml-2">
                  <li className="flex items-start gap-2 text-slate-300">
                    <span className="text-yellow-400 mt-0.5">&#10003;</span>
                    <span>Unlimited questions</span>
                  </li>
                  <li className="flex items-start gap-2 text-slate-300">
                    <span className="text-yellow-400 mt-0.5">&#10003;</span>
                    <span>All 8 disciplines</span>
                  </li>
                  <li className="flex items-start gap-2 text-slate-300">
                    <span className="text-yellow-400 mt-0.5">&#10003;</span>
                    <span>Instant discipline switching</span>
                  </li>
                </ul>
              </li>
              <li>
                <p className="font-semibold text-white mb-1">Event Chat</p>
                <ul className="space-y-1 ml-2">
                  <li className="flex items-start gap-2 text-slate-300">
                    <span className="text-yellow-400 mt-0.5">&#10003;</span>
                    <span>Unlimited questions per event</span>
                  </li>
                  <li className="flex items-start gap-2 text-slate-300">
                    <span className="text-yellow-400 mt-0.5">&#10003;</span>
                    <span>Events from ALL countries</span>
                  </li>
                </ul>
              </li>
              <li>
                <p className="font-semibold text-white mb-1">Other</p>
                <ul className="space-y-1 ml-2">
                  <li className="flex items-start gap-2 text-slate-300">
                    <span className="text-yellow-400 mt-0.5">&#10003;</span>
                    <span>Priority VIP support</span>
                  </li>
                  <li className="flex items-start gap-2 text-slate-300">
                    <span className="text-yellow-400 mt-0.5">&#10003;</span>
                    <span>Early access to new features</span>
                  </li>
                </ul>
              </li>
            </ul>

            {showEmail === 'elite' && !userLoggedIn && (
              <div className="mb-4">
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" className="w-full px-4 py-3 border border-slate-600 rounded-lg text-sm mb-2 bg-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-400" />
              </div>
            )}

            {userLoggedIn && (
              <div className="mb-4 bg-slate-700 rounded-lg px-3 py-2">
                <p className="text-xs text-slate-400">Upgrading as: <strong className="text-white">{email}</strong></p>
              </div>
            )}

            <button onClick={() => handleCheckout('elite')} disabled={loading === 'elite'} className="w-full bg-yellow-400 text-slate-900 py-3 rounded-lg font-medium hover:bg-yellow-300 disabled:opacity-50 transition-colors">{loading === 'elite' ? 'Loading...' : 'Start 7-Day Free Trial'}</button>
          </div>

          {/* PARTNER Plan */}
          <div className="bg-gradient-to-br from-purple-600 to-indigo-700 p-6 rounded-xl flex flex-col relative text-white">
            <div className="absolute -top-3 right-4">
              <span className="bg-yellow-400 text-slate-900 text-xs px-3 py-1 rounded-full font-semibold shadow-sm">Custom</span>
            </div>
            <div className="mb-6">
              <p className="text-xs font-medium text-purple-200 uppercase tracking-widest mb-2">Organization</p>
              <h3 className="font-bold text-2xl text-white mb-1">PARTNER</h3>
              <p className="text-purple-200 text-sm italic mb-4">For federations, clubs, schools &amp; event organizers</p>
              <div className="mb-2">
                <span className="text-2xl font-bold text-white">Custom</span>
                <span className="text-purple-200 text-sm"> pricing</span>
              </div>
              <p className="text-xs text-purple-200">Tailored to your organization.</p>
            </div>

            <ul className="space-y-3 mb-8 flex-1 text-sm">
              <li>
                <p className="font-semibold text-white mb-1">Everything in ELITE</p>
                <ul className="space-y-1 ml-2">
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-300 mt-0.5">&#10003;</span>
                    <span>For all members of your organization</span>
                  </li>
                </ul>
              </li>
              <li>
                <p className="font-semibold text-white mb-1">Event Management</p>
                <ul className="space-y-1 ml-2">
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-300 mt-0.5">&#10003;</span>
                    <span>Manage your own events</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-300 mt-0.5">&#10003;</span>
                    <span>Push live notices during meets</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-300 mt-0.5">&#10003;</span>
                    <span>QR codes for pool-deck distribution</span>
                  </li>
                </ul>
              </li>
              <li>
                <p className="font-semibold text-white mb-1">Branding &amp; Support</p>
                <ul className="space-y-1 ml-2">
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-300 mt-0.5">&#10003;</span>
                    <span>Custom branding on event pages</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-300 mt-0.5">&#10003;</span>
                    <span>Dedicated support</span>
                  </li>
                </ul>
              </li>
            </ul>

            <a href="mailto:hello@aquaref.co?subject=AquaRef%20Partner%20Plan%20Inquiry" className="block w-full text-center bg-white text-purple-700 py-3 rounded-lg font-medium hover:bg-purple-50">Contact Sales</a>
          </div>

        </div>

        <p className="text-center text-sm text-gray-400 mt-8">No charge for 7 days on paid plans. Cancel anytime before trial ends. LITE plan is free forever.</p>

        {/* Who is PARTNER for? */}
        <div className="mt-12 bg-white rounded-2xl border border-gray-200 p-8 max-w-4xl mx-auto">
          <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Is the PARTNER plan right for you?</h3>
          <p className="text-sm text-gray-500 text-center mb-6">We work with organizations of all sizes — from local clubs to national federations.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-4">
              <p className="font-semibold text-gray-700 text-sm mb-1">Federations</p>
              <p className="text-xs text-gray-500">National &amp; regional governing bodies</p>
            </div>
            <div className="p-4">
              <p className="font-semibold text-gray-700 text-sm mb-1">State Associations</p>
              <p className="text-xs text-gray-500">State-level swimming bodies</p>
            </div>
            <div className="p-4">
              <p className="font-semibold text-gray-700 text-sm mb-1">Clubs &amp; Schools</p>
              <p className="text-xs text-gray-500">Swim clubs &amp; school programs</p>
            </div>
            <div className="p-4">
              <p className="font-semibold text-gray-700 text-sm mb-1">Event Organizers</p>
              <p className="text-xs text-gray-500">Independent meet hosts</p>
            </div>
          </div>
          <div className="mt-6 text-center">
            <a href="mailto:hello@aquaref.co?subject=AquaRef%20Partner%20Plan%20Inquiry" className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-purple-700">Get in touch</a>
          </div>
        </div>

      </div>
    </div>
  )
}