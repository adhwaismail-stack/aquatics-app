// Discipline content — single source of truth for the public Swimming page.
// Citations verified against World Aquatics Swimming Competition Regulations
// (in force from February 2026).

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
  rulebookCycle: "In force from February 2026",
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
    "Every reason below is grounded in a specific World Aquatics article. Tap any card to ask the AI for the full ruling.",
  dqReasons: [
    {
      num: "01",
      category: "TOUCH RULE",
      title: "One-handed touch in breaststroke or butterfly",
      body: "In breaststroke and butterfly, the touch at every turn and finish must be made with both hands separated and simultaneously, at, above, or below the water surface. The hands cannot be stacked one on top of the other. A one-handed or staggered touch results in disqualification.",
      cite: "SW 7.7 / SW 8.5",
    },
    {
      num: "02",
      category: "UNDERWATER",
      title: "Going past 15 meters underwater",
      body: "After every start and turn in freestyle, butterfly, and backstroke, the swimmer's head must break the water surface no later than 15 meters from the wall. Failing to break the surface by that mark is a DQ.",
      cite: "SW 5.3 / SW 6.3 / SW 8.6",
    },
    {
      num: "03",
      category: "START",
      title: "False start (early start)",
      body: "Any swimmer who initiates the start before the starting signal may be disqualified. The disqualification is confirmed when both the Starter and the Referee observe the early initiation, with video review used when Automatic Officiating Equipment is available.",
      cite: "SW 4.4",
    },
    {
      num: "04",
      category: "BACKSTROKE TURN",
      title: "Improper turn in backstroke",
      body: "When executing a backstroke turn, the shoulders may be turned over the vertical to the breast, after which an immediate continuous single arm pull or immediate continuous simultaneous double arm pull may be used to initiate the turn. The swimmer must return to the back upon leaving the wall.",
      cite: "SW 6.4",
    },
    {
      num: "05",
      category: "BACKSTROKE FINISH",
      title: "Not finishing on the back in backstroke",
      body: "At the finish of a backstroke race, the swimmer must touch the finish wall while on the back. Finishing on the chest or in transition results in a DQ.",
      cite: "SW 6.5",
    },
    {
      num: "06",
      category: "FORWARD PROPULSION",
      title: "Walking on the bottom of the pool",
      body: "Standing or walking on the pool bottom is prohibited in all strokes — except during Freestyle events or the Freestyle leg of Medley events, where standing is permitted. Walking, however, is never permitted as it provides forward propulsion.",
      cite: "SW 10.2.3 / SW 10.2.4",
    },
    {
      num: "07",
      category: "LANE ROPE",
      title: "Pulling on the lane rope",
      body: "Using the lane line for propulsion or balance during the race results in disqualification.",
      cite: "SW 10.2.5",
    },
    {
      num: "08",
      category: "SYMMETRY",
      title: "Non-simultaneous arms (butterfly / breaststroke)",
      body: "In butterfly, both arms must be brought forward simultaneously over the water and backward simultaneously under the water. In breaststroke, all arm movements must be simultaneous and in the same horizontal plane without alternating movement. Asymmetry can lead to a DQ.",
      cite: "SW 7.3 / SW 8.3",
    },
    {
      num: "09",
      category: "RELAY",
      title: "Early relay takeoff",
      body: "Until the swimmer in the water touches the wall to complete their leg, the feet of the next relay team member must remain in contact with the starting platform. Leaving early disqualifies the relay team.",
      cite: "SW 10.4.5",
    },
    {
      num: "10",
      category: "WATER ENTRY",
      title: "Entering the water during another race",
      body: "A swimmer who enters a pool while a race is in progress, before all racers have completed the course, will be disqualified from the next race they are scheduled to compete in.",
      cite: "SW 10.2.7 / SW 10.3",
    },
  ],
  faqs: [
    {
      question: "What does DQ mean in swimming?",
      answer:
        "DQ stands for \"disqualified.\" When a swimmer breaches a stroke or technical rule during a race, the Referee disqualifies the swimmer and the swim does not count for time or place. Common DQ reasons include improper touches, false starts, and going past 15 meters underwater.",
      cite: "SW 10.3 / SW 4.4",
    },
    {
      question: "Can a swimmer use a snorkel in competition?",
      answer:
        "No. Other than permitted swimwear, an athlete must not wear or use any device that may aid speed, buoyancy, or endurance during competition. This includes webbed gloves, flippers, fins, adhesive substances, and similar aids such as snorkels.",
      cite: "SW 14.2",
    },
    {
      question: "What is the 15-meter rule in swimming?",
      answer:
        "After every start and turn in freestyle, butterfly, and backstroke, the swimmer's head must break the water surface no later than 15 meters from the wall. Lane lines have distinct floats marking this point. The 15-meter rule does not apply to breaststroke.",
      cite: "SW 5.3 / SW 6.3 / SW 8.6",
    },
    {
      question: "Can goggles fall off without causing a DQ?",
      answer:
        "Yes. Goggles are optional under World Aquatics rules — an athlete must wear a swimsuit and may wear goggles and/or a cap. There is no rule that disqualifies a swimmer for losing goggles during a race. The swimmer is expected to continue racing without them.",
      cite: "SW 14.1",
    },
    {
      question: "Is a butterfly kick legal in breaststroke?",
      answer:
        "Yes, but only once per turn. After the start and after each turn, a single butterfly kick is permitted at any time prior to the first breaststroke kick. Additional butterfly kicks during the breaststroke swim are not permitted and result in a DQ.",
      cite: "SW 7.1",
    },
    {
      question: "How do you appeal a swimming disqualification?",
      answer:
        "Appeals against a Referee's decision are adjudicated under Article 12 of Part One of the World Aquatics Competition Regulations. The Resolution Desk Judges receive initial queries from team leaders, including those regarding disqualifications, and pass them to the Technical Swimming Committee.",
      cite: "SW 2.3.2 / SW 2.17",
    },
    {
      question: "Can a swimmer wear two swimsuits in competition?",
      answer:
        "No. During competition, a swimmer must wear a swimsuit permitted by Article 6 of Part One. The approved swimwear regulations limit competition to a single permitted swimsuit; layering swimsuits is not allowed.",
      cite: "SW 14.1 / Part One Art. 6",
    },
    {
      question: "What happens if a swimmer's body touches the bottom of the pool?",
      answer:
        "Touching the bottom is not automatically a DQ. Standing on the pool bottom is permitted during freestyle events or the freestyle leg of medley events. In other strokes, taking a stride or step from the bottom for propulsion is prohibited and results in disqualification.",
      cite: "SW 10.2.3 / SW 10.2.4",
    },
    {
      question: "Can a relay team be disqualified if one swimmer breaks a rule?",
      answer:
        "Yes. If any swimmer in a relay commits a stroke violation, an early takeoff, or another infraction covered by the relay rules, the entire relay team is disqualified. The swimmer who breached the rule is also individually disqualified.",
      cite: "SW 10.4 / SW 10.5",
    },
    {
      question: "What does a Judge of Stroke or Inspector of Turns watch for?",
      answer:
        "Judges of Stroke ensure that the rules of the designated stroke are followed throughout the race and assist with turns and finishes. Inspectors of Turns are assigned one per lane at each end and ensure compliance with the rules at the start, every turn, and the finish. Both report any breach observed to the Referee.",
      cite: "SW 2.8 / SW 2.9",
    },
  ],
  datePublished: "2026-05-01",
  dateModified: "2026-05-02",
};