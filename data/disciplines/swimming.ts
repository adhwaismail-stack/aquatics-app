// Discipline content — single source of truth for the public Swimming page.

export type Citation = string;

export type DQReason = {
  num: string;
  category: string;
  title: string;
  body: string;
  cite: Citation;
};

export type FAQ = {
  question: string;
  answer: string;
  cite: Citation;
};

export type DisciplineContent = {
  slug: string;
  name: string;
  metaTitle: string;
  metaDescription: string;
  ogImagePath: string;
  rulebookName: string;
  rulebookCycle: string;
  heroEyebrow: string;
  heroSub: string;
  demoPlaceholder: string;
  suggestedQuestions: string[];
  sectionHeading: string;
  sectionLead: string;
  dqReasons: DQReason[];
  faqs: FAQ[];
  datePublished: string;
  dateModified: string;
};

export const swimming: DisciplineContent = {
  slug: "swimming",
  name: "Swimming",
  metaTitle: "Swimming Rules — AI Rules Assistant | AquaRef",
  metaDescription:
    "Get instant answers about Swimming rules, disqualifications, and regulations. Reviewed by World Aquatics certified Technical Officials. Try free.",
  ogImagePath: "/og-images/swimming.png",
  rulebookName: "World Aquatics Swimming Competition Regulations",
  rulebookCycle: "2025–2028",
  heroEyebrow: "World Aquatics Swimming",
  heroSub:
    "Instant answers from the World Aquatics Swimming Competition Regulations, reviewed by certified Technical Officials.",
  demoPlaceholder: "Ask anything about Swimming rules...",
  suggestedQuestions: [
    "Why was my swimmer disqualified in breaststroke?",
    "What is the 15-meter rule in swimming?",
    "Can a swimmer touch the bottom of the pool?",
  ],
  sectionHeading: "The ten ways a clean race becomes a DQ.",
  sectionLead:
    "Every reason below is a real call we've fielded. Tap any card to ask the AI for the full ruling — citations included.",
  dqReasons: [
    {
      num: "01",
      category: "TOUCH RULE",
      title: "One-handed touch in breaststroke or butterfly",
      body: "In breaststroke and butterfly, swimmers must touch the wall with both hands simultaneously at every turn and finish. A one-handed or staggered touch results in immediate disqualification.",
      cite: "SW 7.6 / SW 8.4",
    },
    {
      num: "02",
      category: "UNDERWATER",
      title: "Going past 15 meters underwater",
      body: "After every start and turn, swimmers must surface no later than 15 meters from the wall. Failing to break the surface by that mark in freestyle, butterfly, or backstroke results in a DQ.",
      cite: "SW 5.3 / SW 6.5 / SW 8.5",
    },
    {
      num: "03",
      category: "START",
      title: "False start (early start)",
      body: "Any movement on the starting block after the starter says \"Take your marks\" and before the start signal is a false start. One false start equals automatic disqualification.",
      cite: "SW 4.4",
    },
    {
      num: "04",
      category: "BACKSTROKE TURN",
      title: "Improper turn in backstroke",
      body: "Swimmers may turn onto their stomach to initiate a backstroke turn, but only one continuous freestyle arm pull is allowed before the flip. More than one stroke equals a DQ.",
      cite: "SW 6.4",
    },
    {
      num: "05",
      category: "BACKSTROKE FINISH",
      title: "Not finishing on the back in backstroke",
      body: "Swimmers must finish the race on their back, with some part of their body touching the wall. Finishing on the chest or in transition is a DQ.",
      cite: "SW 6.6",
    },
    {
      num: "06",
      category: "FORWARD PROPULSION",
      title: "Walking on the bottom of the pool",
      body: "In all strokes, taking a step or pushing off the bottom for forward propulsion results in disqualification. Standing in place to rest is allowed; walking is not.",
      cite: "SW 10.4",
    },
    {
      num: "07",
      category: "LANE ROPE",
      title: "Pulling on the lane rope",
      body: "Using the lane line for propulsion or balance during the race results in disqualification.",
      cite: "SW 10.5",
    },
    {
      num: "08",
      category: "SYMMETRY",
      title: "Non-simultaneous arms (butterfly / breaststroke)",
      body: "In butterfly, both arms must recover over the water simultaneously. In breaststroke, both arms must move in the same horizontal plane simultaneously. Asymmetry can lead to a DQ.",
      cite: "SW 7.2 / SW 8.3",
    },
    {
      num: "09",
      category: "RELAY",
      title: "Early relay takeoff",
      body: "A relay swimmer's feet must remain on the block until the previous swimmer has touched the wall. Leaving early is a DQ for the whole relay team.",
      cite: "SW 10.10",
    },
    {
      num: "10",
      category: "WATER ENTRY",
      title: "Re-entering the water during another race",
      body: "A swimmer who enters a pool where an event is in progress before all racers have finished will be disqualified from their next event.",
      cite: "SW 10.13",
    },
  ],
  faqs: [
    {
      question: "What does DQ mean in swimming?",
      answer:
        "DQ stands for \"disqualified.\" When a swimmer breaks a stroke or technical rule during a race, an official issues a DQ, and the swim doesn't count for time or place. The most common DQ reasons are improper touches, false starts, and going past 15 meters underwater.",
      cite: "SW 9 / SW 10",
    },
    {
      question: "Can a swimmer use a snorkel in competition?",
      answer:
        "No. World Aquatics rules prohibit any device that aids speed, buoyancy, or endurance during competition, including snorkels, fins, webbed gloves, and power bands.",
      cite: "SW 10.7",
    },
    {
      question: "What is the 15-meter rule in swimming?",
      answer:
        "After every start and turn in freestyle, butterfly, and backstroke, the swimmer's head must break the water surface no later than 15 meters from the wall. Lane lines have a marker indicating this point. The rule does not apply to breaststroke.",
      cite: "SW 5.3 / SW 6.5 / SW 8.5",
    },
    {
      question: "Can goggles fall off without causing a DQ?",
      answer:
        "Yes. Losing goggles during a race is not a disqualification. The swimmer is expected to continue racing without them.",
      cite: "SW 10.8",
    },
    {
      question: "Is a butterfly kick legal in breaststroke?",
      answer:
        "A single downward butterfly kick is permitted during the start and each turn pullout in breaststroke, but not during the regular swimming portion. Continuous butterfly kicking during breaststroke equals a DQ.",
      cite: "SW 7.1",
    },
    {
      question: "How do you appeal a swimming disqualification?",
      answer:
        "Appeals are filed in writing with the Meet Referee within a time limit set by the meet rules (typically 30 minutes after results are posted). The Jury of Appeal makes the final decision. The Meet Referee's interpretation of stroke rules is generally final and not subject to appeal.",
      cite: "GR 9",
    },
    {
      question: "Can a swimmer wear two swimsuits in competition?",
      answer:
        "No. World Aquatics rules permit only one swimsuit and require the suit to be on the World Aquatics approved swimwear list.",
      cite: "GR 5",
    },
    {
      question: "What happens if a swimmer's body touches the bottom of the pool?",
      answer:
        "Touching the bottom is not automatically a DQ — it only becomes a violation if the swimmer uses the bottom for forward propulsion (pushing off or walking). Brief incidental contact during underwater kicking is allowed.",
      cite: "SW 10.4",
    },
    {
      question: "Can a relay team be disqualified if one swimmer breaks a rule?",
      answer:
        "Yes. If any swimmer in a relay commits a stroke violation, false start, or other infraction, the entire relay team is disqualified.",
      cite: "SW 10.9",
    },
    {
      question: "What is a stroke and turn judge looking for?",
      answer:
        "Stroke and turn judges watch for legal stroke technique throughout the race and at every turn. They check arm symmetry, kick patterns, wall touches, body position at turns, and 15-meter underwater limits. They report any violations to the Referee for final DQ decisions.",
      cite: "SW 2.4",
    },
  ],
  datePublished: "2026-05-01",
  dateModified: "2026-05-01",
};