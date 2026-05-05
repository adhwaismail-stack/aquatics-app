export default function SubmissionGuidelines() {
  return (
    <div style={{ background: '#ffffff', minHeight: '100vh', colorScheme: 'light' }}>
      <main style={{ maxWidth: '760px', margin: '0 auto', padding: '3rem 1.5rem', fontFamily: 'Georgia, serif', color: '#1a1a2e', lineHeight: '1.8' }}>
        <div style={{ marginBottom: '2.5rem', borderBottom: '2px solid #0077b6', paddingBottom: '1.5rem' }}>
          <p style={{ fontSize: '13px', color: '#555', marginBottom: '0.5rem', fontFamily: 'sans-serif', letterSpacing: '0.08em', textTransform: 'uppercase' }}>AquaRef · Community</p>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', margin: '0 0 0.5rem', color: '#03045e' }}>Submission Guidelines</h1>
          <p style={{ fontSize: '14px', color: '#777', fontFamily: 'sans-serif' }}>Effective Date: 5 May 2026 &nbsp;·&nbsp; Last Updated: 5 May 2026</p>
        </div>

        <div style={{ background: '#f0f7ff', border: '1px solid #bdd7f0', borderRadius: '8px', padding: '1.25rem 1.5rem', marginBottom: '2.5rem', fontSize: '15px', color: '#333' }}>
          <p style={{ margin: '0 0 0.75rem', fontFamily: 'sans-serif', fontWeight: '700', color: '#03045e', fontSize: '14px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>At a glance</p>
          <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
            <li><strong>Who can submit:</strong> PRO and ELITE subscribers only.</li>
            <li><strong>What you can submit:</strong> Aquatics events (meets, clinics, tryouts) and announcements (results, club news, official notices).</li>
            <li><strong>Approval time:</strong> 24–48 hours after submission.</li>
            <li><strong>Required for events:</strong> Official poster and a sanctioning letter or equivalent proof.</li>
            <li><strong>After approval:</strong> All edits go live instantly. Suspicious edits are flagged for review.</li>
            <li><strong>Violations:</strong> Warning → 24h ban → 3-day ban → 1-week ban → permanent.</li>
          </ul>
          <p style={{ margin: '0', fontStyle: 'italic', color: '#555' }}>By submitting content to AquaRef, you confirm you have read and agreed to these guidelines.</p>
        </div>

        <Section title="1. Who Can Submit">
          <p>Submitting events and announcements is a feature available to paid subscribers. Each tier has its own monthly limit:</p>
          <ul>
            <li><strong>LITE (Free)</strong> — Cannot submit. Upgrade to PRO or ELITE to contribute events and announcements to the AquaRef community.</li>
            <li><strong>PRO (RM14.99/month)</strong> — Up to 5 events and 10 announcements per calendar month.</li>
            <li><strong>ELITE (RM39.99/month)</strong> — Unlimited events and announcements.</li>
          </ul>
          <p>Limits reset on the 1st of each calendar month. Submissions still pending review at month-end do not count against the new month's quota.</p>
          <p>If you represent a federation, club, or school and need higher volume or branded event hosting, see our PARTNER tier — contact <a href="mailto:hello@aquaref.co" style={{ color: '#0077b6' }}>hello@aquaref.co</a> for details.</p>
        </Section>

        <Section title="2. What You Can Submit">
          <p>AquaRef accepts submissions that are relevant, accurate, and useful to the aquatics community.</p>
          <p><strong>Acceptable events:</strong></p>
          <ul>
            <li>Sanctioned competitions (state, national, age-group, masters)</li>
            <li>Open water events</li>
            <li>Training camps and clinics</li>
            <li>Officials' courses and recertification</li>
            <li>Club tryouts and selection meets</li>
            <li>Aquatics workshops or seminars</li>
          </ul>
          <p><strong>Acceptable announcements:</strong></p>
          <ul>
            <li>Competition results and rankings</li>
            <li>Club news (achievements, anniversaries, new programmes)</li>
            <li>Official notices (rule updates from federations, schedule changes)</li>
            <li>Calls for officials, volunteers, or athletes</li>
            <li>Recognition posts (national team selections, milestones)</li>
          </ul>
          <p><strong>Where your submission appears:</strong> Approved events show on the dashboard event carousel, filtered by country and discipline. Approved announcements appear in user inboxes, also filtered by relevance. Both remain visible until their event date passes or you remove them.</p>
        </Section>

        <Section title="3. Quality Standards & Required Proof">
          <p>All submissions must meet a basic quality bar before approval:</p>
          <ul>
            <li><strong>Accurate information.</strong> Dates, venues, fees, contact details, and eligibility must be correct at time of submission.</li>
            <li><strong>Complete details.</strong> Events must include date, venue, organising body, and how to register or contact organisers.</li>
            <li><strong>Aquatics-relevant.</strong> Submissions must concern swimming, water polo, open water, artistic swimming, diving, high diving, masters swimming, or para swimming.</li>
            <li><strong>Original or authorised.</strong> You must own the content or have permission to share it.</li>
            <li><strong>Clear poster.</strong> Event posters must be legible, in a standard image format (JPG, PNG), and free of watermarks unrelated to the event itself.</li>
          </ul>
          <p><strong>Required proof for events:</strong></p>
          <ul>
            <li>Official event poster (mandatory)</li>
            <li>Sanctioning letter from the relevant federation or organising body (mandatory for sanctioned competitions)</li>
            <li>Equivalent authorisation document (for clinics, training camps, or unsanctioned events)</li>
          </ul>
          <p>Proof documents are stored privately and are visible only to AquaRef administrators. They are not shown to other users.</p>
        </Section>

        <Section title="4. What's Prohibited">
          <p>The following are not permitted and will be rejected on sight. Repeated attempts trigger the violations process in Section 7.</p>
          <ul>
            <li>External commercial links (affiliate links, unrelated product promotions, ticket reseller sites)</li>
            <li>Copyrighted material you do not own or have not been authorised to share</li>
            <li>Misleading or false information (fake events, inflated prize pools, unverified sanctioning)</li>
            <li>Spam (duplicate submissions, low-effort posts, content unrelated to aquatics)</li>
            <li>Discriminatory, harassing, or harmful content of any kind</li>
            <li>Impersonation of federations, clubs, officials, or other users</li>
            <li>Contact details for individuals who have not consented to public listing</li>
            <li>Political campaigning or content unrelated to the sport</li>
            <li>Submissions that violate Malaysian law or the laws of the country the event is held in</li>
          </ul>
        </Section>

        <Section title="5. Approval & Edit Process">
          <p>Every new submission is reviewed by a human administrator before it goes live.</p>
          <ul>
            <li><strong>Initial review window:</strong> 24–48 hours from submission. We aim to be faster, but this is the standard.</li>
            <li><strong>One approval per submission.</strong> Once approved, your event or announcement is live.</li>
            <li><strong>Edits after approval are instant.</strong> You do not need to resubmit for review when fixing typos, swapping a poster, updating a date, or deactivating a listing.</li>
            <li><strong>Suspicious edits are flagged.</strong> Our system flags edits that change the title significantly, add external links, shift the tone of the content, or repeat unusually often. Flagged edits are reviewed daily and may be reverted, with the contributor notified.</li>
            <li><strong>Rejected submissions</strong> are returned with a brief reason. You may revise and resubmit at any time, subject to your monthly limit.</li>
          </ul>
        </Section>

        <Section title="6. Tips for Faster Approval">
          <p>A clean submission moves through review quickly. To help us help you:</p>
          <ul>
            <li>Upload a high-resolution poster (1080px wide or larger).</li>
            <li>Make sure event dates, venue address, and entry fees match what's on the poster.</li>
            <li>Provide the sanctioning letter as a clear PDF or image — not a screenshot of a screenshot.</li>
            <li>Use a clear, descriptive title ("MSSM Akuatik 2026 — Pahang" rather than "Big Meet").</li>
            <li>If your event is multi-discipline, list all disciplines in the description.</li>
            <li>Include a contact email or registration link so users can act on the announcement.</li>
            <li>Submit at least 7 days before your event date when possible.</li>
          </ul>
        </Section>

        <Section title="7. Violations & Enforcement">
          <p>We take a graduated approach to violations. The goal is correction, not punishment — but repeated or serious breaches result in losing submission privileges.</p>
          <p><strong>The five-step ladder:</strong></p>
          <ol>
            <li><strong>Warning</strong> — first offence. Submission is rejected with a written reason. No restrictions on your account.</li>
            <li><strong>24-hour suspension</strong> — second offence. You cannot submit new content for 24 hours.</li>
            <li><strong>3-day suspension</strong> — third offence. You cannot submit new content for 3 days.</li>
            <li><strong>1-week suspension</strong> — fourth offence. You cannot submit new content for 7 days.</li>
            <li><strong>Permanent ban from submitting</strong> — fifth offence, or any single offence we judge severe (deliberate fraud, copyright infringement, harassment, impersonation). Your subscription continues to work for reading, AI chat, and Event Hub access, but submission privileges are revoked.</li>
          </ol>
          <p>Suspensions affect submission privileges only. You retain full access to the Rules Assistant, Event Hub, and all features included in your plan during a suspension.</p>
          <p><strong>Severe violations</strong> — including deliberate misinformation, impersonation of a federation or official, copyright infringement, harassment, or attempts to circumvent suspensions — may skip directly to permanent ban without progressing through earlier steps.</p>
          <p><strong>Appeals.</strong> If you believe a violation was issued in error, contact us via the <a href="/contact" style={{ color: '#0077b6' }}>Contact page</a> within 7 days. We review every appeal and reverse the decision when we agree we got it wrong.</p>
          <p>These guidelines work alongside our <a href="/terms-of-service" style={{ color: '#0077b6' }}>Terms of Service</a>. Violations of these guidelines may also constitute a breach of the Terms of Service, which can result in further action including account termination under Section 12 of the Terms.</p>
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