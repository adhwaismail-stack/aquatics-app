export default function PrivacyPolicy() {
  return (
    <div style={{ background: '#ffffff', minHeight: '100vh', colorScheme: 'light' }}>
      <main style={{ maxWidth: '760px', margin: '0 auto', padding: '3rem 1.5rem', fontFamily: 'Georgia, serif', color: '#1a1a2e', lineHeight: '1.8' }}>
        <div style={{ marginBottom: '2.5rem', borderBottom: '2px solid #0077b6', paddingBottom: '1.5rem' }}>
          <p style={{ fontSize: '13px', color: '#555', marginBottom: '0.5rem', fontFamily: 'sans-serif', letterSpacing: '0.08em', textTransform: 'uppercase' }}>AquaRef · Legal</p>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', margin: '0 0 0.5rem', color: '#03045e' }}>Privacy Policy</h1>
          <p style={{ fontSize: '14px', color: '#777', fontFamily: 'sans-serif' }}>Effective Date: 19 April 2025 &nbsp;·&nbsp; Last Updated: 24 April 2025</p>
        </div>

        <Section title="1. Introduction">
          <p>Welcome to AquaRef, a digital aquatics platform combining an AI-powered Rules Assistant and an Event Hub, operated by <strong>AquaRef</strong>. We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our website at <strong>aquaref.co</strong> and our subscription services.</p>
          <p>By using AquaRef, you agree to the collection and use of information in accordance with this policy.</p>
        </Section>

        <Section title="2. Information We Collect">
          <p>We collect the following types of information:</p>
          <ul>
            <li><strong>Email Address</strong> — collected when you sign up or log in via magic link authentication.</li>
            <li><strong>Full Name</strong> — collected during onboarding to personalise your experience.</li>
            <li><strong>Country</strong> — automatically detected via your IP address at account creation using a third-party geolocation service (ip-api.com). Used to show you relevant events in your country.</li>
            <li><strong>Payment Information</strong> — processed securely by Stripe. We do not store your credit card details on our servers.</li>
            <li><strong>Subscription & Usage Data</strong> — your selected plan, discipline access, daily question usage, event question usage, and subscription status.</li>
            <li><strong>Rules Chat Logs</strong> — questions you submit to the Rules Assistant and the AI responses provided. Stored to improve service quality and for admin review.</li>
            <li><strong>Event Chat Logs</strong> — questions you submit to Event Hub and the AI responses provided. Stored per event for service quality and admin review.</li>
            <li><strong>Event Documents</strong> — documents uploaded by organization administrators (start lists, schedules, heat sheets, technical packages). These remain the property of the uploading organization and are processed solely to power the Event Hub AI.</li>
            <li><strong>Live Notice Data</strong> — notices pushed by event administrators including category, message content, and timestamp.</li>
            <li><strong>Feedback Data</strong> — like/dislike ratings you provide on AI responses.</li>
            <li><strong>QR & Referral Tracking</strong> — tracking parameters (such as ref=qr or ref=user_share) appended to event URLs to help us understand how users discover events.</li>
            <li><strong>Local Preferences</strong> — certain preferences (such as country filter selection and feature flags) are stored in your browser's localStorage. This data remains on your device and is not transmitted to our servers.</li>
            <li><strong>IP Address</strong> — collected for country detection, demo usage tracking, and security purposes.</li>
            <li><strong>Device Information</strong> — basic browser and device data for session management.</li>
          </ul>
        </Section>

        <Section title="3. How We Use Your Information">
          <p>We use the information we collect to:</p>
          <ul>
            <li>Provide, operate, and maintain the AquaRef Rules Assistant and Event Hub</li>
            <li>Detect your country to show relevant local events</li>
            <li>Send magic link login emails and transactional notifications</li>
            <li>Process payments and manage your subscription</li>
            <li>Enforce question limits and access controls for Rules Chat and Event Hub</li>
            <li>Monitor and improve AI response quality</li>
            <li>Enable event administrators to push Live Notices to event participants</li>
            <li>Track how users discover events via QR codes and shared links</li>
            <li>Respond to your enquiries and support requests</li>
            <li>Comply with legal obligations under Malaysian law</li>
          </ul>
        </Section>

        <Section title="4. Data Storage & Security">
          <p>Your data is stored securely using <strong>Supabase</strong>, which employs industry-standard encryption and Row Level Security (RLS) to ensure that each user can only access their own data. Payments are processed by <strong>Stripe</strong>, a PCI-DSS compliant payment processor.</p>
          <p>We implement reasonable technical and organisational measures to protect your personal information against unauthorised access, alteration, disclosure, or destruction.</p>
        </Section>

        <Section title="5. Third-Party Services">
          <p>AquaRef uses the following third-party services, each with their own privacy policies:</p>
          <ul>
            <li><strong>Supabase</strong> — database, authentication, and file storage</li>
            <li><strong>Stripe</strong> — payment processing</li>
            <li><strong>Anthropic</strong> — AI language model (Claude Haiku) for generating Rules Assistant and Event Hub responses</li>
            <li><strong>OpenAI</strong> — text embeddings for document search and retrieval</li>
            <li><strong>Resend</strong> — transactional email delivery (magic links, notifications)</li>
            <li><strong>Vercel</strong> — web hosting and deployment</li>
            <li><strong>Cloudflare</strong> — DNS management and security</li>
            <li><strong>ip-api.com</strong> — IP-based country detection at account creation</li>
          </ul>
          <p>We do not sell your personal data to any third party. Your questions and event documents are transmitted to Anthropic and OpenAI solely for the purpose of generating AI responses and are subject to their respective data processing policies.</p>
        </Section>

        <Section title="6. Event Documents & Organization Data">
          <p>Documents uploaded to Event Hub by organization administrators (federations, clubs, schools, or event organizers) remain the intellectual property of the uploading organization. AquaRef processes these documents solely to power the Event Hub AI assistant for the specific event they were uploaded for.</p>
          <p>AquaRef does not use uploaded event documents to train AI models, share them with third parties, or use them for any purpose beyond powering the Event Hub. Documents may be retained for the duration of the event and deleted upon request by the organization administrator.</p>
        </Section>

        <Section title="7. Data Retention">
          <p>We retain your personal data for as long as your account is active or as needed to provide you with our services. Specifically:</p>
          <ul>
            <li><strong>Account data</strong> — retained while your account is active</li>
            <li><strong>Chat logs</strong> — retained for service improvement and admin review</li>
            <li><strong>Event documents</strong> — retained for the duration of the event; may be deleted upon request</li>
            <li><strong>Payment records</strong> — retained as required by Malaysian financial regulations</li>
          </ul>
          <p>You may request deletion of your account and associated data at any time by contacting us at hello@aquaref.co.</p>
        </Section>

        <Section title="8. Your Rights (PDPA Malaysia)">
          <p>Under the Personal Data Protection Act 2010 (PDPA) of Malaysia, you have the right to:</p>
          <ul>
            <li>Access the personal data we hold about you</li>
            <li>Correct inaccurate or incomplete personal data</li>
            <li>Withdraw consent to processing of your personal data</li>
            <li>Request deletion of your personal data</li>
            <li>Lodge a complaint with the relevant authority</li>
          </ul>
          <p>To exercise any of these rights, please contact us at <strong>hello@aquaref.co</strong>.</p>
        </Section>

        <Section title="9. Cookies & Local Storage">
          <p>AquaRef uses session cookies to maintain your login state. We also use your browser's localStorage to store certain preferences locally on your device, including:</p>
          <ul>
            <li>Country filter preference for event discovery (ELITE users)</li>
            <li>Post-login redirect URL (to return you to the event you were viewing before login)</li>
            <li>Feature flags such as whether you have seen the welcome message</li>
          </ul>
          <p>We do not use advertising or tracking cookies. localStorage data is stored on your device only and is not transmitted to our servers. You may clear localStorage data through your browser settings.</p>
        </Section>

        <Section title="10. International Data Transfers">
          <p>AquaRef uses third-party services including Anthropic (United States) and OpenAI (United States) to process AI requests. By using AquaRef, you acknowledge that your questions and relevant context may be transmitted to servers outside Malaysia for the purpose of generating AI responses. We ensure such transfers are subject to appropriate data processing agreements.</p>
        </Section>

        <Section title="11. Children's Privacy">
          <p>AquaRef is not directed to individuals under the age of 13. We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us and we will promptly delete it.</p>
        </Section>

        <Section title="12. Changes to This Policy">
          <p>We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new policy on this page with an updated effective date. Your continued use of AquaRef after such changes constitutes your acceptance of the updated policy.</p>
        </Section>

        <Section title="13. Contact Us">
          <p>If you have any questions, concerns, or requests regarding this Privacy Policy, please contact us:</p>
          <div style={{ background: '#f0f7ff', border: '1px solid #bdd7f0', borderRadius: '8px', padding: '1rem 1.25rem', marginTop: '0.75rem' }}>
            <p style={{ margin: '0 0 4px' }}><strong>AquaRef</strong></p>
            <p style={{ margin: '0 0 4px' }}>Email: <a href="mailto:hello@aquaref.co" style={{ color: '#0077b6' }}>hello@aquaref.co</a></p>
            <p style={{ margin: '0' }}>Website: <a href="https://aquaref.co" style={{ color: '#0077b6' }}>aquaref.co</a></p>
          </div>
        </Section>

        <footer style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid #ddd', fontSize: '13px', color: '#999', fontFamily: 'sans-serif', textAlign: 'center' }}>
          &copy; {new Date().getFullYear()} AquaRef. All rights reserved.
        </footer>
      </main>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: '2rem' }}>
      <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#03045e', marginBottom: '0.75rem', fontFamily: 'sans-serif' }}>{title}</h2>
      <div style={{ fontSize: '15px', color: '#333' }}>{children}</div>
    </section>
  )
}