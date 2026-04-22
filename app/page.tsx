'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const ALL_DISCIPLINES = [
  { name: 'Swimming', code: 'SW Rules', id: 'swimming' },
  { name: 'Water Polo', code: 'WP Rules', id: 'waterpolo' },
  { name: 'Open Water', code: 'OW Rules', id: 'openwater' },
  { name: 'Artistic Swimming', code: 'AS Rules', id: 'artistic' },
  { name: 'Diving', code: 'DV Rules', id: 'diving' },
  { name: 'High Diving', code: 'HD Rules', id: 'highdiving' },
  { name: 'Masters', code: 'MS Rules', id: 'masters' },
]

export default function Home() {
  const [liveDisciplines, setLiveDisciplines] = useState<string[]>([])

  useEffect(() => {
    const fetchLive = async () => {
      const { data } = await supabase.from('rulebook_files').select('discipline')
      if (data) {
        const live = [...new Set(data.map((f: { discipline: string }) => f.discipline))]
        setLiveDisciplines(live)
      }
    }
    fetchLive()
  }, [])

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <span className="font-bold text-xl text-gray-900">AquaRef</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-gray-600">
          <a href="#features" className="hover:text-blue-600">Features</a>
          <a href="#disciplines" className="hover:text-blue-600">Disciplines</a>
          <a href="#pricing" className="hover:text-blue-600">Pricing</a>
        </div>
        <div className="flex items-center gap-3">
          <a href="/login" className="text-sm text-gray-600 hover:text-blue-600 font-medium">Login</a>
          <a href="/login" className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">Get Started Free</a>
        </div>
      </nav>

      {/* Hero */}
      <section className="text-center px-8 py-24 max-w-4xl mx-auto">
        <div className="inline-block bg-blue-50 text-blue-700 text-sm font-medium px-4 py-1 rounded-full mb-6">
          World Aquatics Official Rules Assistant
        </div>
        <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-6">
          World Aquatics Rules at<br />
          <span className="text-blue-600">Your Fingertips</span>
        </h1>
        <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
          AI-powered rules assistant for Technical Officials, coaches and parents.
          Instant answers from official World Aquatics Regulations only.
          No guessing. No internet. Just the rules.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="/login" className="bg-green-500 text-white px-8 py-4 rounded-lg font-medium text-lg hover:bg-green-600">
            🆓 Get Started Free
          </a>
          <a href="/pricing" className="bg-blue-600 text-white px-8 py-4 rounded-lg font-medium text-lg hover:bg-blue-700">
            See Pricing
          </a>
          <a href="#features" className="border border-gray-200 text-gray-700 px-8 py-4 rounded-lg font-medium text-lg hover:bg-gray-50">
            Learn More
          </a>
        </div>
        <p className="text-sm text-gray-400 mt-4">Free forever on LITE · No credit card needed · Cancel anytime on paid plans.</p>
      </section>

      {/* Multilingual Banner */}
      <section className="bg-blue-600 px-8 py-12">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-blue-200 text-sm font-medium mb-2">🌍 Available in 90+ Languages</p>
          <h2 className="text-2xl font-bold text-white mb-3">Ask in your language, get answers in your language</h2>
          <p className="text-blue-200 mb-6">Whether you speak Bahasa Malaysia, Arabic, Chinese, Japanese, French or any other language — AquaRef answers in the same language you ask.</p>
          <div className="flex flex-wrap justify-center gap-2 text-sm text-blue-200">
            {['Bahasa Malaysia', 'English', 'العربية', '中文', '日本語', 'Français', 'Español', 'Deutsch', '한국어'].map((lang, i) => (
              <span key={i} className="bg-blue-500 px-3 py-1 rounded-full">{lang}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-gray-50 px-8 py-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Built for the pool deck</h2>
          <p className="text-center text-gray-500 mb-14 text-lg">Everything a Technical Official, coach or parent needs</p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: "📖", title: "Regulations Only", desc: "Answers strictly from official World Aquatics Regulations. No internet, no guessing, no hallucinations." },
              { icon: "🌍", title: "90+ Languages", desc: "Ask in any of 90+ languages and get answers in that same language. No language barrier for officials worldwide." },
              { icon: "🔢", title: "Rule Citations", desc: "Every answer includes the exact rule number — SW 7.6, WP 21.3. Always verifiable." },
              { icon: "⚡", title: "Instant Answers", desc: "Get answers in seconds. Perfect for quick checks during competition preparation." },
              { icon: "🏊", title: "7 Disciplines", desc: "Swimming, Water Polo, Open Water, Artistic Swimming, Diving, High Diving and Masters Swimming." },
              { icon: "🔒", title: "Always Current", desc: "Regulations updated by admin whenever World Aquatics releases new rules. Always accurate." }
            ].map((f, i) => (
              <div key={i} className="bg-white p-6 rounded-xl border border-gray-100">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Disciplines */}
      <section id="disciplines" className="px-8 py-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">All World Aquatics disciplines</h2>
          <p className="text-center text-gray-500 mb-14 text-lg">One platform for every aquatics sport</p>
          <div className="grid md:grid-cols-3 gap-6">
            {ALL_DISCIPLINES.map((d, i) => {
              const isLive = liveDisciplines.includes(d.id)
              return (
                <div key={i} className={`p-6 rounded-xl border ${isLive ? 'border-blue-200 bg-blue-50' : 'border-gray-100 bg-gray-50'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className={`font-semibold ${isLive ? 'text-blue-900' : 'text-gray-700'}`}>{d.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${isLive ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                      {isLive ? 'Live' : 'Coming Soon'}
                    </span>
                  </div>
                  <p className={`text-sm ${isLive ? 'text-blue-700' : 'text-gray-400'}`}>{d.code}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* LITE CTA Banner — replaces Demo banner */}
      <section className="bg-green-50 border-y border-green-100 px-8 py-12">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-green-700 text-sm font-medium mb-2">🆓 Free forever — no credit card needed</p>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Start with AquaRef LITE today</h2>
          <p className="text-gray-500 mb-2">Get 5 free questions per month on your chosen discipline.</p>
          <p className="text-gray-400 text-sm mb-6">Sign up in 30 seconds · No credit card · Upgrade anytime</p>
          <a href="/login" className="inline-block bg-green-500 text-white px-8 py-3 rounded-lg font-medium hover:bg-green-600">
            Get Started Free →
          </a>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-gray-50 px-8 py-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Simple, honest pricing</h2>
          <p className="text-center text-gray-500 mb-14 text-lg">Start free. Upgrade when you're ready.</p>

          <div className="grid md:grid-cols-3 gap-6">

            {/* LITE */}
            <div className="bg-white p-8 rounded-xl border border-gray-200 flex flex-col">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-2">For The Casual Observer</p>
              <h3 className="font-bold text-xl text-gray-900 mb-1">AquaRef LITE</h3>
              <p className="text-gray-400 text-xs italic mb-4">Your "Just-In-Case" Safety Net</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">RM 0</span>
                <span className="text-gray-400 text-sm">/month</span>
              </div>
              <ul className="space-y-2 mb-8 flex-1">
                {['5 Questions per month', '1 Discipline (30-day lock)', 'Official WA Rule Citations', '90+ Language Support', 'Web & Mobile Access'].map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-gray-600">
                    <span className="text-green-500">✓</span>{f}
                  </li>
                ))}
              </ul>
              <a href="/login" className="block w-full text-center border border-green-500 text-green-600 py-3 rounded-lg font-medium hover:bg-green-50">
                Get Started Free
              </a>
            </div>

            {/* PRO */}
            <div className="bg-blue-600 p-8 rounded-xl flex flex-col relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-orange-400 text-white text-xs px-4 py-1 rounded-full font-medium">Most Popular</span>
              </div>
              <p className="text-xs font-medium text-blue-200 uppercase tracking-widest mb-2">The Dedicated Specialist</p>
              <h3 className="font-bold text-xl text-white mb-1">AquaRef PRO</h3>
              <p className="text-blue-200 text-xs italic mb-4">For professional officials and coaches</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">RM 14.99</span>
                <span className="text-blue-200 text-sm">/month</span>
              </div>
              <ul className="space-y-2 mb-8 flex-1">
                {['50 Questions per day', '1 Discipline (switch every 30 days)', 'Official WA Rule Citations', '90+ Language Support', 'Ad-Free Experience', 'Standard Email Support'].map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-white">
                    <span className="text-blue-200">✓</span>{f}
                  </li>
                ))}
              </ul>
              <a href="/pricing" className="block w-full text-center bg-white text-blue-600 py-3 rounded-lg font-medium hover:bg-blue-50">
                Start 7-Day Free Trial
              </a>
            </div>

            {/* ELITE */}
            <div className="bg-gray-900 p-8 rounded-xl flex flex-col">
              <p className="text-xs font-medium text-yellow-400 uppercase tracking-widest mb-2">The Global Authority</p>
              <h3 className="font-bold text-xl text-white mb-1">AquaRef ELITE</h3>
              <p className="text-gray-400 text-xs italic mb-4">For high-level Referees and multi-sport Officials</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">RM 39.99</span>
                <span className="text-gray-400 text-sm">/month</span>
              </div>
              <ul className="space-y-2 mb-8 flex-1">
                {['UNLIMITED Questions', 'ALL 7 Disciplines', 'Instant Discipline Switching', 'Official WA Rule Citations', '90+ Language Support', 'Priority VIP Support', 'Early Access to new features'].map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-gray-300">
                    <span className="text-yellow-400">✓</span>{f}
                  </li>
                ))}
              </ul>
              <a href="/pricing" className="block w-full text-center bg-yellow-400 text-gray-900 py-3 rounded-lg font-medium hover:bg-yellow-300">
                Start 7-Day Free Trial
              </a>
            </div>

          </div>

          <p className="text-center text-sm text-gray-400 mt-8">
            No charge for 7 days on paid plans. Cancel anytime. LITE is free forever.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-8 py-12 border-t border-gray-100">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">A</span>
            </div>
            <span className="font-bold text-gray-900">AquaRef</span>
          </div>
          <p className="text-sm text-gray-400">
            For reference only. Always verify with official World Aquatics Regulations and your Meet Referee.
          </p>
          <div className="flex gap-6 text-sm text-gray-400">
            <a href="/privacy-policy" className="hover:text-gray-600">Privacy Policy</a>
            <a href="/terms-of-service" className="hover:text-gray-600">Terms</a>
            <a href="/contact" className="hover:text-gray-600">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}