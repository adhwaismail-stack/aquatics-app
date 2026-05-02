# AquaRef Public Discipline Pages — Technical Specification v1.0

> Purpose: Convert AquaRef from a 1-page indexable site into a topical authority hub.
> Build target: Single page template, replicated across 8 disciplines.
> Priority: BLOCKING — the entire SEO strategy depends on this shipping first.

---

## 1. Problem statement

Currently:
- `aquaref.co/` → public homepage (indexed ✅)
- `aquaref.co/swimming` → 404 ❌
- `aquaref.co/chat/swimming` → behind login (correctly blocked from indexing)
- Homepage discipline cards → force signup before content

Result: Google can index exactly one page. The 100+ aquatics rule queries we want to rank for have nowhere to land.

## 2. Architecture decision

For each discipline, we need TWO separate page types:

| URL pattern | Purpose | Auth | SEO |
|-------------|---------|------|-----|
| `aquaref.co/[discipline]` | Public landing page (rules content, FAQs, demo) | No | ✅ Indexable |
| `aquaref.co/chat/[discipline]` | AI chat tool (existing) | Yes | ❌ Blocked (correct) |

The public page is the SEO asset. The chat page is the product. They are linked: public page has a "Try the AI" CTA that opens the free demo (2 questions, no signup).

## 3. URL structure (build all 8)

```
aquaref.co/swimming
aquaref.co/water-polo
aquaref.co/open-water
aquaref.co/artistic-swimming
aquaref.co/diving
aquaref.co/high-diving
aquaref.co/masters-swimming
aquaref.co/para-swimming
```

Rules:
- Lowercase only
- Hyphens, not underscores
- No trailing slash (or canonicalize one way and stick with it)
- Add all 8 URLs to `sitemap.xml`

## 4. Homepage CTA changes

Currently: Homepage discipline cards force signup.

New behavior: Homepage discipline cards link to the public discipline page (`/swimming`, `/water-polo`, etc.). The signup happens further down the funnel after the visitor sees value on the public page.

This is a critical conversion change — public pages must convert visitors via the free demo + signup CTAs, not by gatekeeping.

## 5. Page template — sections in order

Build this once as a reusable template, then populate per-discipline data (content + assets) for all 8.

### Section 1: Header
- Site logo + nav (existing)
- Login / Sign up buttons (existing)

### Section 2: Hero
- **H1**: "[Discipline] Rules — Ask Anything" (e.g., "Swimming Rules — Ask Anything")
- Subhead: 1-line value prop with rulebook citation. Example: "Instant answers from the World Aquatics Swimming Competition Regulations, verified by certified Technical Officials."
- Primary CTA button: "Try it free — 2 questions" → opens free demo, pre-filtered to this discipline
- Secondary CTA: "See pricing" → /pricing
- Hero visual: discipline-specific photo (replaces current emoji icons; aligns with Phase 2 brand upgrade)

### Section 3: Live demo widget
- Embedded chat input pre-filtered to this discipline
- Placeholder text: "Ask anything about [discipline] rules..."
- Suggested example questions (3, clickable):
  - For Swimming: "Why was my swimmer disqualified for breaststroke?", "What is the 15-meter rule?", "Can a swimmer touch the bottom of the pool?"
- 2 free questions, no signup required
- After 2 questions, blocking modal with sign-up CTA

### Section 4: "Common Reasons for DQ" or equivalent
- Section heading: "Common Disqualification Reasons" (Swimming, Water Polo, Open Water) OR "Common Rule Questions" (Artistic, Diving, High Diving, Masters, Para)
- 10 items in card grid format
- Each item: title + 1-paragraph plain-English explanation + cited rule article
- Each item links to a clickable question that opens the demo with that question pre-filled
- This is the highest-SEO-value section — these are direct keyword targets

### Section 5: "Recent Rule Changes" (optional, dynamic)
- Last 3 rule updates with date
- 1-sentence plain-English summary each
- Link to detailed explainer (future content type)
- Hide section if no rule changes available

### Section 6: FAQ block (CRITICAL for SEO)
- 10 Q&A pairs in expandable accordion format
- Each Q&A is a real query parents/coaches/officials search for
- Answers are 50–100 words, cite specific rule article
- **Must be wrapped in FAQPage JSON-LD schema** (see Section 8)
- Each answer includes a "Get the full answer" link to the demo

### Section 7: Trust block
- "Verified by Adhwa [Surname], World Aquatics Certified Technical Official"
- Source citation: "Powered by World Aquatics [Discipline] Competition Regulations"
- Update date: "Last reviewed: [ISO date]"

### Section 8: Conversion CTA block
- Heading: "Stop guessing. Start knowing."
- 3 plan tiers preview (LITE, PRO, ELITE) with key benefits
- Primary CTA: "Start free trial — 7 days"
- Link to /pricing for full comparison

### Section 9: Cross-discipline links
- "Explore other disciplines" with 7 cards linking to other discipline landing pages
- Internal linking is essential for topical authority distribution

### Section 10: Footer
- Standard footer (existing)

## 6. Technical requirements

### Rendering
- **Server-Side Rendered (SSR) or Static Site Generated (SSG)** — NOT client-side rendered
- The page content (especially H1, FAQ text, DQ reasons) MUST be in the initial HTML response, not rendered after JS execution
- If using Next.js App Router: use a Server Component
- If using Pages Router: use `getStaticProps` or `getServerSideProps`
- Test by viewing page source (Ctrl+U) — all SEO-critical content must be visible there

### Meta tags (per page)

```html
<title>[Discipline] Rules - AI Rules Assistant | AquaRef</title>
<meta name="description" content="Get instant answers about [Discipline] rules, disqualifications, and regulations. Verified by World Aquatics certified Technical Officials. Try free.">
<link rel="canonical" href="https://aquaref.co/[discipline]">

<!-- Open Graph -->
<meta property="og:title" content="[Discipline] Rules — Ask Anything | AquaRef">
<meta property="og:description" content="[same as description]">
<meta property="og:url" content="https://aquaref.co/[discipline]">
<meta property="og:image" content="https://aquaref.co/og-images/[discipline].png">
<meta property="og:type" content="website">

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="[Discipline] Rules — Ask Anything | AquaRef">
<meta name="twitter:description" content="[same as description]">
<meta name="twitter:image" content="https://aquaref.co/og-images/[discipline].png">
```

### Structured data (JSON-LD, in `<head>` or end of `<body>`)

Three schemas per page:

**1. WebPage schema:**
```json
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "[Discipline] Rules — Ask Anything",
  "description": "[Page meta description]",
  "url": "https://aquaref.co/[discipline]",
  "datePublished": "[ISO date of first publish]",
  "dateModified": "[ISO date of last update]",
  "author": {
    "@type": "Person",
    "name": "Adhwa [Surname]",
    "jobTitle": "World Aquatics Certified Technical Official"
  },
  "publisher": {
    "@type": "Organization",
    "name": "AquaRef",
    "url": "https://aquaref.co"
  }
}
```

**2. FAQPage schema** (wraps Section 6 FAQ block):
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "[Question text exactly as displayed]",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "[Answer text exactly as displayed]"
      }
    }
    // ... repeat for each FAQ item
  ]
}
```

**3. BreadcrumbList schema:**
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://aquaref.co"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "[Discipline]",
      "item": "https://aquaref.co/[discipline]"
    }
  ]
}
```

Validate all three with Google Rich Results Test (https://search.google.com/test/rich-results) before deploying.

### Sitemap update
After build, all 8 discipline URLs must appear in `https://aquaref.co/sitemap.xml` with:
- `<changefreq>weekly</changefreq>`
- `<priority>0.9</priority>`
- Current `<lastmod>` date

### Internal linking rules
- Footer of every page links to all 8 discipline pages
- Each discipline page links to all 7 other discipline pages (Section 9)
- Homepage links to all 8 discipline pages prominently
- Blog/content pages (when built) link back to relevant discipline pages

### Performance targets (Core Web Vitals)
- LCP (Largest Contentful Paint): < 2.5s
- FID/INP (Interaction): < 200ms
- CLS (Cumulative Layout Shift): < 0.1
- Hero images: WebP format, lazy-load below-fold images, proper width/height attributes

### Mobile
- Fully responsive
- Tap targets minimum 44x44 pixels
- Demo widget fully functional on mobile
- No horizontal scroll

### Accessibility
- Semantic HTML (`<header>`, `<main>`, `<nav>`, `<article>`, `<section>`, `<footer>`)
- Alt text on all images
- ARIA labels on interactive elements
- Keyboard navigable

## 7. Worked example: Swimming page content

Build the template using this content for `aquaref.co/swimming`. After template is working, replicate the structure for the other 7 disciplines (Adhwa will provide content for each).

### Hero
- H1: **Swimming Rules — Ask Anything**
- Subhead: "Instant answers from the World Aquatics Swimming Competition Regulations, verified by certified Technical Officials."

### Demo widget pre-fills
Suggested example questions:
1. "Why was my swimmer disqualified in breaststroke?"
2. "What is the 15-meter rule in swimming?"
3. "Can a swimmer touch the bottom of the pool during a freestyle race?"

### Common Disqualification Reasons (Section 4) — 10 items

1. **One-handed touch in breaststroke or butterfly** — In breaststroke and butterfly, swimmers must touch the wall with both hands simultaneously at every turn and finish. A one-handed or staggered touch results in immediate disqualification.

2. **Going past 15 meters underwater** — After every start and turn, swimmers must surface no later than 15 meters from the wall. Failing to break the surface by that mark in freestyle, butterfly, or backstroke results in a DQ.

3. **False start (early start)** — Any movement on the starting block after the starter says "Take your marks" and before the start signal is a false start. One false start = automatic disqualification.

4. **Improper turn in backstroke** — Swimmers may turn onto their stomach to initiate a backstroke turn, but only one continuous freestyle arm pull is allowed before the flip. More than one stroke = DQ.

5. **Not finishing on the back in backstroke** — Swimmers must finish the race on their back, with some part of their body touching the wall. Finishing on the chest or in transition is a DQ.

6. **Walking on the bottom of the pool** — In all strokes, taking a step or pushing off the bottom for forward propulsion results in disqualification. Standing in place to rest is allowed; walking is not.

7. **Pulling on the lane rope** — Using the lane line for propulsion or balance during the race results in disqualification.

8. **Non-simultaneous arm movement (butterfly/breaststroke)** — In butterfly, both arms must recover over the water simultaneously. In breaststroke, both arms must move in the same horizontal plane simultaneously. Asymmetry can lead to a DQ.

9. **Early relay takeoff** — A relay swimmer's feet must remain on the block until the previous swimmer has touched the wall. Leaving early is a DQ for the relay team.

10. **Re-entering the water during another race** — A swimmer who enters a pool where an event is in progress before all racers have finished will be disqualified from their next event.

### FAQ block (Section 6) — 10 Q&As

1. **Q: What does DQ mean in swimming?**
   A: DQ stands for "disqualified." When a swimmer breaks a stroke or technical rule during a race, an official issues a DQ, and the swim doesn't count for time or place. The most common DQ reasons are improper touches, false starts, and going past 15 meters underwater. (Cited: World Aquatics SW 9, SW 10)

2. **Q: Can a swimmer use a snorkel in competition?**
   A: No. World Aquatics rules prohibit any device that aids speed, buoyancy, or endurance during competition, including snorkels, fins, webbed gloves, and power bands. (Cited: World Aquatics SW 10.7)

3. **Q: What is the 15-meter rule in swimming?**
   A: After every start and turn in freestyle, butterfly, and backstroke, the swimmer's head must break the water surface no later than 15 meters from the wall. Lane lines have a marker indicating this point. The rule does not apply to breaststroke. (Cited: World Aquatics SW 5.3, SW 6.5, SW 8.5)

4. **Q: Can goggles fall off without causing a DQ?**
   A: Yes. Losing goggles during a race is not a disqualification. The swimmer is expected to continue racing without them. (Cited: World Aquatics SW 10.8)

5. **Q: Is a butterfly kick legal in breaststroke?**
   A: A single downward butterfly kick is permitted during the start and each turn pullout in breaststroke, but not during the regular swimming portion. Continuous butterfly kicking during breaststroke = DQ. (Cited: World Aquatics SW 7.1)

6. **Q: How do you appeal a swimming disqualification?**
   A: Appeals are filed in writing with the Meet Referee within a time limit set by the meet rules (typically 30 minutes after results are posted). The Jury of Appeal makes the final decision. The Meet Referee's interpretation of stroke rules is generally final and not subject to appeal. (Cited: World Aquatics GR 9)

7. **Q: Can a swimmer wear two swimsuits in competition?**
   A: No. World Aquatics rules permit only one swimsuit and require the suit to be on the World Aquatics approved swimwear list. (Cited: World Aquatics GR 5)

8. **Q: What happens if a swimmer's body touches the bottom of the pool?**
   A: Touching the bottom is not automatically a DQ — it only becomes a violation if the swimmer uses the bottom for forward propulsion (pushing off or walking). Brief incidental contact during underwater kicking is allowed. (Cited: World Aquatics SW 10.4)

9. **Q: Can a relay team be disqualified if one swimmer breaks a rule?**
   A: Yes. If any swimmer in a relay commits a stroke violation, false start, or other infraction, the entire relay team is disqualified. (Cited: World Aquatics SW 10.9)

10. **Q: What is a stroke and turn judge looking for?**
    A: Stroke and turn judges watch for legal stroke technique throughout the race and at every turn. They check arm symmetry, kick patterns, wall touches, body position at turns, and 15-meter underwater limits. They report any violations to the Referee for final DQ decisions. (Cited: World Aquatics SW 2.4)

### Open Graph image
File: `og-images/swimming.png`
Specs: 1200×630px, includes "Swimming Rules — Ask Anything" text, AquaRef logo, on-brand colors

## 8. After-deploy checklist

After build and deploy, verify each of these for `/swimming` (then replicate test for other disciplines):

- [ ] `aquaref.co/swimming` returns HTTP 200
- [ ] View page source — H1, FAQ text, DQ reasons all visible in HTML (not just rendered after JS)
- [ ] Page is in `sitemap.xml` with correct lastmod
- [ ] Test FAQPage schema at https://search.google.com/test/rich-results — must show "Eligible" with no errors
- [ ] Test WebPage schema (same tool)
- [ ] Test BreadcrumbList schema (same tool)
- [ ] Demo widget loads and accepts 2 free questions before signup wall
- [ ] Page loads in < 2.5s on 4G mobile (test with PageSpeed Insights)
- [ ] All 7 cross-discipline links work (Section 9)
- [ ] Mobile responsive (test on actual phone, not just browser dev tools)
- [ ] OG image displays correctly when URL pasted into LinkedIn/X/Facebook
- [ ] Submit URL via Google Search Console URL Inspection → Request Indexing

After all 8 disciplines deployed:
- [ ] Re-submit sitemap to Google Search Console
- [ ] Submit each discipline URL individually for indexing (within daily quota)
- [ ] Repeat for Bing Webmaster Tools

## 9. What this unlocks

Once this template ships and 8 discipline pages go live:
- Site goes from 1 to 9 indexable, valuable pages
- Each FAQ page contributes 10 Q&A entries that Google can show as Rich Results
- Topical authority for "[discipline] rules" queries begins building
- Foundation for programmatic Q&A page expansion (5,000+ pages over 12 months) is in place
- Free demo becomes the conversion mechanism (much higher converting than forced signup)

This is the single highest-leverage build in the entire SEO strategy. Get this right and everything else compounds. Get this wrong and we rebuild it later anyway.

## 10. Out of scope (defer to future phases)

These are NOT part of v1.0 and should not block shipping:
- Discipline photos replacing emoji icons (Phase 2 brand upgrade — placeholder OK for now)
- Multi-language support
- Comments / community features on Q&As
- Country-specific rule variants
- Programmatic per-question Q&A pages (next major SEO build after this ships)

---

*End of v1.0 spec. Ship the template using Swimming as the worked example. Replicate for 7 other disciplines after template is verified working.*
