// Discipline content — single source of truth for the public Para Swimming page.
// Citations verified against World Para Swimming Rules and Regulations
// (February 2026 — FINAL).
//
// IMPORTANT: Para Swimming is governed by World Para Swimming (WPS), a body
// operating under the International Paralympic Committee (IPC) — NOT World Aquatics.

import type { DisciplineContent } from "./swimming";

export const paraSwimming: DisciplineContent = {
  slug: "para-swimming",
  name: "Para Swimming",
  metaTitle: "Para Swimming Rules — AI Rules Assistant | AquaRef",
  metaDescription:
    "Get instant answers about Para Swimming rules, classifications, codes of exception, tappers, and stroke-specific adaptations. Based on World Para Swimming (WPS) Rules under the IPC. Try free.",
  ogImagePath: "/og-images/para-swimming.png",
  rulebookName: "World Para Swimming Rules & Regulations — February 2026",
  rulebookCycle: "Governed by the International Paralympic Committee (IPC) — separate from World Aquatics",
  heroEyebrow: "World Para Swimming (WPS) · IPC",
  heroSub:
    "Instant answers from the World Para Swimming Rules and Regulations (February 2026). Para Swimming is governed by World Para Swimming (WPS) under the International Paralympic Committee (IPC) — separate from World Aquatics.",
  demoPlaceholder: "Ask anything about Para Swimming rules...",
  suggestedQuestions: [
    "Are tappers required for all vision-impaired swimmers?",
    "Can a swimmer wear a prosthetic leg during the race?",
    "What is a Code of Exception?",
  ],
  sectionHeading: "The ten calls every official, coach, and parent should know.",
  sectionLead:
    "Every call below is grounded in a specific World Para Swimming article. Tap any card to ask the AI for the full ruling.",
  dqReasons: [
    {
      num: "01",
      category: "FALSE START",
      title: "Initiating before the signal",
      body: "Para Swimming uses the one-start rule. Any athlete initiating a start before the signal may be disqualified. If the start signal sounds before the disqualification is declared, the race shall continue and the athlete is disqualified upon completion. If declared before the start signal, the signal is not given and remaining athletes are called back.",
      cite: "WPS 11.1.5",
    },
    {
      num: "02",
      category: "BACKSTROKE START",
      title: "Inability to grip — adaptations",
      body: "Athletes who can't hold both starting grips may hold with one hand (Code 1). Those who can't hold either grip may hold the end of the pool. Athletes unable to do either may be assisted by Support Staff or an approved starting device — but giving momentum to the athlete at the start is not permitted, and some part of the body must remain in contact with the wall until the start signal.",
      cite: "WPS 11.3.1.1, 11.3.1.2, 11.3.1.3 · App 1 Code Y",
    },
    {
      num: "03",
      category: "SUPPORT STAFF AT START",
      title: "Holding S/SB/SM 1–3 to the wall or platform",
      body: "Support Staff may hold an athlete's foot/feet or the end of their lower limb to the wall in a water start, or aid balance on the platform — but the athlete cannot be held beyond the 90° vertical position on the platform, and giving momentum at the start is not permitted.",
      cite: "WPS 11.1.2.2, 11.1.2.7",
    },
    {
      num: "04",
      category: "TAPPING",
      title: "Tappers mandatory for S11 / SB11 / SM11",
      body: "For athletes in Sport Classes S11, SB11, and SM11, tapper(s) and tapping are mandatory at every turn and every finish. If tapping is required at both ends of the pool, two separate tappers shall be used — one at each end. Tapping devices must be prior approved by World Para Swimming. For other Sport Classes, tappers and tapping are optional.",
      cite: "WPS 10.8.3, 10.8.3.1, 10.8.3.2, 10.8.3.3 · App 1 Code T",
    },
    {
      num: "05",
      category: "VISION IMPAIRMENT",
      title: "Blackened goggles for S11 / SB11 / SM11",
      body: "Athletes in Sport Classes S11, SB11, and SM11 shall be required to wear opaque (blackened-in) goggles for competition, except those with prosthetics in both eyes. Where facial structure does not support goggles, an opaque covering shall be required. Goggles are checked at the finish. If goggles accidentally fall off during the dive or break during the race, the athlete shall NOT be disqualified.",
      cite: "WPS 11.8.8, 11.8.8.1 · App 1 Code B",
    },
    {
      num: "06",
      category: "EQUIPMENT",
      title: "Prostheses prohibited; cochlear implants & insulin pumps permitted",
      body: "No athlete shall be permitted to use a prosthesis (except ocular) or orthoses during the race. The wearing of cochlear implants and insulin pumps is permitted.",
      cite: "WPS 11.8.9, 11.8.10",
    },
    {
      num: "07",
      category: "BREASTSTROKE TOUCH",
      title: "Simultaneous touch with coded exceptions",
      body: "Standard rule: at each turn and at the finish the touch shall be made with both hands separated and simultaneously. Codes of Exception modify this — athletes with one functional arm (Code 2) touch with that arm; with different arm lengths (Code 3) only the longer arm must touch but both must stretch forward simultaneously. Athletes in SB11–12 shall not be disqualified if lane-rope contact prevents simultaneous touch, provided no advantage was gained.",
      cite: "WPS 11.4.6, 11.4.6.1, 11.4.6.3, 11.4.6.5 · App 1",
    },
    {
      num: "08",
      category: "BREASTSTROKE KICK",
      title: "Outward foot turn — exception for unable legs",
      body: "Standard rule: feet must be turned outwards during the propulsive part of the kick. An athlete who is unable to use one or both legs/feet to gain propulsion (Codes 8 & 9) shall not be required to turn the affected foot outward. Athletes with a lower-limb impairment must show simultaneous intent to kick or trail/drag the leg(s) throughout the race (Code 12).",
      cite: "WPS 11.4.4.1, 11.4.5, 11.4.5.1 · App 1",
    },
    {
      num: "09",
      category: "BUTTERFLY",
      title: "One-arm recovery & touch (Codes 4 & 5)",
      body: "Where an athlete can only use one arm for the arm stroke, that arm must be brought forward over the water; the non-functioning arm shall be dragged or stretched forward throughout the race. The body must remain in line with the water surface. At each turn and at the finish, the athlete must touch with the one hand/arm used for the stroke.",
      cite: "WPS 11.5.2.4, 11.5.4.3 · App 1",
    },
    {
      num: "10",
      category: "LANE DEVIATION",
      title: "Surfacing in another lane — VI athletes",
      body: "Athlete with a tapper who surfaces in an empty lane: no DQ. Surfaces in a lane in use, finishes there without fouling: no DQ — though it is preferable to return to the correct lane (the tapper may give verbal instructions, but only after clearly identifying the athlete by name). Athlete WITHOUT a tapper who surfaces in another lane: DQ.",
      cite: "WPS 11.8.3, 11.8.3.1, 11.8.3.2",
    },
  ],
  faqs: [
    {
      question: "Is Para Swimming governed by World Aquatics?",
      answer:
        "No. Para Swimming is governed by World Para Swimming (WPS), a body operating under the International Paralympic Committee (IPC) — separate from World Aquatics. The authoritative rulebook is the World Para Swimming Rules and Regulations (February 2026).",
      cite: "WPS 2.3 (Governance)",
    },
    {
      question: "What do the S, SB, and SM classifications mean?",
      answer:
        "S applies to Freestyle, Backstroke, and Butterfly events. SB applies to Breaststroke. SM applies to Individual Medley. Class numbers 1–10 cover physical impairments (1 = greatest activity limitation). Numbers 11–13 cover vision impairments (11 = no functional vision). Number 14 covers intellectual impairment.",
      cite: "WPS Section 1 (Definitions) · WPS 10.4",
    },
    {
      question: "Can my child compete in a WPS event without being classified?",
      answer:
        "Generally no. At Paralympic Games, World Para Swimming Championships, and World Para Swimming Sanctioned Competitions, an athlete who has not been assessed by a World Para Swimming Classification Panel does not meet the eligibility criteria — unless the qualification criteria for that specific event state otherwise.",
      cite: "WPS 4.6.2",
    },
    {
      question: "Are tappers required for all vision-impaired swimmers?",
      answer:
        "Tappers and tapping are mandatory only for athletes in Sport Classes S11, SB11, and SM11 — for every turn and every finish. For athletes in other Sport Classes (including S/SB/SM 12–13), tappers and tapping are optional and do not have to be consistent throughout a race or competition.",
      cite: "WPS 10.8.3.1, 10.8.3.3",
    },
    {
      question: "Can a swimmer wear a prosthetic leg or arm during the race?",
      answer:
        "No. Prostheses and orthoses are prohibited during the race, with one exception — ocular prostheses are permitted. Cochlear implants and insulin pumps are also permitted.",
      cite: "WPS 11.8.9, 11.8.10",
    },
    {
      question: "What is a Code of Exception?",
      answer:
        "A formal allocation made by the Classification Panel during Technical Assessment that permits an athlete to depart from a specific stroke or start rule (for example, Code 1 = one-hand backstroke start; Code 2 = one-hand breaststroke touch; Code B = blackened goggles). All codes are listed in Appendix One of the rulebook. Any request to amend a Code must go through the Medical Review Request procedure.",
      cite: "WPS Appendix One",
    },
    {
      question: "What happens if blackened goggles fall off or break during the race?",
      answer:
        "No DQ. If the goggles accidentally fall off during the dive or break during the race, the athlete shall not be disqualified.",
      cite: "WPS 11.8.8.1",
    },
    {
      question: "Can starting devices help athletes who can't grip the wall?",
      answer:
        "Yes — provided the device has been cleared and deemed safe by World Para Swimming-appointed officials before the competition starts. Support Staff may also assist. The athlete must keep some part of the body in contact with the wall until the start signal is given, and giving momentum at the start is not permitted.",
      cite: "WPS 11.1.2.8, 11.3.1.3 · App 1 Code Y",
    },
    {
      question: "What is autonomic dysreflexia and why does it matter at meets?",
      answer:
        "A medical condition that can affect athletes with certain spinal cord injuries. The IPC Policy on Autonomic Dysreflexia (located on the IPC website) applies to all World Para Swimming Recognised Competitions.",
      cite: "WPS 6.8.1",
    },
    {
      question: "Can a swimsuit be modified to accommodate an impairment?",
      answer:
        "Yes. Modifications to a swimsuit and deviations from the body-coverage requirements (Rule 10.16.7) to accommodate an athlete's impairment are permissible, provided they have been approved and recorded by World Para Swimming-appointed officials before the competition starts. Outside of those approved modifications, the suit must be on the WPS approved list.",
      cite: "WPS 10.16.1, 10.16.2",
    },
  ],
  datePublished: "2026-05-02",
  dateModified: "2026-05-02",
};