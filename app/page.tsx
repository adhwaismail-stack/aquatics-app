export default function Home() {
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
        <button className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          Start Free Trial
        </button>
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
          Instant answers from official World Aquatics rulebooks only.
          No guessing. No internet. Just the rules.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-blue-600 text-white px-8 py-4 rounded-lg font-medium text-lg hover:bg-blue-700">
            Start 7-Day Free Trial
          </button>
          <button className="border border-gray-200 text-gray-700 px-8 py-4 rounded-lg font-medium text-lg hover:bg-gray-50">
            See Pricing
          </button>
        </div>
        <p className="text-sm text-gray-400 mt-4">No charge for 7 days. Cancel anytime.</p>
      </section>

      {/* Features */}
      <section id="features" className="bg-gray-50 px-8 py-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            Built for the pool deck
          </h2>
          <p className="text-center text-gray-500 mb-14 text-lg">
            Everything a Technical Official, coach or parent needs
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "📖",
                title: "Rulebook Only",
                desc: "Answers strictly from official World Aquatics rulebooks. No internet, no guessing, no hallucinations."
              },
              {
                icon: "🌍",
                title: "Full Multilingual",
                desc: "Ask in any of 90+ languages in the world and get answers in that same language. No language barrier for officials worldwide."
              },
              {
                icon: "🔢",
                title: "Rule Citations",
                desc: "Every answer includes the exact rule number — SW 7.6, WP 21.3. Always verifiable."
              },
              {
                icon: "⚡",
                title: "Instant Answers",
                desc: "Get answers in seconds. Perfect for quick checks during competition preparation."
              },
              {
                icon: "🏊",
                title: "6 Disciplines",
                desc: "Swimming, Water Polo, Artistic Swimming, Diving, High Diving and Masters Swimming."
              },
              {
                icon: "🔒",
                title: "Always Current",
                desc: "Rulebook updated by admin whenever World Aquatics releases new rules. Always accurate."
              }
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
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            All World Aquatics disciplines
          </h2>
          <p className="text-center text-gray-500 mb-14 text-lg">
            One platform for every aquatics sport
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Swimming", code: "SW Rules", live: true },
              { name: "Water Polo", code: "WP Rules", live: true },
              { name: "Artistic Swimming", code: "AS Rules", live: false },
              { name: "Diving", code: "DV Rules", live: false },
              { name: "High Diving", code: "HD Rules", live: false },
              { name: "Masters Swimming", code: "MS Rules", live: false }
            ].map((d, i) => (
              <div key={i} className={`p-6 rounded-xl border ${d.live ? "border-blue-200 bg-blue-50" : "border-gray-100 bg-gray-50"}`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className={`font-semibold ${d.live ? "text-blue-900" : "text-gray-700"}`}>
                    {d.name}
                  </h3>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${d.live ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"}`}>
                    {d.live ? "Live" : "Coming Soon"}
                  </span>
                </div>
                <p className={`text-sm ${d.live ? "text-blue-700" : "text-gray-400"}`}>{d.code}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-gray-50 px-8 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            Simple, honest pricing
          </h2>
          <p className="text-center text-gray-500 mb-14 text-lg">
            7-day free trial on all plans. Cancel anytime.
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-xl border border-gray-200">
              <h3 className="font-bold text-xl text-gray-900 mb-2">Starter</h3>
              <p className="text-gray-500 text-sm mb-6">For officials who officiate one sport</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">RM 11.99</span>
                <span className="text-gray-400 text-sm">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  "Choose 1 discipline",
                  "Full AI rulebook chat",
                  "Rule number citations",
                  "Multilingual support",
                  "Switch discipline once/month"
                ].map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-gray-600">
                    <span className="text-blue-600">✓</span>{f}
                  </li>
                ))}
              </ul>
              <button className="w-full border border-blue-600 text-blue-600 py-3 rounded-lg font-medium hover:bg-blue-50">
                Start Free Trial
              </button>
            </div>

            <div className="bg-blue-600 p-8 rounded-xl border border-blue-600">
              <div className="inline-block bg-blue-500 text-white text-xs px-3 py-1 rounded-full mb-4">
                Most Popular
              </div>
              <h3 className="font-bold text-xl text-white mb-2">All Disciplines</h3>
              <p className="text-blue-200 text-sm mb-6">For multi-sport officials and coaches</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">RM 27.99</span>
                <span className="text-blue-200 text-sm">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  "All 6 disciplines included",
                  "Full AI rulebook chat",
                  "Rule number citations",
                  "Multilingual support",
                  "New disciplines added free",
                  "Rulebook update alerts"
                ].map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-white">
                    <span className="text-blue-200">✓</span>{f}
                  </li>
                ))}
              </ul>
              <button className="w-full bg-white text-blue-600 py-3 rounded-lg font-medium hover:bg-blue-50">
                Start Free Trial
              </button>
            </div>
          </div>
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
            For reference only. Always verify with official World Aquatics rulebooks and your Meet Referee.
          </p>
          <div className="flex gap-6 text-sm text-gray-400">
            <a href="#" className="hover:text-gray-600">Privacy Policy</a>
            <a href="#" className="hover:text-gray-600">Terms</a>
            <a href="#" className="hover:text-gray-600">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}