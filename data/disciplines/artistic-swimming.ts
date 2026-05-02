// Discipline content — single source of truth for the public Artistic Swimming page.
// Citations verified against World Aquatics Artistic Swimming Competition Regulations
// (Part Seven, in force from 18 February 2026).

import type { DisciplineContent } from "./swimming";

export const artisticSwimming: DisciplineContent = {
  slug: "artistic-swimming",
  name: "Artistic Swimming",
  metaTitle: "Artistic Swimming Rules — AI Rules Assistant | AquaRef",
  metaDescription:
    "Get instant answers about Artistic Swimming rules, deductions, and routine penalties. Reviewed by World Aquatics certified Technical Officials. Try free.",
  ogImagePath: "/og-images/artistic-swimming.png",
  rulebookName: "World Aquatics Artistic Swimming Competition Regulations",
  rulebookCycle: "In force from 18 February 2026",
  heroEyebrow: "World Aquatics Artistic Swimming",
  heroSub:
    "Instant answers from the World Aquatics Artistic Swimming Competition Regulations, reviewed by certified Technical Officials.",
  demoPlaceholder: "Ask anything about Artistic Swimming rules...",
  suggestedQuestions: [
    "What does Base Mark mean on the scoreboard?",
    "Why is touching the wall a disqualification?",
    "How are synchronisation errors deducted from the score?",
  ],
  sectionHeading: "The ten calls every official, coach, and parent should know.",
  sectionLead:
    "Every call below is grounded in a specific World Aquatics article. Tap any card to ask the AI for the full ruling.",
  dqReasons: [
    {
      num: "01",
      category: "DQ",
      title: "Stop Swimming or Use of Pool Wall",
      body: "If an athlete, duet, or team stops swimming or makes clear use of the wall before the routine is completed, they are disqualified. The Referee assesses whether the cessation was caused by circumstances beyond the athlete's control, and may permit the routine to be re-swum during the session. The same wording applies in parallel across all nine routine event types.",
      cite: "AS 6.7.5",
    },
    {
      num: "02",
      category: "8-PT PENALTY",
      title: "Deliberate Use of Pool Bottom to Propel",
      body: "An eight-point penalty is deducted from the routine score if an athlete makes deliberate use of the bottom of the pool to propel themselves during a routine. This applies across solo, duet, mixed duet, team, and acrobatic routines.",
      cite: "AS 6.7.6",
    },
    {
      num: "03",
      category: "8-PT PENALTY",
      title: "Deliberate Use of Pool Bottom to Assist",
      body: "In duet, mixed duet, team, and acrobatic routines, an eight-point penalty is deducted if an athlete makes deliberate use of the pool bottom to assist another athlete. No penalty applies when contact with the bottom results from the athlete's self-protection against impact injuries.",
      cite: "AS 6.8.7",
    },
    {
      num: "04",
      category: "8-PT PENALTY",
      title: "Deck Walk-On Time Exceeded",
      body: "Walk-on must reach a stationary position within twenty seconds for solo events and women's duet events, and within thirty seconds for mixed duet, open team, open free combination, and open acrobatic events. Exceeding the limit incurs an eight-point routine score penalty.",
      cite: "AS 6.3.3",
    },
    {
      num: "05",
      category: "8-PT PENALTY",
      title: "Deck Movements Exceeding Ten Seconds",
      body: "Deck movements — the choreographed action on the pool deck before entering the water — must not exceed ten seconds. Exceeding this limit triggers an eight-point penalty deducted from the routine score, applied in parallel across all event types.",
      cite: "AS 6.7.2",
    },
    {
      num: "06",
      category: "8-PT PENALTY",
      title: "Overall Routine Time Deviation",
      body: "An allowance of five seconds under or over the allotted routine time limit is permitted. Any deviation beyond that five-second allowance triggers an eight-point routine score penalty.",
      cite: "AS 6.3.2",
    },
    {
      num: "07",
      category: "2-PT PENALTY",
      title: "New Start After Deck Interruption",
      body: "A two-point penalty is deducted from the routine score if a routine is interrupted by an athlete during the deck movements and a new start is allowed. This is a single deduction, regardless of the number of athletes involved.",
      cite: "AS 6.7.3",
    },
    {
      num: "08",
      category: "ZERO MARK",
      title: "Omitted or Incorrect Technical Required Element",
      body: "If an athlete omits all or part of a Technical Required Element, or performs an incorrect action, the Difficulty Technical Controllers flag the issue. After video review confirms the declared movement was not correct, a zero is assigned as the Degree of Difficulty for that Technical Required Element.",
      cite: "AS 6.7.9",
    },
    {
      num: "09",
      category: "ZERO MARK",
      title: "Technical Required Element Swum Out of Order",
      body: "The Difficulty Technical Controller submits a zero for each Technical Required Element swum out of the order declared on the Coach Card — a violation of General Requirement #4 in Appendix 2. The applicable element range varies by event: TRE #1 to #5 in solo, duet, team, and acrobatic events; TRE #1 to #3 in mixed duet.",
      cite: "AS 6.7.10",
    },
    {
      num: "10",
      category: "BASE MARK",
      title: "Hybrid Maximums Exceeded",
      body: "A Hybrid is limited to a maximum of five declarations per family or three per technique. If either limit is exceeded, the Difficulty Technical Controller applies a Base Mark to that Hybrid. For duet and mixed duet only, the connections family also has a maximum of five declarations per Hybrid, with a limit of two per technique.",
      cite: "AS 6.7.12",
    },
  ],
  faqs: [
    {
      question: "What are the time limits for Artistic Swimming routines?",
      answer:
        "Senior time limits, including up to ten seconds of deck movements: Solo Technical 2:00, Solo Free 2:15, Women Duet Technical 2:20, Women Duet Free 2:45, Mixed Duet Technical 2:20, Mixed Duet Free 2:45, Open Team Technical 2:50, Open Team Free 3:30, and Open Acrobatic 3:00. An allowance of five seconds under or over is permitted; any deviation beyond that triggers an eight-point penalty.",
      cite: "AS 6.3.1",
    },
    {
      question: "Why does an athlete get disqualified for touching the wall during a routine?",
      answer:
        "If an athlete stops swimming or makes clear use of the wall before the routine is completed, they are disqualified. The Referee assesses whether the cessation was caused by circumstances beyond the athlete's control — if so, the Referee may allow the routine to be re-swum during the session.",
      cite: "AS 6.7.5",
    },
    {
      question: "Can my swimmer wear goggles, hair clips, or jewellery during a routine?",
      answer:
        "Additional clothing, accessories, equipment, and goggles are not permitted during routines unless required for medical reasons and approved by World Aquatics or its designee. Nose clips or plugs and small ear stud jewellery are permitted. Theatrical makeup is not permitted; natural makeup that represents the athlete's personality or the routine's theme is allowed.",
      cite: "AS 11.1.4",
    },
    {
      question: "How many judges actually score a routine, and what do they each do?",
      answer:
        "Two panels of five judges officiate every routine — one panel scores Elements (execution of each element), and one panel scores Artistic Impression (choreography and musicality, performance, and transitions). Three Difficulty Technical Controllers verify the predeclared difficulty of elements, and three Synchronisation Technical Controllers record synchronisation errors from deck level.",
      cite: "AS 6.5.2",
    },
    {
      question: "What does Base Mark actually mean on the scoreboard?",
      answer:
        "Every Free Element — Hybrids and Acrobatics — has a calculated minimum Degree of Difficulty called the Base Mark. If one or more components of the element is not performed, or is not performed in conformance with what is declared on the Coach Card, the Base Mark is applied. The element then scores at its declared minimum rather than its declared full difficulty.",
      cite: "AS 6.7.7",
    },
    {
      question: "How are synchronisation errors deducted from the score?",
      answer:
        "For all routines, the sum of all synchronisation errors observed by the Synchronisation Technical Controllers — each multiplied by its assigned value — is deducted from the Elements score. Values are: small 0.1 points, obvious 0.5 points, and major 3.0 points. Maximum deduction can reduce the Elements score to zero, but not to a negative score. Full descriptions appear in Appendix 8.",
      cite: "AS 6.8.14.1",
    },
    {
      question: "Can a team compete with fewer than eight swimmers?",
      answer:
        "An Open Team event consists of at least four but no more than eight athletes. If the team competes with fewer than eight athletes in Open Team Technical, Open Team Free, or Open Acrobatic Routine events, a half-point penalty is deducted from the total score for each athlete fewer than eight.",
      cite: "AS 6.10.1",
    },
    {
      question: "What are the minimum pool requirements for Artistic Swimming?",
      answer:
        "The pool must have a minimum area of 15 metres by 25 metres, within which an area of at least 12 metres by 12 metres must have a minimum depth of 3.0 metres. The remaining area must be at least 2.0 metres deep. Water clarity must allow the bottom of the pool to be visible, and water temperature must not be less than 27°C. At Olympic Games and World Aquatics Championships, the routine pool must be at least 30 metres by 20 metres with a minimum depth of 3.0 metres throughout.",
      cite: "AS 12.1.1",
    },
    {
      question: "Are nose clips allowed in competition?",
      answer:
        "Yes. Nose clips or plugs and small ear stud jewellery are explicitly permitted under the swimwear and wearables rules. They are the only accessory items expressly allowed during routines without separate medical approval.",
      cite: "AS 11.1.4",
    },
    {
      question: "What happens in a 12U Figure session if my child performs the wrong figure?",
      answer:
        "In the 12U category, if an athlete does not perform the correct figure, they are allowed to perform it again with a one-point penalty applied. If the athlete fails again, a zero is applied. This differs from the Youth category — in Youth, if the figure is incorrect, missing required elements, or performed other than according to the description, the Referee directs the judges to award a zero with no second attempt permitted.",
      cite: "AS 5.6.3",
    },
  ],
  datePublished: "2026-05-02",
  dateModified: "2026-05-02",
};