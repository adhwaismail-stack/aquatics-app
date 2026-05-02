// Discipline content - single source of truth for the public High Diving page.
// Citations verified against World Aquatics High Diving Competition Regulations
// (in force from February 2026).

import type { DisciplineContent } from "./swimming";

export const highDiving: DisciplineContent = {
  slug: "high-diving",
  name: "High Diving",
  metaTitle: "High Diving Rules - AI Rules Assistant | AquaRef",
  metaDescription:
    "Get instant answers about High Diving rules, failed dives, restarts, and judging. Reviewed by World Aquatics certified Technical Officials. Try free.",
  ogImagePath: "/og-images/high-diving.png",
  rulebookName: "World Aquatics High Diving Competition Regulations",
  rulebookCycle: "In force from February 2026",
  heroEyebrow: "World Aquatics High Diving",
  heroSub:
    "Instant answers from the World Aquatics High Diving Competition Regulations, reviewed by certified Technical Officials.",
  demoPlaceholder: "Ask anything about High Diving rules...",
  suggestedQuestions: [
    "What heights are women's and men's High Diving events from?",
    "How is the score for each dive calculated?",
    "What does a bad landing announcement mean?",
  ],
  sectionHeading: "The ten calls every Judge, coach, and Athlete should know.",
  sectionLead:
    "Every call below is grounded in a specific World Aquatics article. Tap any card to ask the AI for the full ruling.",
  dqReasons: [
    {
      num: "01",
      category: "FAILED DIVE",
      title: "Wrong dive performed (different Number)",
      body: "If the Referee considers that an Athlete has performed a dive of a Number other than that announced (announced correctly per the Statement of Dives), the Referee will declare a failed dive and the Athlete receives 0 points for that dive. Judges who reach the same conclusion independently will also award 0 points.",
      cite: "HD 7.7.5.1 / HD 10.1.7",
    },
    {
      num: "02",
      category: "FAILED DIVE",
      title: "Twist short or over by 90 degrees at entry",
      body: "A dive with a twist that is completed at entry with 90 degrees rotation more or less than announced is a failed dive. The Athlete receives 0 points. Each Judge will independently award 0 points if they consider the twist completed greater or less than announced by 90 degrees or more.",
      cite: "HD 7.7.5.3 / HD 10.5.5",
    },
    {
      num: "03",
      category: "FAILED DIVE",
      title: "Straight Position not held in back/reverse somersault",
      body: "In a dive containing at least one back or reverse somersault in the Straight Position, the Straight Position must be held for at least 270 degrees (three-quarters of a somersault). If it is not, the Referee will declare a failed dive and the Athlete receives 0 points. Judges award 0 points.",
      cite: "HD 7.7.5.2 / HD 10.4.4.1.3",
    },
    {
      num: "04",
      category: "FAILED DIVE",
      title: "Second restart unsuccessful",
      body: "If a third attempt at a dive (second restart) is unsuccessful, the Referee declares a failed dive. This applies to standing, running, or Armstand dives where the Athlete fails to take off after assuming the starting position on the first two attempts.",
      cite: "HD 7.7.1.2 / HD 7.7.5.4",
    },
    {
      num: "05",
      category: "FAILED DIVE",
      title: "Assistance received during the dive",
      body: "Following the Referee's signal to begin the dive, the Athlete must not receive any assistance from any person during the performance. Assistance includes any form - direct, indirect, physical, or verbal. If the Referee considers assistance was received after the starting signal, a failed dive is declared. Assistance between dives is permitted.",
      cite: "HD 7.8",
    },
    {
      num: "06",
      category: "RESTART - 2 POINT DEDUCTION",
      title: "Stop after starting position, before take-off",
      body: "The Referee declares a restart and instructs the Secretaries to deduct 2 points from each Judge's award if, in a running or standing dive, the Athlete stops after assuming the starting position and before take-off; or if, in an Armstand dive, the Athlete moves their hands, returns one or both feet to the platform, or touches the platform with any other body part.",
      cite: "HD 7.7.1.1",
    },
    {
      num: "07",
      category: "2 POINTS MAXIMUM",
      title: "Wrong Position performed",
      body: "If an Athlete performs a dive in a Position other than the one announced (per their Statement of Dives), the Referee declares a 2 points maximum. Any Judge's award above 2 points will be reduced by the Secretaries to 2 points. Judges who independently consider the dive performed in a Position other than announced will also award a maximum of 2 points.",
      cite: "HD 7.7.2 / HD 10.1.4",
    },
    {
      num: "08",
      category: "2 POINTS MAXIMUM - SAFETY",
      title: "Unsafely close to platform / head touch",
      body: "If the Referee considers the Athlete touched the edge of the platform with their head or was otherwise unsafely close to the platform during the dive, the Referee declares a 2 points maximum. If the majority of Judges (3 of 5, or 4 of 7) independently signal that the dive was unsafe, any remaining scores above 2 points are reduced to 2 points by the Secretaries.",
      cite: "HD 7.7.6 / HD 10.4.7",
    },
    {
      num: "09",
      category: "4.5 POINTS MAXIMUM",
      title: "Break of position, flying-action fault, or arms above shoulder at entry",
      body: "The Referee declares a 4.5 points maximum if a dive is performed with a break of Position during the flight; if, in a flying-action dive, the Straight Position is not held for at least 90 degrees; or if the Athlete has one or both arms held above the shoulder line at entry. Any Judge award above 4.5 will be reduced by the Secretaries to 4.5.",
      cite: "HD 7.7.4 / HD 10.4.5.2 / HD 10.5.3",
    },
    {
      num: "10",
      category: "DEDUCTION 0.5-2 POINTS",
      title: "Crow-hop, weak take-off, or twisting on platform",
      body: "Each Judge will reduce their award by between 0.5 and 2 points (per their opinion) if the take-off is not balanced, powerful, or fails to produce appropriate horizontal distance from the platform; if the Athlete crow-hops (one or both feet lift before the take-off) on a standing backwards-facing dive; or if twisting begins while the Athlete is still on the platform.",
      cite: "HD 10.3.4 / HD 10.3.5 / HD 10.3.6",
    },
  ],
  faqs: [
    {
      question: "What heights are women's and men's High Diving events from?",
      answer:
        "Women's High Diving events are from a 20 metre platform. Men's events are from a 27 metre platform. In special environments such as natural sites, a height tolerance of plus or minus 0.5 metres is permitted, subject to prior approval from World Aquatics.",
      cite: "HD 4.3",
    },
    {
      question: "How many dives does each Athlete perform in a High Diving event?",
      answer:
        "Each Athlete performs four dives of four different dive Numbers. Women's events comprise one required dive (max DD 2.6), one intermediate dive (max DD 3.4), and two optional dives of any Degree of Difficulty. Men's events comprise one required dive (max DD 2.8), one intermediate dive (max DD 3.6), and two optional dives. The required and intermediate dives must be from different Groups, and the two optional dives must also be from two different Groups.",
      cite: "HD 5.2 / HD 5.3 / HD 5.4",
    },
    {
      question: "What is the minimum age to compete in senior High Diving events?",
      answer:
        "An Athlete must be at least 18 years old as at 31 December in the year of the start date of the competition to be eligible for a senior High Diving event at a World Aquatics Event. Junior age groups are Age Group A (ages 17-19) and Age Group B (ages 15-16), both performed from a 15 metre platform.",
      cite: "HD 1.3 / HD 12.2 / HD 12.3",
    },
    {
      question: "When must the Statement of Dives be submitted?",
      answer:
        "No later than 24 hours before the start of the event. The Referee will accept a Statement of Dives within 24 hours of the start so long as it is submitted no later than 3 hours before the event, but the Athlete's Federation must pay a fee equivalent to 250 USD for late submission. The Athlete is fully responsible for the accuracy of the Statement, and any inaccuracy is not excused by a Referee or Assistant Referee failing to identify it.",
      cite: "HD 6.3 / HD 6.4.3",
    },
    {
      question: "Can an Athlete change their dives after submitting the Statement of Dives?",
      answer:
        "Yes - the Referee may accept changes to a Statement of Dives up to 1 hour after the end of the final official training session for the relevant event. An Athlete may also list two reserve dives in the Statement and substitute their final dive with a reserve dive up to 5 minutes before the start of the final round, with the Referee's confirmation.",
      cite: "HD 6.2.2 / HD 6.4.1",
    },
    {
      question: "How many Judges are used and how is the score calculated?",
      answer:
        "A Judging Panel uses 7 Judges whenever available; otherwise 5. With 7 Judges, the Secretaries cancel the 2 highest and 2 lowest awards (only 2 of any equal awards are cancelled), leaving 5. With 5 Judges, the highest and lowest are cancelled, leaving 3. The remaining awards are summed, then multiplied by the Degree of Difficulty to give the points scored for that dive.",
      cite: "HD 8.5 / HD 9.1.1",
    },
    {
      question: "What does a bad landing announcement mean?",
      answer:
        "If the Referee considers the Athlete's entry hazardous or that their safety after entry may be at risk, the Referee announces 'bad landing' (on the emergency radio channel if in use). The water safety captain signals the safety team with a whistle or hand signal, and the team will assist the Athlete as needed - including securing them on a spinal board with a stiff neck collar, keeping them on the board until on land, and transferring them to the Field of Play Medical Area. It is highly unlikely the Athlete will be allowed to continue after a bad landing.",
      cite: "HD 16.3",
    },
    {
      question: "When can the Referee pause or stop the competition due to weather?",
      answer:
        "If the wind speed exceeds 40 km per hour, the Referee decides whether the competition continues or is paused until the wind drops to or below 40 km/h. If lightning strikes within 3 km of the High Diving facilities, training or competition must be suspended until the storm is more than 3 km away. The Referee may also permit a restart without points deduction in strong winds (including above 40 km/h).",
      cite: "HD 7.7.1.3 / HD 14.2.13 / HD 14.2.14",
    },
    {
      question: "How is the order of diving decided?",
      answer:
        "The diving order for the first stage of an event is determined by a random draw at the Technical/Team Leaders' Meeting (an electronic drawing system must be used whenever available). At the World Aquatics Championships, the diving order for the final round is in reverse order of the Athletes' points totals at the end of the penultimate round; ties are resolved by a random draw conducted by the Referee.",
      cite: "HD 4.1.5 / HD 4.2.3",
    },
    {
      question: "What are the take-off rules for the different dive Groups?",
      answer:
        "Forward dives may be taken off from either a standing position or a running approach, at the Athlete's discretion. Back, Reverse, and Inward dives must be taken off from a still, standing position from both feet. Armstand dives must be taken off from the Armstand Position - both hands on the front edge of the platform with body and legs straight and vertical in the air, perpendicular to the platform.",
      cite: "HD 10.3.2 / HD 10.2.4",
    },
  ],
  datePublished: "2026-05-02",
  dateModified: "2026-05-02",
};
