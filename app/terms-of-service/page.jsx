export default function TermsOfService() {
  return (
    <div style={{ background: '#ffffff', minHeight: '100vh', colorScheme: 'light' }}>
      <main style={{ maxWidth: '760px', margin: '0 auto', padding: '3rem 1.5rem', fontFamily: 'Georgia, serif', color: '#1a1a2e', lineHeight: '1.8' }}>
        <div style={{ marginBottom: '2.5rem', borderBottom: '2px solid #0077b6', paddingBottom: '1.5rem' }}>
          <p style={{ fontSize: '13px', color: '#555', marginBottom: '0.5rem', fontFamily: 'sans-serif', letterSpacing: '0.08em', textTransform: 'uppercase' }}>AquaRef · Legal</p>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', margin: '0 0 0.5rem', color: '#03045e' }}>Terms of Service</h1>
          <p style={{ fontSize: '14px', color: '#777', fontFamily: 'sans-serif' }}>Effective Date: 19 April 2025 &nbsp;·&nbsp; Last Updated: 25 April 2025</p>
        </div>

        <Section title="1. Acceptance of Terms">
          <p>By accessing or using AquaRef ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service. AquaRef is operated by AquaRef (Sole Proprietorship), registered in Malaysia.</p>
        </Section>

        <Section title="2. Description of Service">
          <p>AquaRef is a digital aquatics platform providing two core features:</p>
          <ul>
            <li><strong>Rules Assistant</strong> — An AI-powered assistant that answers questions about World Aquatics regulations based on official uploaded rulebooks. Currently supporting Swimming, Water Polo, Artistic Swimming, Diving, High Diving, Masters Swimming, Open Water Swimming, and Para Swimming (governed by World Para Swimming under IPC).</li>
            <li><strong>Event Hub</strong> — An AI-powered assistant trained on specific event documents (start lists, heat sheets, schedules, technical packages) that allows users to ask questions about a specific aquatics event.</li>
          </ul>
          <p>AquaRef also provides temporary athlete data collection services on behalf of sports organisations, as described in Section 9.</p>
        </Section>

        <Section title="3. User Accounts">
          <p>To access the Rules Assistant, you must create an account using a valid email address. Authentication is performed via magic link (passwordless login). You are responsible for maintaining the confidentiality of your account and for all activities that occur under your account.</p>
          <p>Event Hub may be accessed by logged-out users for preview purposes, but question limits apply based on your subscription plan.</p>
        </Section>

        <Section title="4. Subscription Plans and Payments">
          <p>AquaRef offers the following subscription tiers:</p>
          <ul>
            <li><strong>LITE</strong> — Free. 5 questions per month. Access to 1 discipline. 5 Event Hub questions per event (lifetime).</li>
            <li><strong>PRO</strong> — RM14.99/month. 50 questions per day. Access to 1 switchable discipline (switchable every 30 days). 50 Event Hub questions per day per event.</li>
            <li><strong>ELITE</strong> — RM39.99/month. Unlimited questions. Access to all 8 disciplines. Unlimited Event Hub questions. Priority support. Early feature access.</li>
            <li><strong>PARTNER</strong> — Custom pricing. For federations, clubs, schools, and event organizers. Includes Event Hub management, Live Notices, and custom features. Contact hello@aquaref.co for pricing.</li>
          </ul>
          <p>Payments are processed by Stripe. Subscriptions automatically renew unless cancelled. You may cancel at any time via your account dashboard. Refunds are not provided for partial subscription periods unless required by applicable law.</p>
        </Section>

        <Section title="5. Acceptable Use">
          <p>You agree to use AquaRef only for lawful purposes. You must not:</p>
          <ul>
            <li>Attempt to circumvent question limits or access controls</li>
            <li>Share your account credentials with others</li>
            <li>Use automated tools to scrape or extract content from AquaRef</li>
            <li>Reproduce or redistribute AI-generated answers as your own official rulings</li>
            <li>Use the Service in any way that could damage, disable, or impair the platform</li>
          </ul>
        </Section>

        <Section title="6. Accuracy of Information">
          <p>AquaRef AI answers are based strictly on official uploaded World Aquatics and World Para Swimming rulebooks. While we strive for accuracy, AI systems can make errors. All answers should be treated as reference material only.</p>
          <p><strong>Always verify important rulings with the official rulebook and your Meet Referee or Event Director.</strong> AquaRef accepts no liability for decisions made based on AI-generated answers.</p>
        </Section>

        <Section title="7. Intellectual Property">
          <p>The AquaRef platform, including its design, code, and AI systems, is the intellectual property of AquaRef. World Aquatics and World Para Swimming rulebooks are the intellectual property of their respective organisations and are used solely to power the AI assistant.</p>
          <p>You may not copy, reproduce, or redistribute AquaRef's platform, design, or AI-generated content without explicit written permission.</p>
        </Section>

        <Section title="8. Event Hub — User Terms">
          <p>Event Hub allows event organisers (federations, clubs, schools) to upload event documents and provide AI-powered Q&A for their events. By using Event Hub:</p>
          <ul>
            <li>As an <strong>organiser</strong>: You confirm you have the right to upload the documents provided. You retain ownership of all uploaded documents.</li>
            <li>As a <strong>user</strong>: You understand that Event Hub answers are based solely on uploaded event documents and may not reflect last-minute changes not yet uploaded by the organiser.</li>
            <li>Question limits apply per plan: LITE users receive 5 lifetime questions per event, PRO users receive 50 questions per day per event, and ELITE users receive unlimited questions.</li>
            <li>Live Notices posted by event administrators supersede document-based answers where there is a conflict.</li>
          </ul>
        </Section>

        <Section title="9. Event Documents, Athlete Data & Third-Party Collection">
          <p>AquaRef may be engaged by sports organisations to collect athlete data on their behalf. In such cases, data is collected temporarily, stored securely, and exported to the requesting organisation before being deleted from AquaRef systems. Users who submit data through these collection forms will receive a free AquaRef LITE account as part of the process. AquaRef acts as a data processor on behalf of the organisation, which remains the data owner.</p>
          <p><strong>Current active collection:</strong> Persatuan Akuatik Negeri Sembilan (PANS) — MSSNS 2026 athlete profiles. Data collected includes parent/guardian details and swimmer personal bests. This data will be exported to PANS and deleted from AquaRef systems after the event concludes.</p>
          <p>Documents uploaded to Event Hub by organisation administrators (federations, clubs, schools, or event organisers) remain the intellectual property of the uploading organisation. AquaRef processes these documents solely to power the Event Hub AI assistant for the specific event they were uploaded for.</p>
          <p>AquaRef does not use uploaded event documents or athlete data to train AI models, share them with unauthorised third parties, or use them for any purpose beyond the stated collection purpose.</p>
        </Section>

        <Section title="10. Privacy">
          <p>Your use of AquaRef is also governed by our <a href="/privacy-policy" style={{ color: '#0077b6' }}>Privacy Policy</a>, which is incorporated into these Terms by reference. By using AquaRef, you consent to the collection and use of your information as described in the Privacy Policy.</p>
        </Section>

        <Section title="11. Limitation of Liability">
          <p>To the maximum extent permitted by Malaysian law, AquaRef shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service. AquaRef's total liability shall not exceed the amount paid by you for the Service in the three months preceding the claim.</p>
        </Section>

        <Section title="12. Termination">
          <p>AquaRef reserves the right to suspend or terminate your account at any time for violations of these Terms. You may terminate your account at any time by contacting hello@aquaref.co. Upon termination, your data will be handled in accordance with our Privacy Policy.</p>
        </Section>

        <Section title="13. Changes to Terms">
          <p>AquaRef may update these Terms from time to time. We will notify users of significant changes via email or a notice on the platform. Continued use of the Service after changes constitutes acceptance of the updated Terms.</p>
        </Section>

        <Section title="14. Governing Law">
          <p>These Terms are governed by the laws of Malaysia. Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of the courts of Malaysia.</p>
        </Section>

        <Section title="15. Contact">
          <p>If you have any questions about these Terms, please contact us:</p>
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

function Section({ title, children }) {
  return (
    <section style={{ marginBottom: '2rem' }}>
      <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#03045e', marginBottom: '0.75rem', fontFamily: 'sans-serif' }}>{title}</h2>
      <div style={{ fontSize: '15px', color: '#333' }}>{children}</div>
    </section>
  )
}