export default function Contact() {
  return (
    <main style={{ maxWidth: '680px', margin: '0 auto', padding: '3rem 1.5rem', fontFamily: 'sans-serif', color: '#1a1a2e' }}>
      <div style={{ marginBottom: '2.5rem', borderBottom: '2px solid #0077b6', paddingBottom: '1.5rem' }}>
        <p style={{ fontSize: '13px', color: '#555', marginBottom: '0.5rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>AquaRef · Support</p>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', margin: '0 0 0.5rem', color: '#03045e' }}>Contact Us</h1>
        <p style={{ fontSize: '15px', color: '#555', margin: 0 }}>We're here to help. Send us a message and we'll get back to you within 1–2 business days.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '2.5rem' }}>
        <div style={{ background: '#f0f7ff', border: '1px solid #bdd7f0', borderRadius: '10px', padding: '1.25rem' }}>
          <p style={{ fontSize: '12px', color: '#0077b6', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>Email</p>
          <a href="mailto:hello@aquaref.co" style={{ color: '#03045e', fontWeight: '600', fontSize: '15px', textDecoration: 'none' }}>hello@aquaref.co</a>
          <p style={{ fontSize: '13px', color: '#777', margin: '6px 0 0' }}>General enquiries & support</p>
        </div>
        <div style={{ background: '#f0f7ff', border: '1px solid #bdd7f0', borderRadius: '10px', padding: '1.25rem' }}>
          <p style={{ fontSize: '12px', color: '#0077b6', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>Response Time</p>
          <p style={{ color: '#03045e', fontWeight: '600', fontSize: '15px', margin: 0 }}>1–2 Business Days</p>
          <p style={{ fontSize: '13px', color: '#777', margin: '6px 0 0' }}>Monday – Friday</p>
        </div>
      </div>

      <div style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#03045e', marginBottom: '1rem' }}>Frequently Asked Questions</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <FaqItem
            q="How do I cancel my subscription?"
            a="You can cancel anytime from your account dashboard. You'll retain access until the end of your billing period."
          />
          <FaqItem
            q="Can I switch my discipline on the Starter plan?"
            a="Yes! You can switch your chosen discipline once per month from your dashboard."
          />
          <FaqItem
            q="Is AquaRef affiliated with World Aquatics?"
            a="No. AquaRef is an independent service and is not affiliated with or endorsed by World Aquatics."
          />
          <FaqItem
            q="How accurate are the AI responses?"
            a="Responses are based on uploaded World Aquatics rulebooks. Always verify with the official rulebook and your Meet Referee for authoritative decisions."
          />
          <FaqItem
            q="I forgot my password — how do I log in?"
            a="AquaRef uses magic link login — no password needed. Just enter your email and we'll send you a secure login link."
          />
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #dde8f5', borderRadius: '12px', padding: '2rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#03045e', marginBottom: '1.5rem' }}>Send a Message</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#444', display: 'block', marginBottom: '6px' }}>Name</label>
              <input type="text" placeholder="Your name" style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', borderRadius: '8px', fontSize: '14px', color: '#333', boxSizing: 'border-box', outline: 'none' }} />
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#444', display: 'block', marginBottom: '6px' }}>Email</label>
              <input type="email" placeholder="your@email.com" style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', borderRadius: '8px', fontSize: '14px', color: '#333', boxSizing: 'border-box', outline: 'none' }} />
            </div>
          </div>
          <div>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#444', display: 'block', marginBottom: '6px' }}>Subject</label>
            <select style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', borderRadius: '8px', fontSize: '14px', color: '#333', boxSizing: 'border-box', background: '#fff' }}>
              <option value="">Select a topic</option>
              <option value="billing">Billing & Subscription</option>
              <option value="technical">Technical Issue</option>
              <option value="content">AI Response / Content</option>
              <option value="account">Account Issue</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#444', display: 'block', marginBottom: '6px' }}>Message</label>
            <textarea placeholder="Describe your issue or question..." rows={5} style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', borderRadius: '8px', fontSize: '14px', color: '#333', boxSizing: 'border-box', resize: 'vertical', outline: 'none', fontFamily: 'sans-serif' }} />
          </div>
          <a href="mailto:hello@aquaref.co" style={{ display: 'inline-block', background: '#0077b6', color: '#fff', padding: '12px 28px', borderRadius: '8px', fontWeight: '600', fontSize: '15px', textDecoration: 'none', textAlign: 'center' }}>
            Send Message
          </a>
          <p style={{ fontSize: '12px', color: '#999', margin: 0 }}>
            Clicking "Send Message" will open your email client. Alternatively, email us directly at <a href="mailto:hello@aquaref.co" style={{ color: '#0077b6' }}>hello@aquaref.co</a>.
          </p>
        </div>
      </div>

      <footer style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid #ddd', fontSize: '13px', color: '#999', textAlign: 'center' }}>
        &copy; {new Date().getFullYear()} AquaRef · <a href="/privacy-policy" style={{ color: '#0077b6', textDecoration: 'none' }}>Privacy Policy</a> · <a href="/terms-of-service" style={{ color: '#0077b6', textDecoration: 'none' }}>Terms of Service</a>
      </footer>
    </main>
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