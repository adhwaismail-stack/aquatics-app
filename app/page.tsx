'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const ALL_DISCIPLINES = [
  {
    name: 'Swimming',
    code: 'SW Rules',
    id: 'swimming',
    landingUrl: '/swimming',
    isPara: false,
    tagline: 'Pool race rules, DQ reasons, World Aquatics standards',
    anchorLabel: 'Swimming Rules and Regulations',
  },
  {
    name: 'Water Polo',
    code: 'WP Rules',
    id: 'waterpolo',
    landingUrl: '/water-polo',
    isPara: false,
    tagline: 'Match conduct, fouls, exclusions, penalty rules',
    anchorLabel: 'Water Polo Competition Rules',
  },
  {
    name: 'Open Water',
    code: 'OW Rules',
    id: 'openwater',
    landingUrl: '/open-water',
    isPara: false,
    tagline: 'Marathon swims, course rules, drafting, feeding',
    anchorLabel: 'Open Water Swimming Rules',
  },
  {
    name: 'Artistic Swimming',
    code: 'AS Rules',
    id: 'artistic',
    landingUrl: '/artistic-swimming',
    isPara: false,
    tagline: 'Routines, scoring, technical elements, judging',
    anchorLabel: 'Artistic Swimming Regulations',
  },
  {
    name: 'Diving',
    code: 'DV Rules',
    id: 'diving',
    landingUrl: '/diving',
    isPara: false,
    tagline: 'Dive degrees, execution, judging criteria',
    anchorLabel: 'Diving Rules and Scoring',
  },
  {
    name: 'High Diving',
    code: 'HD Rules',
    id: 'highdiving',
    landingUrl: '/high-diving',
    isPara: false,
    tagline: '20m+ platform rules, safety, execution',
    anchorLabel: 'High Diving Competition Rules',
  },
  {
    name: 'Masters',
    code: 'MS Rules',
    id: 'masters',
    landingUrl: '/masters-swimming',
    isPara: false,
    tagline: 'Age-group competition, records, eligibility',
    anchorLabel: 'Masters Swimming Regulations',
  },
  {
    name: 'Para Swimming *',
    code: 'WPS Rules',
    id: 'paraswimming',
    landingUrl: '/para-swimming',
    isPara: true,
    tagline: 'Classification, WPS rules, adapted competition',
    anchorLabel: 'Para Swimming Rules (WPS)',
  },
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

  // SEO: ItemList schema for Google
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: ALL_DISCIPLINES.map((d, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: d.anchorLabel,
   url: `https://aquaref.co${d.landingUrl}`,
    })),
  }

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Invisible SEO schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />

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
          Built for Officials, Coaches, Swimmers and Parents
        </div>
        <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-6">
          The digital backbone of<br />
          <span className="text-blue-600">aquatics.</span>
        </h1>
        <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
          Real-time event AI. Official rules assistant. Live updates.
          All in one place.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="/login" className="bg-green-500 text-white px-8 py-4 rounded-lg font-medium text-lg hover:bg-green-600">
            Get Started Free
          </a>
          <a href="#pricing" className="bg-blue-600 text-white px-8 py-4 rounded-lg font-medium text-lg hover:bg-blue-700">
            View Plans
          </a>
        </div>
        <p className="text-sm text-gray-400 mt-4">Free forever on LITE. No credit card needed. Cancel anytime on paid plans.</p>
      </section>

      {/* Disciplines — MOVED UP for SEO */}
      <section id="disciplines" className="px-8 py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">8 Aquatics Disciplines, One Rules Assistant</h2>
          <p className="text-center text-gray-500 mb-14 text-lg">
            Get instant, cited answers from official World Aquatics and IPC rulebooks. Choose your discipline to explore the rules.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {ALL_DISCIPLINES.map((d, i) => {
              const isLive = liveDisciplines.includes(d.id)

              const cardContent = (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className={`font-semibold ${
                      d.isPara
                        ? isLive ? 'text-purple-900' : 'text-gray-700'
                        : isLive ? 'text-blue-900' : 'text-gray-700'
                    }`}>{d.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      d.isPara
                        ? isLive ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-500'
                        : isLive ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                    }`}>
                      {isLive ? 'Live' : 'Coming Soon'}
                    </span>
                  </div>
                  <p className={`text-sm font-medium mb-1 ${
                    d.isPara
                      ? isLive ? 'text-purple-700' : 'text-gray-400'
                      : isLive ? 'text-blue-700' : 'text-gray-400'
                  }`}>{d.code}</p>
                  <p className="text-xs text-gray-500 leading-snug mb-2 min-h-[2rem]">
                    {d.tagline}
                  </p>
                  {d.isPara && (
                    <p className="text-xs text-purple-400 mb-2">World Para Swimming (IPC)</p>
                  )}
                  {isLive && (
                    <p className={`text-xs font-semibold ${d.isPara ? 'text-purple-600' : 'text-blue-600'}`}>
                      Explore rules →
                    </p>
                  )}
                </>
              )

              const cardClasses = `block p-6 rounded-xl border transition-all ${
                d.isPara
                  ? isLive ? 'border-purple-200 bg-purple-50 hover:border-purple-400 hover:shadow-md' : 'border-gray-100 bg-gray-50'
                  : isLive ? 'border-blue-200 bg-blue-50 hover:border-blue-400 hover:shadow-md' : 'border-gray-100 bg-gray-50'
              }`

              return isLive ? (
                <Link
                  key={i}
                    href={d.landingUrl}
                  aria-label={d.anchorLabel}
                  className={cardClasses}
                >
                  {cardContent}
                </Link>
              ) : (
                <div key={i} className={cardClasses}>
                  {cardContent}
                </div>
              )
            })}
          </div>

          <p className="text-xs text-gray-400 mt-6 text-center">
            * Para Swimming rules are governed by World Para Swimming (WPS) under the International Paralympic Committee (IPC), independent of World Aquatics.
          </p>
        </div>
      </section>

      {/* Two Main Features — Rules & Event Hub */}
      <section id="features" className="bg-gray-50 px-8 py-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Two powerful tools in one platform</h2>
          <p className="text-center text-gray-500 mb-14 text-lg">Everything you need, from training to the pool deck</p>

          <div className="grid md:grid-cols-2 gap-6">

            {/* Rules Assistant */}
            <div className="bg-white rounded-2xl border border-blue-100 p-8 shadow-sm">
              <div className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold uppercase tracking-wide px-3 py-1 rounded-full mb-4">
                Rules Assistant
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Every rule, instantly</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-5">
                AI-powered assistant trained strictly on official World Aquatics and World Para Swimming regulations.
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold mt-0.5">&#10003;</span>
                  <span>8 disciplines: Swimming, Water Polo, Diving, Open Water, Artistic, High Diving, Masters, Para Swimming</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold mt-0.5">&#10003;</span>
                  <span>Every answer cites the exact rule number (e.g. SW 7.6, WP 21.3)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold mt-0.5">&#10003;</span>
                  <span>Ask in any of 90+ languages, get answers in the same language</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold mt-0.5">&#10003;</span>
                  <span>Always up to date with latest regulation changes</span>
                </li>
              </ul>
            </div>

            {/* Event Hub */}
            <div className="bg-white rounded-2xl border border-green-100 p-8 shadow-sm relative">
              <div className="absolute -top-3 right-6">
                <span className="bg-green-600 text-white text-xs px-3 py-1 rounded-full font-semibold shadow-sm">NEW</span>
              </div>
              <div className="inline-block bg-green-100 text-green-700 text-xs font-semibold uppercase tracking-wide px-3 py-1 rounded-full mb-4">
                Event Hub
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">AI for your meet</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-5">
                Upload your event documents and turn them into a live AI assistant for everyone at the meet.
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-0.5">&#10003;</span>
                  <span>Ask about heats, lanes, start times, officials, schedules</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-0.5">&#10003;</span>
                  <span>Live notices for schedule changes, call room alerts, announcements</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-0.5">&#10003;</span>
                  <span>QR codes for pool-deck distribution to officials, coaches, parents</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-0.5">&#10003;</span>
                  <span>AI reads live updates first, so information is always current</span>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* Who It's For */}
      <section className="bg-white px-8 py-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Built for everyone on deck</h2>
          <p className="text-center text-gray-500 mb-14 text-lg">From the Technical Official to the parent in the stands</p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-bold text-sm mb-3">1</div>
              <h3 className="font-semibold text-gray-900 mb-2">Officials</h3>
              <p className="text-sm text-gray-500 leading-relaxed">Never miss a rule. Be ready for any dispute with instant citations.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-bold text-sm mb-3">2</div>
              <h3 className="font-semibold text-gray-900 mb-2">Coaches</h3>
              <p className="text-sm text-gray-500 leading-relaxed">Find your swimmers&apos; heats, lanes, and times in seconds.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-bold text-sm mb-3">3</div>
              <h3 className="font-semibold text-gray-900 mb-2">Swimmers &amp; Parents</h3>
              <p className="text-sm text-gray-500 leading-relaxed">Understand the schedule, DQ calls, and event updates instantly.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-bold text-sm mb-3">4</div>
              <h3 className="font-semibold text-gray-900 mb-2">Partners</h3>
              <p className="text-sm text-gray-500 leading-relaxed">Federations, state associations, clubs, schools and event organizers.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Multilingual Banner */}
      <section className="bg-blue-600 px-8 py-12">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-blue-200 text-sm font-medium mb-2">Available in 90+ Languages</p>
          <h2 className="text-2xl font-bold text-white mb-3">Ask in your language, get answers in your language</h2>
          <p className="text-blue-200 mb-6">Whether you speak Bahasa Malaysia, Arabic, Chinese, Japanese, French or any other language — AquaRef answers in the same language you ask.</p>
          <div className="flex flex-wrap justify-center gap-2 text-sm text-blue-200">
            {['Bahasa Malaysia', 'English', 'العربية', '中文', '日本語', 'Français', 'Español', 'Deutsch', '한국어'].map((lang, i) => (
              <span key={i} className="bg-blue-500 px-3 py-1 rounded-full">{lang}</span>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 px-8 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">How it works</h2>
          <p className="text-center text-gray-500 mb-14 text-lg">Get started in under 60 seconds</p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">1</div>
              <h3 className="font-semibold text-gray-900 mb-2">Sign up free</h3>
              <p className="text-sm text-gray-500 leading-relaxed">Create your account in 30 seconds. No credit card required.</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">2</div>
              <h3 className="font-semibold text-gray-900 mb-2">Pick your discipline or event</h3>
              <p className="text-sm text-gray-500 leading-relaxed">Choose a discipline for rules chat, or scan an event QR to access the Event Hub.</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">3</div>
              <h3 className="font-semibold text-gray-900 mb-2">Ask anything</h3>
              <p className="text-sm text-gray-500 leading-relaxed">Type your question in any language and get instant, verifiable answers.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-white px-8 py-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Simple, honest pricing</h2>
          <p className="text-center text-gray-500 mb-14 text-lg">Start free. Upgrade when you&apos;re ready.</p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">

            {/* LITE */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 flex flex-col">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-2">Casual</p>
              <h3 className="font-bold text-xl text-gray-900 mb-1">LITE</h3>
              <p className="text-gray-400 text-xs italic mb-4">Your safety net</p>
              <div className="mb-6">
                <span className="text-3xl font-bold text-gray-900">RM 0</span>
                <span className="text-gray-400 text-sm">/month</span>
              </div>
              <ul className="space-y-2 mb-6 flex-1 text-sm">
                <li className="flex items-start gap-2 text-gray-600">
                  <span className="text-green-500 mt-0.5">&#10003;</span>
                  <span><strong>Rules Chat:</strong> 10 Q/month, 1 discipline</span>
                </li>
                <li className="flex items-start gap-2 text-gray-600">
                  <span className="text-green-500 mt-0.5">&#10003;</span>
                  <span><strong>Event Chat:</strong> 10 Q per event</span>
                </li>
                <li className="flex items-start gap-2 text-gray-600">
                  <span className="text-green-500 mt-0.5">&#10003;</span>
                  <span>Events in your country only</span>
                </li>
                <li className="flex items-start gap-2 text-gray-600">
                  <span className="text-green-500 mt-0.5">&#10003;</span>
                  <span>90+ languages</span>
                </li>
              </ul>
              <a href="/login" className="block w-full text-center border border-green-500 text-green-600 py-3 rounded-lg font-medium hover:bg-green-50">
                Get Started Free
              </a>
            </div>

            {/* PRO */}
            <div className="bg-blue-400 p-6 rounded-xl flex flex-col relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-white text-blue-600 text-xs px-4 py-1 rounded-full font-semibold shadow-sm">Most Popular</span>
              </div>
              <p className="text-xs font-medium text-blue-100 uppercase tracking-widest mb-2">Specialist</p>
              <h3 className="font-bold text-xl text-white mb-1">PRO</h3>
              <p className="text-blue-100 text-xs italic mb-4">For active officials</p>
              <div className="mb-6">
                <span className="text-3xl font-bold text-white">RM 14.99</span>
                <span className="text-blue-100 text-sm">/month</span>
              </div>
              <ul className="space-y-2 mb-6 flex-1 text-sm">
                <li className="flex items-start gap-2 text-white">
                  <span className="text-blue-100 mt-0.5">&#10003;</span>
                  <span><strong>Rules Chat:</strong> 50 Q/day, 1 discipline</span>
                </li>
                <li className="flex items-start gap-2 text-white">
                  <span className="text-blue-100 mt-0.5">&#10003;</span>
                  <span><strong>Event Chat:</strong> 50 Q/day per event</span>
                </li>
                <li className="flex items-start gap-2 text-white">
                  <span className="text-blue-100 mt-0.5">&#10003;</span>
                  <span>Events in your country only</span>
                </li>
                <li className="flex items-start gap-2 text-white">
                  <span className="text-blue-100 mt-0.5">&#10003;</span>
                  <span>Switch discipline every 30 days</span>
                </li>
              </ul>
              <a href="/pricing" className="block w-full text-center bg-white text-blue-500 py-3 rounded-lg font-medium hover:bg-blue-50">
                Start 7-Day Trial
              </a>
            </div>

            {/* ELITE */}
            <div className="bg-slate-800 p-6 rounded-xl flex flex-col">
              <p className="text-xs font-medium text-yellow-400 uppercase tracking-widest mb-2">Authority</p>
              <h3 className="font-bold text-xl text-white mb-1">ELITE</h3>
              <p className="text-slate-400 text-xs italic mb-4">All disciplines, all events</p>
              <div className="mb-6">
                <span className="text-3xl font-bold text-white">RM 39.99</span>
                <span className="text-slate-400 text-sm">/month</span>
              </div>
              <ul className="space-y-2 mb-6 flex-1 text-sm">
                <li className="flex items-start gap-2 text-slate-300">
                  <span className="text-yellow-400 mt-0.5">&#10003;</span>
                  <span><strong>Rules Chat:</strong> Unlimited, all 8 disciplines</span>
                </li>
                <li className="flex items-start gap-2 text-slate-300">
                  <span className="text-yellow-400 mt-0.5">&#10003;</span>
                  <span><strong>Event Chat:</strong> Unlimited</span>
                </li>
                <li className="flex items-start gap-2 text-slate-300">
                  <span className="text-yellow-400 mt-0.5">&#10003;</span>
                  <span>Events from ALL countries</span>
                </li>
                <li className="flex items-start gap-2 text-slate-300">
                  <span className="text-yellow-400 mt-0.5">&#10003;</span>
                  <span>Priority VIP support</span>
                </li>
                <li className="flex items-start gap-2 text-slate-300">
                  <span className="text-yellow-400 mt-0.5">&#10003;</span>
                  <span>Early access to new features</span>
                </li>
              </ul>
              <a href="/pricing" className="block w-full text-center bg-yellow-400 text-slate-900 py-3 rounded-lg font-medium hover:bg-yellow-300">
                Start 7-Day Trial
              </a>
            </div>

            {/* PARTNER */}
            <div className="bg-gradient-to-br from-purple-600 to-indigo-700 p-6 rounded-xl flex flex-col relative text-white">
              <div className="absolute -top-3 right-4">
                <span className="bg-yellow-400 text-slate-900 text-xs px-3 py-1 rounded-full font-semibold shadow-sm">Custom</span>
              </div>
              <p className="text-xs font-medium text-purple-200 uppercase tracking-widest mb-2">Organization</p>
              <h3 className="font-bold text-xl text-white mb-1">PARTNER</h3>
              <p className="text-purple-200 text-xs italic mb-4">For federations, clubs, schools and event organizers</p>
              <div className="mb-6">
                <span className="text-2xl font-bold text-white">Custom</span>
                <span className="text-purple-200 text-sm"> pricing</span>
              </div>
              <ul className="space-y-2 mb-6 flex-1 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-300 mt-0.5">&#10003;</span>
                  <span>Everything in ELITE for all your members</span>
                </li>
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
                  <span>Custom branding on event pages</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-300 mt-0.5">&#10003;</span>
                  <span>Dedicated support</span>
                </li>
              </ul>
              <a href="mailto:hello@aquaref.co?subject=AquaRef%20Partner%20Plan%20Inquiry" className="block w-full text-center bg-white text-purple-700 py-3 rounded-lg font-medium hover:bg-purple-50">
                Contact Sales
              </a>
            </div>

          </div>

          <p className="text-center text-sm text-gray-400 mt-8">
            No charge for 7 days on paid plans. Cancel anytime. LITE is free forever.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-green-50 border-y border-green-100 px-8 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-green-700 text-sm font-medium mb-2">Free forever. No credit card needed.</p>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Start using AquaRef today</h2>
          <p className="text-gray-500 mb-6">Join officials, coaches, swimmers and parents getting instant answers.</p>
          <a href="/login" className="inline-block bg-green-500 text-white px-8 py-3 rounded-lg font-medium hover:bg-green-600">
            Get Started Free
          </a>
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