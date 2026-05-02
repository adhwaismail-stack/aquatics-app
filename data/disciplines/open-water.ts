// Discipline content — single source of truth for the public Open Water page.
// Citations verified against World Aquatics Open Water Swimming Competition Regulations
// (in force from February 2026).

import type { DisciplineContent } from "./swimming";

export const openWater: DisciplineContent = {
  slug: "open-water",
  name: "Open Water",
  metaTitle: "Open Water Swimming Rules — AI Rules Assistant | AquaRef",
  metaDescription:
    "Get instant answers about Open Water Swimming rules, course infractions, wetsuit requirements, and finish funnel calls. Reviewed by World Aquatics certified Technical Officials. Try free.",
  ogImagePath: "/og-images/open-water.png",
  rulebookName: "World Aquatics Open Water Swimming Competition Regulations",
  rulebookCycle: "In force from February 2026",
  heroEyebrow: "World Aquatics Open Water Swimming",
  heroSub:
    "Instant answers from the World Aquatics Open Water Swimming Competition Regulations, reviewed by certified Technical Officials.",
  demoPlaceholder: "Ask anything about Open Water Swimming rules...",
  suggestedQuestions: [
    "What happens if an Athlete misses a turn buoy?",
    "When is a wetsuit mandatory in Open Water?",
    "What is the time limit to finish a 10km race?",
  ],
  sectionHeading: "The ten calls every official, coach, and parent should know.",
  sectionLead:
    "Every call below is grounded in a specific World Aquatics article. Tap any card to ask the AI for the full ruling.",
  dqReasons: [
    {
      num: "01",
      category: "COURSE",
      title: "Missing a turn buoy",
      body: "An Athlete must follow the course and swim the course line around all turn buoys in the correct order and direction. If an Athlete misses a turn buoy, they may return to swim the correct course only if all four conditions are met: (1) it is safe to do so, (2) the action does not interfere with any other Athlete, (3) the correction is made before reaching the next turn buoy, and (4) no unfair advantage has been gained. If any condition is not satisfied, the Athlete is disqualified.",
      cite: "OW 4.1.2 / OW 4.1.2.2",
    },
    {
      num: "02",
      category: "COURSE",
      title: "Exceeding course boundaries",
      body: "'Course boundaries' includes the outside limits of the course, the safety boundaries, and swimming through any Intermediate Gate (if used) and the finish funnel. Any Athlete who exceeds or does not respect the course boundaries may be disqualified from the event.",
      cite: "OW 4.1.2.1",
    },
    {
      num: "03",
      category: "CONDUCT",
      title: "Walking, running, or jumping during the race",
      body: "During the race, an Athlete must swim the course and must not walk, run, or jump. Standing on the ground below the water is permitted, but using the bottom to walk, run, or push forward is a disqualifiable offence.",
      cite: "OW 4.1.3 / OW 4.1.4",
    },
    {
      num: "04",
      category: "UNSPORTING CONDUCT",
      title: "Intentional pushing, pulling, or holding",
      body: "Intentional pushing, pulling, or holding by an Athlete of another Athlete during the competition is defined as Unsporting Conduct. If the Chief Referee or a Referee determines such conduct has occurred, the Athlete is immediately disqualified from the event. A red flag is raised and a card bearing the Athlete's number is displayed.",
      cite: "OW 4.2.4.2 / OW 4.2.2.6",
    },
    {
      num: "05",
      category: "PACING",
      title: "Slip streaming an On-water Craft",
      body: "The pacing or slip streaming of an Athlete by any On-water Craft is not permitted. Race Judges will instruct any Athlete taking unfair advantage in this way to move clear. If the Athlete continues to breach the rule after being instructed, a yellow flag is issued. A second infringement during the race results in disqualification.",
      cite: "OW 4.1.6 / OW 4.1.7 / OW 4.1.7.1",
    },
    {
      num: "06",
      category: "SWIMWEAR",
      title: "Wetsuit required below 18.0°C",
      body: "When the water temperature is below 18.0°C, an Athlete must wear a wetsuit, and only one swimsuit may be worn underneath. Between 18.0°C and 20.0°C, the Chief Referee may require all Athletes to compete in wetsuits on the recommendation of the Safety Officer and Medical Officer if conditions are deemed hazardous. The race is not held below 16.0°C or above 31.0°C.",
      cite: "OW 10.2 / OW 10.3 / OW 12.2.3",
    },
    {
      num: "07",
      category: "TRANSPONDER",
      title: "Finishing without at least one transponder",
      body: "Each Athlete must start the race with two microchip transponders, one on each wrist. If an Athlete loses one during the race, replacement is only obligatory if both have been lost. Any Athlete who does not finish the race with at least one transponder still on their wrist is disqualified from the event.",
      cite: "OW 4.1.8 / OW 4.1.9",
    },
    {
      num: "08",
      category: "FEEDING",
      title: "Carrying gels or packaged nutrition",
      body: "Athletes must not carry gels or any other packaged nutrition during the event, including inside their swimwear. Sustenance must be received at a feeding platform or from an Escort Craft, in a biodegradable container, by hand or by feeding pole. Per Appendix 7, this infraction results in a yellow flag warning.",
      cite: "OW 4.4.1 / OW 4.4.2 / OW Appendix 7",
    },
    {
      num: "09",
      category: "FINISH FUNNEL",
      title: "Pushing another Athlete into the buoys",
      body: "Any intentional physical action by an Athlete that pushes another Athlete against the buoys or markers defining the finish funnel is Unsporting Conduct, and results in immediate disqualification. The same applies to any action that impedes or prevents another Athlete from touching the finish plate.",
      cite: "OW 4.2.4.3 / OW 4.2.4.4",
    },
    {
      num: "10",
      category: "FINISH",
      title: "Not touching the finish plate",
      body: "If a finish plate is used, each Athlete must finish the race by touching it. An Athlete who does not touch the finish plate is disqualified. If no finish plate is used, placing is determined with reference to the first part of each Athlete's body to cross the finish line.",
      cite: "OW 5.3 / OW 5.4",
    },
  ],
  faqs: [
    {
      question: "How long are the Open Water races?",
      answer:
        "At the Olympic Games, the program is 10km for both men and women. At the World Aquatics Championships: 10km, 5km, the 3km Knockout Sprint, and the Mixed Team 4×1500m Relay. At the World Aquatics Junior Open Water Swimming Championships: 5km (14–15 age group), 7.5km (16–17), 10km (18–19), plus the 3km Knockout Sprint and relay events.",
      cite: "OW 1.3 / OW 1.4 / OW 1.5",
    },
    {
      question: "When is a wetsuit mandatory?",
      answer:
        "Below 18.0°C water temperature, a wetsuit is mandatory. Between 18.0°C and 20.0°C, the Chief Referee may require wetsuits if conditions are deemed hazardous, on the recommendation of the Safety Officer and Medical Officer. The minimum water temperature for a race to be held is 16.0°C; the maximum is 31.0°C.",
      cite: "OW 10.2 / OW 10.3 / OW 12.2.3",
    },
    {
      question: "What is the time limit to finish a race?",
      answer:
        "After the first-placed Athlete finishes, remaining Athletes have 10 minutes per 5km (or part thereof) of the total course distance, up to a maximum of 60 minutes, to complete the course. Any Athlete who does not finish within the time limit is recorded as Over the Time Limit (OTL) and removed from the water — unless the Chief Referee permits them to complete the course, in which case they are not eligible for points, rankings, or prizes.",
      cite: "OW 4.5.1 / OW 4.5.2",
    },
    {
      question: "How does the 3km Knockout Sprint work?",
      answer:
        "The event has three rounds. Round One is 1500m and the top 10 of each heat advance. Round Two is 1000m, swum as semi-finals, with the top 10 of each heat advancing. Round Three is the Final, 500m, swum as a single race. There is a minimum 8-minute interval between Round One and Round Two, and 5 minutes before Round Three.",
      cite: "OW 7.2 / OW 7.3 / OW 7.4 / OW 7.5",
    },
    {
      question: "What happens if an Athlete misses a turn buoy?",
      answer:
        "The Athlete may return to swim the correct course, but only if all four conditions are met: (1) it is safe to do so, (2) the correction does not interfere with any other Athlete, (3) the correction is made before reaching the next turn buoy, and (4) no unfair advantage has been gained. If any condition is not satisfied, the Athlete is disqualified.",
      cite: "OW 4.1.2.2",
    },
    {
      question: "Can a coach give instructions during the race?",
      answer:
        "Yes. Coaching and the giving of instructions to an Athlete by an athlete support person on the feeding platform or in the Escort Craft is permitted. The use of a whistle, however, is not allowed. Sustenance must not be thrown to the Athlete, and any feed must be received in a biodegradable container by hand or by feeding pole.",
      cite: "OW 4.4.7 / OW 4.4.3 / OW 4.4.1",
    },
    {
      question: "What is the difference between a yellow flag and a red flag?",
      answer:
        "A first rule breach during a race results in a yellow card and yellow flag, with a card bearing the Athlete's number displayed — this is a formal warning. A second breach results in a red card and red flag, and the Athlete is disqualified, either immediately or at the end of the race at the Chief Referee's discretion. Unsporting Conduct results in immediate red card disqualification without a prior yellow.",
      cite: "OW 4.2.2.3 / OW 4.2.2.5 / OW 4.2.2.6",
    },
    {
      question: "How do relay changeovers work in the Mixed Team Event?",
      answer:
        "Each team has 4 Athletes (2 men, 2 women), and each swims 1.5km. If a relay changeover platform is used, the next Athlete's feet must remain in contact with the platform until the incoming Athlete touches it; the next Athlete then dives in. If no platform is used, the changeover takes place in the water, with hand or forearm contact between the two Athletes above the water before the next Athlete may begin.",
      cite: "OW 6.1.1 / OW 6.1.4 / OW 6.1.7.4 / OW 6.1.7.5",
    },
    {
      question: "How are Athletes identified during the race?",
      answer:
        "Each Athlete wears their race number on both shoulder blades (100mm × 60mm horizontal), on each arm (100mm × 60mm vertical), and on the hands horizontally to the base of the wrist. The numerical digits must be in a very dark or very light colour that contrasts with the underlying surface (skin, wetsuit). Marker pens are permitted to mark numbers on the hands or full-body wetsuit.",
      cite: "OW 11.1 / OW 11.1.4",
    },
    {
      question: "Can an Athlete wear a watch or jewellery during the race?",
      answer:
        "No. At the start and during the race, Athletes must have trimmed fingernails and toenails, and must not wear any jewellery, including watches. The Clerk of the Course checks this before the start. Any technology or wearable an Athlete wishes to use must be declared in the first call room and listed on the World Aquatics current list of approved wearables — failure to declare results in disqualification.",
      cite: "OW 10.5 / OW 10.8.1 / OW 10.8.3 / OW 2.19.1",
    },
  ],
  datePublished: "2026-05-02",
  dateModified: "2026-05-02",
};