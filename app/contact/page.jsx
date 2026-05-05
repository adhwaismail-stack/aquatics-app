'use client'

import { useState } from 'react'

export default function Contact() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [topic, setTopic] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)

  const handleSubmit = async () => {
    if (!email.trim() || !email.includes('@')) {
      setResult({ success: false, message: 'Please enter a valid email address.' })
      return
    }
    if (!message.trim() || message.trim().length < 10) {
      setResult({ success: false, message: 'Please write a message of at least 10 characters.' })
      return
    }

    setSubmitting(true)
    setResult(null)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, topic, message }),
      })
      const data = await res.json()
      if (data.success) {
        setResult({ success: true, message: 'Thank you. Your message has been sent. We will reply within 1-2 business days.' })
        setName('')
        setEmail('')
        setTopic('')
        setMessage('')
      } else {
        setResult({ success: false, message: data.error || 'Failed to send. Please try again.' })
      }
    } catch (err) {
      setResult({ success: false, message: 'Network error. Please try again.' })
    }
    setSubmitting(false)
  }

  return (
    <div style={{ background: '#ffffff', minHeight: '100vh', colorScheme: 'light' }}>
      <main style={{ maxWidth: '680px', margin: '0 auto', padding: '3rem 1.5rem', fontFamily: 'sans-serif', color: '#1a1a2e' }}>
        <div style={{ marginBottom: '2.5rem', borderBottom: '2px solid #0077b6', paddingBottom: '1.5rem' }}>
          <p style={{ fontSize: '13px', color: '#555', marginBottom: '0.5rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>AquaRef · Support</p>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', margin: '0 0 0.5rem', color: '#03045e' }}>Contact Us</h1>
          <p style={{ fontSize: '15px', color: '#555', margin: 0 }}>We are here to help. Send us a message and we will get back to you within 1-2 business days.</p>
        </div>

        {/* Contact cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '2.5rem' }}>
          <div style={{ background: '#f0f7ff', border: '1px solid #bdd7f0', borderRadius: '10px', padding: '1.25rem' }}>
            <p style={{ fontSize: '12px', color: '#0077b6', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>General Support</p>
            <p style={{ color: '#03045e', fontWeight: '600', fontSize: '15px', margin: 0 }}>Use the form below</p>
            <p style={{ fontSize: '13px', color: '#777', margin: '6px 0 0' }}>Billing, technical issues, account help</p>
          </div>
          <div style={{ background: '#f5f0ff', border: '1px solid #d5c5f0', borderRadius: '10px', padding: '1.25rem' }}>
            <p style={{ fontSize: '12px', color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>Partner Enquiries</p>
            <p style={{ color: '#03045e', fontWeight: '600', fontSize: '15px', margin: 0 }}>Select &quot;Partnership&quot; below</p>
            <p style={{ fontSize: '13px', color: '#777', margin: '6px 0 0' }}>Federations, clubs, schools, event organizers</p>
          </div>
          <div style={{ background: '#f0f7ff', border: '1px solid #bdd7f0', borderRadius: '10px', padding: '1.25rem' }}>
            <p style={{ fontSize: '12px', color: '#0077b6', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>Response Time</p>
            <p style={{ color: '#03045e', fontWeight: '600', fontSize: '15px', margin: 0 }}>1-2 Business Days</p>
            <p style={{ fontSize: '13px', color: '#777', margin: '6px 0 0' }}>Monday to Friday</p>
          </div>
          <div style={{ background: '#f0fff4', border: '1px solid #bbf0cd', borderRadius: '10px', padding: '1.25rem' }}>
            <p style={{ fontSize: '12px', color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>Quick Answers</p>
            <p style={{ color: '#03045e', fontWeight: '600', fontSize: '15px', margin: 0 }}>Ask AquaRef Assistant</p>
            <p style={{ fontSize: '13px', color: '#777', margin: '6px 0 0' }}>Click the chat bubble on this page</p>
          </div>
        </div>

        {/* FAQ */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#03045e', marginBottom: '1rem' }}>Frequently Asked Questions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <FaqItem
              q="What is AquaRef?"
              a="AquaRef is a digital aquatics platform with two features: a Rules Assistant (AI-powered answers from official World Aquatics regulations) and an Event Hub (AI trained on your specific meet's documents — ask about heats, schedules, and more)."
            />
            <FaqItem
              q="I scanned a QR code at a swimming meet. What do I do?"
              a="You have been directed to an Event Hub for that meet. Sign up for a free account (no credit card needed) to get 5 free questions about the event — heats, lanes, schedules, and more."
            />
            <FaqItem
              q="Can my federation, club, or school use AquaRef?"
              a="Yes! We have a PARTNER plan for organizations of all sizes — from local clubs to national federations. It includes event management tools, live notices, and custom branding. Use the form below and select &quot;Partnership&quot; as the topic for a custom quote."
            />
            <FaqItem
              q="Which plan is right for me?"
              a="LITE (free) is great for casual users and parents at a single event. PRO (RM14.99/month) suits active officials and coaches. ELITE (RM39.99/month) is for high-level officials needing all disciplines and global event access. Ask the AquaRef Assistant (chat bubble below) for a personalized recommendation."
            />
            <FaqItem
              q="Does AquaRef support Para Swimming?"
              a="Yes! Para Swimming is our 8th discipline, powered by World Para Swimming (WPS) regulations under IPC. It is available on all plans."
            />
            <FaqItem
              q="How do I cancel my subscription?"
              a="You can cancel anytime from your account dashboard via the My Plan menu. You will retain access until the end of your billing period."
            />
            <FaqItem
              q="Can I switch my discipline on the PRO plan?"
              a="Yes! You can switch your chosen discipline once every 30 days from your dashboard."
            />
            <FaqItem
              q="Is AquaRef affiliated with World Aquatics?"
              a="No. AquaRef is an independent service and is not affiliated with or endorsed by World Aquatics or World Para Swimming."
            />
            <FaqItem
              q="How accurate are the AI responses?"
              a="Responses are based on official uploaded World Aquatics rulebooks. Always verify with the official rulebook and your Meet Referee or Event Director for authoritative decisions."
            />
            <FaqItem
              q="I forgot my password. How do I log in?"
              a="AquaRef uses magic link login — no password needed. Just enter your email and we will send you a secure login link."
            />
          </div>
        </div>

        {/* Contact form */}
        <div style={{ background: '#fff', border: '1px solid #dde8f5', borderRadius: '12px', padding: '2rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#03045e', marginBottom: '1.5rem' }}>Send a Message</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#444', display: 'block', marginBottom: '6px' }}>Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  disabled={submitting}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', borderRadius: '8px', fontSize: '14px', color: '#333', boxSizing: 'border-box', outline: 'none', background: '#fff' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#444', display: 'block', marginBottom: '6px' }}>Email *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  disabled={submitting}
                  required
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', borderRadius: '8px', fontSize: '14px', color: '#333', boxSizing: 'border-box', outline: 'none', background: '#fff' }}
                />
              </div>
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#444', display: 'block', marginBottom: '6px' }}>Topic</label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={submitting}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', borderRadius: '8px', fontSize: '14px', color: '#333', boxSizing: 'border-box', background: '#fff' }}
              >
                <option value="">Select a topic</option>
                <option value="billing">Billing and Subscription</option>
                <option value="technical">Technical Issue</option>
                <option value="eventhub">Event Hub</option>
                <option value="content">AI Response / Content</option>
                <option value="account">Account Issue</option>
                <option value="partner">Partnership / PARTNER Plan</option>
                <option value="appeal">Appeal a Submission Decision</option>
                <option value="media">Media / Press</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#444', display: 'block', marginBottom: '6px' }}>Message *</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your issue or question (minimum 10 characters)..."
                rows={5}
                disabled={submitting}
                required
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', borderRadius: '8px', fontSize: '14px', color: '#333', boxSizing: 'border-box', resize: 'vertical', outline: 'none', fontFamily: 'sans-serif', background: '#fff' }}
              />
              <p style={{ fontSize: '12px', color: '#999', margin: '6px 0 0' }}>{message.length} / 5000 characters</p>
            </div>

            {result && (
              <div style={{
                background: result.success ? '#f0fff4' : '#fff5f5',
                border: result.success ? '1px solid #bbf0cd' : '1px solid #fbbcbc',
                borderRadius: '8px',
                padding: '12px 16px',
                fontSize: '14px',
                color: result.success ? '#16a34a' : '#dc2626',
              }}>
                {result.message}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={submitting}
              style={{
                background: submitting ? '#90c2dc' : '#0077b6',
                color: '#fff',
                padding: '12px 28px',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '15px',
                border: 'none',
                cursor: submitting ? 'not-allowed' : 'pointer',
                textAlign: 'center',
              }}
            >
              {submitting ? 'Sending...' : 'Send Message'}
            </button>
            <p style={{ fontSize: '12px', color: '#999', margin: 0 }}>
              We respect your privacy. Your message goes directly to the AquaRef team — see our <a href="/privacy-policy" style={{ color: '#0077b6' }}>Privacy Policy</a>.
            </p>
          </div>
        </div>

        <footer style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid #ddd', fontSize: '13px', color: '#999', textAlign: 'center' }}>
          &copy; {new Date().getFullYear()} AquaRef · <a href="/privacy-policy" style={{ color: '#0077b6', textDecoration: 'none' }}>Privacy Policy</a> · <a href="/terms-of-service" style={{ color: '#0077b6', textDecoration: 'none' }}>Terms of Service</a>
        </footer>
      </main>
    </div>
  )
}

function FaqItem({ q, a }) {
  return (
    <div style={{ background: '#fafafa', border: '1px solid #eee', borderRadius: '8px', padding: '1rem 1.25rem' }}>
      <p style={{ fontWeight: '600', fontSize: '14px', color: '#03045e', margin: '0 0 6px' }}>{q}</p>
      <p style={{ fontSize: '14px', color: '#555', margin: 0, lineHeight: '1.6' }}>{a}</p>
    </div>
  )
}