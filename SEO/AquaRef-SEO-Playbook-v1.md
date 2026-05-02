# AquaRef SEO Foundation Playbook v1.0

> Living document. Last updated: May 2026.
> Owner: Adhwa. Technical guide: Claude.
> Review cadence: weekly.

---

## 0. Honest framing

The goal "most sought-after aquatics website in the world" is aspirational. We translate it here into measurable, achievable milestones. Hitting these targets does not require luck — it requires consistent execution against the highest-leverage moves.

What is NOT in our control: Google algorithm changes, new competitors entering, rule changes in aquatics governance, market shifts.

What IS in our control: technical foundation, content quality at scale, citation accuracy, link-worthy assets, response speed to rule changes.

We focus exclusively on what's in our control.

---

## 1. Target milestones

### 12-month targets (May 2026 → May 2027)

- 5,000+ indexed pages, mostly programmatic Q&A
- Top 3 Google rank for 100+ long-tail aquatics rule queries
- 30,000+ monthly organic search visits
- Domain Authority 25+ (Moz) / Domain Rating 20+ (Ahrefs)
- 200+ referring domains
- Branded "aquaref" searches growing month-over-month

### 24-month targets (May 2027 → May 2028)

- 20,000+ indexed pages across 8 disciplines
- Top 3 rank for 1,000+ rule queries
- 200,000+ monthly organic visits
- De facto English-language reference for aquatics rules
- Federation backlinks from 10+ national federations

### How to know we're on track at 90 days

- 500+ indexed Q&A pages live
- First page rankings for 5+ low-competition long-tail queries
- 1,000+ monthly organic visits (from ~0 baseline)
- Search Console showing impressions trending up week-over-week

---

## 2. Week 1 setup checklist (do these first, in this order)

These are the foundational hygiene items. Without them, nothing else we do will be measurable.

- [ ] Google Search Console — verify aquaref.co (DNS or HTML method)
- [ ] Bing Webmaster Tools — verify aquaref.co (you can import from GSC)
- [ ] Google Analytics 4 — confirm tracking is firing on every page type
- [ ] Generate dynamic sitemap.xml at aquaref.co/sitemap.xml (Next.js can auto-generate)
- [ ] Submit sitemap to both GSC and Bing
- [ ] robots.txt audit — confirm we are NOT blocking /chat, /disciplines, or any public Q&A routes
- [ ] Add canonical tags sitewide (prevent duplicate content penalties)
- [ ] Open free Ahrefs Webmaster Tools account (free for site owners) — gives us competitor visibility
- [ ] Install Plausible or Vercel Analytics for fast page-speed feedback

These are all 1–4 hours of work each. None require a developer beyond your current setup.

---

## 3. Keyword universe (the initial 100)

These are organized by intent and ranked by leverage. Tier 1 are easiest wins; Tier 4 are higher value but harder.

### TIER 1 — Parent panic queries (HIGH volume, LOW competition quality)

Audience: Parents whose kid just got DQ'd. Emotional, urgent. Will read the full answer.

1. why was my swimmer disqualified
2. what does DQ mean in swimming
3. swimming DQ codes explained
4. one hand touch DQ swimming
5. breaststroke DQ reasons
6. butterfly DQ rules
7. backstroke DQ flip turn
8. freestyle DQ rules
9. swimming false start rule
10. 15 meter rule swimming
11. dolphin kick DQ breaststroke
12. swimmer touched bottom of pool DQ
13. relay takeoff DQ rules
14. swimmer pulled lane rope DQ
15. underwater kick limit swimming
16. how to appeal swimming disqualification
17. is scissor kick legal in swimming
18. backstroke turn rule
19. butterfly two hand touch rule
20. swim meet DQ what happens
21. why didn't my swimmer's time count
22. swimming touch pad DQ
23. starting block movement DQ
24. swimming goggles fell off DQ
25. swimming DQ slip explanation

### TIER 2 — Coach/official questions (MID volume, HIGH intent, qualified buyers)

Audience: Coaches, officials, technical officials. These convert to PRO/ELITE.

26. World Aquatics 15m rule
27. breaststroke pullout legality
28. World Aquatics underwater dolphin kick rule
29. water polo exclusion vs penalty
30. open water swimming feeding station rules
31. World Aquatics false start procedure
32. swimming turn judge signal
33. stroke and turn judge requirements
34. World Aquatics certified official requirements
35. how to become a swimming official
36. swimming meet referee duties
37. starter signal procedure swimming
38. World Aquatics technical official certification
39. backstroke ledge rules
40. relay exchange rule World Aquatics
41. water polo penalty shot rules
42. water polo exclusion time
43. artistic swimming scoring system
44. diving degree of difficulty calculation
45. high diving platform height
46. open water swimming course rules
47. masters swimming age groups
48. para swimming classification system
49. World Aquatics pool depth requirements
50. swimming meet sanctioning rules

### TIER 3 — Stroke-specific & technical (steady search volume)

51. proper breaststroke kick rules
52. butterfly stroke rules World Aquatics
53. backstroke start rules
54. medley relay stroke order
55. individual medley turn rules
56. freestyle stroke definition
57. swimming start angle rules
58. butterfly arm recovery rule
59. breaststroke head out of water rule
60. backstroke flip turn legal moves
61. swimming finish touch rules
62. swimming starting block design
63. lane line markers regulations
64. pool length tolerance rules
65. swimming pool depth competition
66. timing system requirements swimming
67. touch pad sensitivity rules
68. swim cap rules competition
69. swimsuit approval World Aquatics
70. tech suit rules junior swimming
71. relay takeover zone rules
72. mixed relay rules
73. heat seeding rules swimming
74. championship final qualification rules
75. swim-off rules tied times

### TIER 4 — Rule-change & governance (lower volume, time-sensitive, link-bait)

76. World Aquatics 2025 rule changes
77. World Aquatics 2026 rule changes
78. new water polo rules 2026
79. World Aquatics constitution updates
80. FINA to World Aquatics rebrand history
81. World Aquatics technical committee decisions
82. World Aquatics championships qualifying times
83. Olympic swimming qualification rules
84. World Aquatics anti-doping rules
85. transgender athlete swimming rules
86. World Aquatics gender eligibility policy
87. World Aquatics swimwear approval list
88. world record approval criteria swimming
89. masters swimming world record rules
90. para swimming world record rules
91. World Aquatics appeals process
92. swimming protest procedure rules
93. video review swimming officiating
94. AOE automatic officiating equipment rules
95. World Aquatics meet sanction requirements
96. national federation membership World Aquatics
97. continental aquatics federation rules
98. World Aquatics medical regulations
99. World Aquatics meeting decisions 2026
100. aquatics integrity unit role

### Notes on this list

- Verify volumes in Google Keyword Planner / Ahrefs before final prioritization
- Tier 1 should produce ~70% of early traffic — start there
- Each query becomes a verified Q&A page following the spec in Section 4

---

## 4. Public Q&A page template specification

This is the single most important page type on the site. It is the unit of programmatic SEO at scale. Get this template right and we replicate it 5,000+ times.

### URL structure

```
aquaref.co/[discipline-slug]/[question-slug]
```

Examples:
- aquaref.co/swimming/why-was-my-swimmer-disqualified
- aquaref.co/water-polo/exclusion-vs-penalty-difference
- aquaref.co/open-water/feeding-station-rules

Rules:
- Lowercase only
- Hyphens, never underscores
- Max 60 characters
- No stop words ("the", "a") unless natural
- Match user query language as closely as possible

### Required page elements (in order)

1. **Breadcrumb**: Home > Swimming > Q&A > [Question]
2. **H1**: The question, exactly as a user would type it
3. **Lead answer block** (above fold): Direct 1–2 sentence answer
4. **"Verified" badge**: "Reviewed by Adhwa [Surname], World Aquatics Certified TO" — major E-E-A-T signal
5. **Last updated date**: ISO format, prominent
6. **Detailed explanation**: 200–400 words, cite specific rule article number(s)
7. **Rule citation block**: Quoted rule with article number and rulebook source
8. **"Try AquaRef" CTA**: One question on us, no signup (free demo)
9. **Related Q&As**: 5 internal links to related questions (auto-generated)
10. **Discipline pillar link**: Back to /swimming, /water-polo, etc.
11. **Disclaimer footer**: "Always verify with the Meet Referee. Rules may have updated since last review."

### Required metadata

```html
<title>[Question] | AquaRef</title>
<meta name="description" content="[60-155 char direct answer]">
<meta property="og:title" content="[Question]">
<meta property="og:image" content="[Discipline-branded image]">
<link rel="canonical" href="https://aquaref.co/[path]">
```

### Required structured data (JSON-LD)

Two schemas per page:

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": {
    "@type": "Question",
    "name": "[Question]",
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "[Answer]",
      "author": {
        "@type": "Person",
        "name": "Adhwa [Surname]",
        "jobTitle": "World Aquatics Certified Technical Official"
      },
      "citation": "[Rulebook article reference]"
    }
  }
}
```

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [...]
}
```

### Don'ts (each one is a real mistake to avoid)

- DON'T paywall the answer text. Google needs to read it. Conversion happens via the "ask your own" CTA, not by gating.
- DON'T auto-publish unverified AI answers. Google's helpful content system penalizes low-quality programmatic content. Every page passes through your verification queue.
- DON'T over-optimize anchor text. Internal links should read naturally.
- DON'T duplicate content across discipline variants. If the same rule applies to swimming and masters swimming, canonical to one or differentiate substantially.
- DON'T forget the last-updated date — Google weighs freshness for rule queries.

---

## 5. First 30-day action checklist

### Week 1: Foundation
- Complete Section 2 setup checklist
- Audit current aquaref.co for technical issues (Search Console will reveal them)
- Define final URL structure (lock it in — changing later is painful)
- Create one example Q&A page manually following the template

### Week 2: Template build
- Implement the Q&A page template in Next.js with full schema markup
- Build the verification queue / admin workflow for publishing approved Q&As
- Test FAQPage schema with Google Rich Results Test
- Set up sitemap auto-update on new page publish

### Week 3: Seed content
- Adhwa publishes first 25 verified Q&A pages from Tier 1 keyword list
- Submit each to Search Console for indexing acceleration
- Internal linking pass: each Q&A links to related Q&As + discipline pillar

### Week 4: First measurement and iteration
- Review Search Console data: which pages got impressions, which clicked
- Identify any technical issues flagged by GSC
- Adjust template based on early data
- Plan Month 2: scale to 100+ Q&A pages, start discipline pillar redesign

---

## 6. Off-page strategy (link building)

Most aquatics sites fail here. We won't.

### Easy wins (Month 1–3)
- Submit aquaref.co to relevant directories (Crunchbase, Product Hunt, AlternativeTo)
- Get listed on Malaysia Aquatics (your own federation)
- Coach/club blog guest posts — pitch 5/month
- LinkedIn articles tagging World Aquatics topics

### Mid-difficulty (Month 3–9)
- Pitch ASEAN federations (Singapore, Indonesia, Thailand, Vietnam) for educational resource link
- Partner with swim coach education platforms
- Get cited by aquatics journalism (SwimSwam, etc.) by being the source for rule explainer

### Long game (Month 9–24)
- World Aquatics member federation links (any of 200+ countries)
- University swim program reference links
- Academic citations in aquatics research papers
- Wikipedia citations (very high value, very strict)

### What NOT to do
- No paid links (Google penalty risk)
- No PBNs (private blog networks)
- No comment spam
- No reciprocal link schemes

---

## 7. Content velocity targets

| Period | Cumulative Q&A pages | New pages/month |
|--------|---------------------|------------------|
| Month 1 | 50 | 50 |
| Month 3 | 250 | ~100 |
| Month 6 | 1,000 | ~250 |
| Month 12 | 5,000 | ~700 |

Critical constraint: every page Adhwa-verified before publishing. This means tooling matters — your verification queue needs to handle 25+ approvals/day at peak.

---

## 8. Risks and how we manage them

### Risk: Google algorithm update penalizes programmatic AI content
**Mitigation**: Every page is human-verified by a credentialed expert. Add author E-E-A-T markup. Keep content quality high, citation density high. Avoid thin pages.

### Risk: Brand confusion with aquaref.fr
**Mitigation**: Strong on-page branding (logo, colors, distinct positioning). Build branded search demand via QR codes at events. Monitor brand SERPs monthly.

### Risk: World Aquatics changes rules and 5,000 pages become outdated
**Mitigation**: Build a "needs review" trigger system tied to rulebook updates. Flag affected pages, batch-update, push freshness signal to Google.

### Risk: Competitor enters the space
**Mitigation**: Speed of publication. Topical authority compounds — first mover with quality wins. Build community moat (federation relationships).

### Risk: We over-invest in SEO at expense of product
**Mitigation**: SEO is a 6-12 month payoff. Don't gut product roadmap for it. Run as parallel track with maybe 20% of weekly capacity.

---

## 9. How we work together

- **You drive product direction**, including which features to ship and when.
- **I provide technical specifications**, content templates, audit findings, and strategic recalibrations.
- **We review weekly**: what shipped, what didn't, what to adjust.
- **Decisions are yours**, especially on brand/positioning/budget. I will flag tradeoffs but you make the call.
- **No guarantees on outcomes** — only commitment to highest-leverage moves.
- **This document is v1.0** and will iterate as we learn.

---

## 10. Open decisions for you

These need a call from you before we proceed past Week 2:

1. **Verification author identity**: Use your full name on Q&A pages? (Recommended yes — E-E-A-T)
2. **English only or multilingual?** (Recommend English-only for first 12 months)
3. **Show prices on Q&A pages?** (Recommend no — soft CTA only, prices on /pricing)
4. **Allow user-submitted questions to become public Q&As?** (Recommend yes after 6 months, with moderation)
5. **Open-source the Q&A corpus for citations?** (Long-term moat question — defer 12 months)

---

*End of v1.0. Next revision: after Week 4 measurement check-in.*
