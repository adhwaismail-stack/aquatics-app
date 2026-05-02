// Discipline content — single source of truth for the public Masters Swimming page.
// Citations verified against World Aquatics Masters Competition Regulations
// (in force from February 2026).

import type { DisciplineContent } from "./swimming";

export const mastersSwimming: DisciplineContent = {
  slug: "masters-swimming",
  name: "Masters Swimming",
  metaTitle: "Masters Swimming Rules — AI Rules Assistant | AquaRef",
  metaDescription:
    "Get instant answers about Masters Swimming rules, age groups, relays, and championships. Reviewed by World Aquatics certified Technical Officials. Try free.",
  ogImagePath: "/og-images/masters-swimming.png",
  rulebookName: "World Aquatics Masters Competition Regulations",
  rulebookCycle: "In force from February 2026",
  heroEyebrow: "World Aquatics Masters",
  heroSub:
    "Instant answers from the World Aquatics Masters Competition Regulations, reviewed by certified Technical Officials.",
  demoPlaceholder: "Ask anything about Masters Swimming rules...",
  suggestedQuestions: [
    "How is my Masters age group determined?",
    "Can I use a breaststroke kick in butterfly?",
    "How are Masters relay age groups calculated?",
  ],
  sectionHeading: "The ten calls every Masters swimmer, coach, and official should know.",
  sectionLead:
    "Every call below is grounded in a specific World Aquatics Masters article. Tap any card to ask the AI for the full ruling.",
  dqReasons: [
    {
      num: "01",
      category: "AGE & ELIGIBILITY",
      title: "25 is the floor for Masters Swimming",
      body: "Masters Participants in Masters Swimming events must be 25 years of age or older. Age groups for individual events begin with 25–29 and continue in five-year increments (30–34, 35–39, 40–44, and so on) as high in age as necessary. Note that other Masters disciplines have different floors — Masters Water Polo, for instance, starts at 30.",
      cite: "MS 1.4 / MS 2.2",
    },
    {
      num: "02",
      category: "AGE & ELIGIBILITY",
      title: "Age is set on 31 December of the competition year",
      body: "Your age for the entire competition is determined by your age on 31 December in the year the competition starts (the date the first event at that competition begins). A swimmer who turns 30 in November 2026 swims the 30–34 age group for every Masters meet starting in 2026 — even one held in January.",
      cite: "MS 1.5",
    },
    {
      num: "03",
      category: "AGE & ELIGIBILITY",
      title: "You represent a Club, not a country",
      body: "Masters Participants only validly represent Clubs that are affiliated with a Member Federation and recognised by World Aquatics. No Masters Participant or team is designated as representing a country or Member Federation. A Participant may represent only one Club per sport in any one competition.",
      cite: "MS 1.7.3 / MS 1.8",
    },
    {
      num: "04",
      category: "START RULE",
      title: "Forward start: one foot OR one hand in contact",
      body: "When using the forward start, after the Referee's whistle, Masters Participants may take their starting positions on the starting platform or pool deck with at least one foot in contact with the front of the platform or deck — or in the water with at least one hand in contact with the starting wall. Masters do not need to be stationary to be considered ready to start.",
      cite: "MS 2.4.1.1 / MS 2.4.1.2",
    },
    {
      num: "05",
      category: "START RULE",
      title: "False start: discretion, not automatic DQ",
      body: "Any Masters Participant who initiates a start before the starting signal — observed and confirmed by both the Referee and the Starter — may be disqualified upon completion of the race, at the Referee's discretion. The Referee will consider whether the swimmer gained a significant advantage from the false start. This is a deliberate softening of the standard Part Two rule.",
      cite: "MS 2.4.1.3",
    },
    {
      num: "06",
      category: "STROKE RULE",
      title: "Breaststroke kick is allowed in Butterfly races",
      body: "In Butterfly races, a Masters Participant may use a Breaststroke kicking movement instead of a Butterfly kicking movement. Only one Breaststroke kick is permitted per arm pull, with two exceptions: a single Breaststroke kick is allowed prior to the turn and the finish without an arm pull, and a single Breaststroke kick is allowed after the start and after each turn before the first arm pull.",
      cite: "MS 2.4.7",
    },
    {
      num: "07",
      category: "MEET FORMAT",
      title: "Combined heats and shared lanes in distance events",
      body: "To keep the meet running and avoid empty lanes, the Management Committee may combine Masters age groups and/or sexes into the same race or set of races, while keeping them separate events for results and awards. In any individual Freestyle 400m, 800m, or 1500m race, two Masters Participants of the same sex may swim in the same lane, with separate timing for each.",
      cite: "MS 2.4.3",
    },
    {
      num: "08",
      category: "RELAY RULE",
      title: "Mixed Relay must be exactly 2 female + 2 male",
      body: "A Masters team in a Mixed Relay event consists of two female and two male Masters Participants. A team in a relay event that is not a Mixed Relay consists of four Masters Participants of the same sex. In all cases, the four team members must be registered with the same Club.",
      cite: "MS 2.5.1 / MS 2.5.2",
    },
    {
      num: "09",
      category: "RELAY RULE",
      title: "Relay age groups go in 40-year brackets",
      body: "A Masters relay team's age group is determined by the sum of the ages of all four team members (each calculated as their age on 31 December of the competition year). The brackets are: 100–119 years, then 120–159 years, 160–199 years, and so on in 40-year increments. Relay age groups are not the same shape as the 5-year individual age groups.",
      cite: "MS 2.5.3 / MS 2.5.4",
    },
    {
      num: "10",
      category: "WARM-UP SAFETY",
      title: "Feet-first entry, no training aids in the warm-up pool",
      body: "At the World Aquatics Masters Championships, unless in a designated sprint lane, Masters Participants must enter the pool feet first in a cautious manner, from a start or turn end only, and from a standing or sitting position. Diving entries are permitted only in designated sprint lanes, which are one-way. Training aids — including pull-buoys, kick boards, fins, hand paddles, cords, and similar — are not permitted in warm-up.",
      cite: "MS 7.6.7.2.1 / MS 7.6.7.2.4 / MS 7.6.7.2.8",
    },
  ],
  faqs: [
    {
      question: "How old do I have to be to swim Masters Swimming?",
      answer:
        "25 years of age or older. Age groups begin with 25–29 and continue in five-year increments (30–34, 35–39, and so on) as high in age as necessary. Note that other Masters disciplines have different floors — Masters Water Polo, for example, starts at 30.",
      cite: "MS 1.4 / MS 2.2",
    },
    {
      question: "How is my age determined for Masters competition?",
      answer:
        "By your age on 31 December in the year the competition starts (the date the first event at that competition begins). So a swimmer who turns 30 in November 2026 races in the 30–34 age group for any meet starting in 2026 — even a meet held in January 2026 before their birthday.",
      cite: "MS 1.5",
    },
    {
      question: "Do I represent my country at the World Aquatics Masters Championships?",
      answer:
        "No. Masters Participants represent Clubs, not countries. The Club must be affiliated with a Member Federation and recognised by World Aquatics, but no Masters Participant or team is designated as representing a country or Member Federation. You may represent only one Club per sport at any one competition.",
      cite: "MS 1.7.3 / MS 1.8",
    },
    {
      question: "What's different about a Masters false start compared to age-group swimming?",
      answer:
        "At a Masters meet, a false start does not result in automatic disqualification. If a Participant initiates a start before the signal (observed and confirmed by both the Referee and the Starter), they may be disqualified at the completion of the race, at the Referee's discretion, who considers whether the swimmer gained a significant advantage from the false start.",
      cite: "MS 2.4.1.3",
    },
    {
      question: "Why is a breaststroke kick allowed in butterfly at Masters meets?",
      answer:
        "Article 2.4.7 explicitly permits Masters Participants in Butterfly races to use a Breaststroke kicking movement instead of a Butterfly kick. Only one Breaststroke kick is permitted per arm pull, except that a single Breaststroke kick is allowed before the turn and finish (without an arm pull), and a single kick is allowed after the start and after each turn before the first arm pull. The rule recognises that not every Masters swimmer can sustain a dolphin kick across longer distances.",
      cite: "MS 2.4.7",
    },
    {
      question: "How are Masters relay age groups calculated?",
      answer:
        "By summing the ages of all four team members, with each member's age calculated under the standard Masters age rule (age on 31 December of the competition year). The brackets are 100–119 years, then 40-year increments thereafter (120–159, 160–199, and so on). The brackets are deliberately wider than the 5-year individual brackets.",
      cite: "MS 2.5.3 / MS 2.5.4",
    },
    {
      question: "Can a Mixed Medley Relay have three women and one man?",
      answer:
        "No. A Masters team in any Mixed Relay event must consist of exactly two female and two male Participants. A non-Mixed relay team must consist of four Participants of the same sex. In all cases, all four members must be registered with the same Club.",
      cite: "MS 2.5.2",
    },
    {
      question: "Can I use fins, paddles, or a pull-buoy during warm-up?",
      answer:
        "At the World Aquatics Masters Championships, no. Training aids — including but not limited to pull-buoys, kick boards, fins, hand paddles, cords, and similar — are not permitted in the warm-up or training pools. Safety Marshalls enforce this and report violations to the Referee. Other Masters meets follow their own warm-up rules, but at the championships the prohibition is explicit.",
      cite: "MS 7.6.7.2.8",
    },
    {
      question: "How many events can I enter at the World Aquatics Masters Championships?",
      answer:
        "A maximum of five individual Swimming events, plus additional relay events. In each individual event you compete in one age group only. In relay events you may compete in only one age group per event, but you may swim different relays in different age groups (for example, 4x50m Mixed Medley in one age group and 4x100m Mixed Medley in another). You may swim only one relay leg in any single race.",
      cite: "MS 7.6.3 / MS 7.6.4.2",
    },
    {
      question: "What happens if I swim much slower than my qualifying time at Worlds?",
      answer:
        "If a Masters Participant swims substantially slower than the Qualification Time in any event at the World Aquatics Masters Championships, World Aquatics or the Management Committee may withdraw that Participant from all other individual events they were due to swim at those championships. Qualifying standards must have been met in a competition within the two years prior to the championships start date.",
      cite: "MS 7.6.1.2 / MS 7.6.1.3",
    },
  ],
  datePublished: "2026-05-02",
  dateModified: "2026-05-02",
};