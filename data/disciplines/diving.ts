// Discipline content — single source of truth for the public Diving page.
// Citations verified against World Aquatics Diving Competition Regulations
// (in force from February 2026).

import type { DisciplineContent } from "./swimming";

export const diving: DisciplineContent = {
  slug: "diving",
  name: "Diving",
  metaTitle: "Diving Rules — AI Rules Assistant | AquaRef",
  metaDescription:
    "Get instant answers about Diving rules, failed dives, deductions, and judging. Reviewed by World Aquatics certified Technical Officials. Try free.",
  ogImagePath: "/og-images/diving.png",
  rulebookName: "World Aquatics Diving Competition Regulations",
  rulebookCycle: "In force from February 2026",
  heroEyebrow: "World Aquatics Diving",
  heroSub:
    "Instant answers from the World Aquatics Diving Competition Regulations, reviewed by certified Technical Officials.",
  demoPlaceholder: "Ask anything about Diving rules...",
  suggestedQuestions: [
    "What is the difference between a failed dive and a 2-point maximum?",
    "How is the Degree of Difficulty calculated?",
    "When can a dive be restarted without penalty?",
  ],
  sectionHeading: "The ten calls every official, coach, and parent should know.",
  sectionLead:
    "Every call below is grounded in a specific World Aquatics article. Tap any card to ask the AI for the full ruling.",
  dqReasons: [
    {
      num: "01",
      category: "FAILED DIVE",
      title: "Wrong dive performed",
      body: "The Referee declares a failed dive (0 points) when an Athlete performs a dive of a Number other than that announced on their Statement of Dives. A Judge may also independently award 0 points if they consider a different-numbered dive was performed, even if the Referee has not declared it failed.",
      cite: "DV 8.4.6 / DV 10.1.7",
    },
    {
      num: "02",
      category: "FAILED DIVE",
      title: "Refusal or one-minute timeout",
      body: "If an Athlete refuses to perform a dive, or fails to dive within one (1) minute of the Referee's warning for taking too long after the starting signal, the Referee declares it a failed dive and the Athlete receives 0 points.",
      cite: "DV 8.5.5 / DV 8.5.7",
    },
    {
      num: "03",
      category: "FAILED DIVE",
      title: "Springboard double bounce",
      body: "In a springboard dive, an Athlete who jumps from both feet twice consecutively — with both feet leaving the springboard during the approach or on the end — has performed a double bounce. The Referee declares a failed dive (0 points).",
      cite: "DV 8.6.5.2 / DV 10.3.4",
    },
    {
      num: "04",
      category: "FAILED DIVE",
      title: "Twist greater or less than announced by 90°+",
      body: "If the twist in a dive at entry is greater or less than that announced by 90 degrees or more, the Referee declares a failed dive (0 points). A Judge may also independently award 0 points for the same fault.",
      cite: "DV 8.6.5.5 / DV 10.6.6",
    },
    {
      num: "05",
      category: "2-POINT DEDUCTION",
      title: "Restart on a dive",
      body: "A restart occurs when the Athlete stops their take-off after starting it — taking steps and stopping in a running dive, stopping the take-off after the legs have begun to bend in a standing dive, or losing balance during the Armstand setup. The Referee declares the restart and instructs the Secretariat to deduct 2 points from each Judge's award. A second unsuccessful attempt is a failed dive.",
      cite: "DV 8.6.1 / DV 8.6.3 / DV 8.6.5.1",
    },
    {
      num: "06",
      category: "2-POINT MAXIMUM",
      title: "Wrong position performed",
      body: "If the Referee is certain the Athlete performed the correct dive Number but in a Position (Straight, Pike, Tuck, or Free) other than the one announced, the maximum award per Judge is 2 points. Any award above 2 is reduced to 2 by the Referee.",
      cite: "DV 8.4.7 / DV 10.1.4",
    },
    {
      num: "07",
      category: "2-POINT MAXIMUM",
      title: "Unsafe dive",
      body: "If approved visual technology is available and the Referee considers the dive was unsafe — including, but not limited to, the Athlete touching the springboard or platform with their head during flight, or being unsafely close to doing so — the maximum award per Judge is 2 points. Without approved technology, the call is decided by majority vote of the Judges Panel.",
      cite: "DV 10.5.4.1 / DV 10.5.4.2 / DV 12.6",
    },
    {
      num: "08",
      category: "4.5-POINT MAXIMUM",
      title: "Arms in wrong position at entry",
      body: "The maximum award per Judge is 4.5 points if, in a feet-first entry, one or both arms are held above the head, or, in a head-first entry, one or both arms are held below the head. Judges may apply this 4.5 cap independently even when the Referee has not declared it.",
      cite: "DV 8.6.7.1 / DV 8.6.7.2 / DV 10.6.3 / DV 10.6.4",
    },
    {
      num: "09",
      category: "4.5-POINT MAXIMUM",
      title: "Flying action straight position not shown",
      body: "In any dive with a flying action, a Straight Position must be clearly shown from the take-off or after 1 somersault, held for at least 90 degrees (one quarter somersault) in dives up to 1 somersault, or 180 degrees (one half somersault) in dives with more than 1 somersault. If not, the maximum award per Judge is 4.5 points.",
      cite: "DV 8.6.7.3 / DV 10.5.5.1.3",
    },
    {
      num: "10",
      category: "JUDGES' DEDUCTION",
      title: "Synchronisation faults (sync events only)",
      body: "In synchronised diving, each synchronisation Judge deducts between 0.5 and 2 points for any failure of: similarity of starting position, approach, take-off, or height; coordinated timing of movements during flight; similarity of vertical entry angles; comparative distance from the springboard or platform at entry; or coordinated timing of entries. If either Athlete enters the water before the other has left the board, the Referee declares it a failed dive.",
      cite: "DV 11.3 / DV 11.7.3 / DV 11.7.4",
    },
  ],
  faqs: [
    {
      question: "How are Judges' awards calculated into a final dive score?",
      answer:
        "With seven Judges, the two highest and two lowest awards are cancelled; the remaining three are added and multiplied by the dive's Degree of Difficulty. With five Judges, only the highest and lowest are cancelled, leaving three to be added. In synchronised events with eleven Judges, the highest and lowest execution award per Athlete and the highest and lowest synchronisation award are cancelled, then the surviving awards are summed, multiplied by 3/5, and multiplied by the Degree of Difficulty.",
      cite: "DV 9.1.5",
    },
    {
      question: "How many dives does each Athlete perform in an event?",
      answer:
        "Men's individual and synchronised events comprise six dives per Athlete. Women's individual and synchronised events comprise five dives per Athlete. No dive of the same Number may be repeated by an Athlete within their list. In men's platform events, the six dives must come from six different Groups (Forward, Back, Reverse, Inward, Twisting, Armstand); in all other events, dives must come from at least five different Groups.",
      cite: "DV 5.1 / DV 5.2",
    },
    {
      question: "What is the Degree of Difficulty and how is it calculated?",
      answer:
        "The Degree of Difficulty (DD) is calculated by adding five components: A (somersaults) + B (flight position) + C (twists) + D (approach) + E (unnatural entry). Component values for springboard dives are tabled in Appendix 8 and for platform dives in Appendix 10. Reference DDs for tabled dives are listed in Appendix 9 (springboard) and Appendix 11 (platform). Any dive not in those tables but used in competition is assigned a Number, Position, and DD using the same formula.",
      cite: "DV 3.2 / DV 3.3 / DV 3.4",
    },
    {
      question: "When must a Statement of Dives be submitted, and can it be changed?",
      answer:
        "The Statement of Dives must be submitted no later than 24 hours before the start of the first stage of the event. A late submission is accepted up to 3 hours before the event start, but costs the Athlete or team a USD 250 fee. During an event, dives can be changed before any semi-final or final stage if the change form is submitted no later than 30 minutes after the end of the previous stage.",
      cite: "DV 6.6 / DV 6.7",
    },
    {
      question: "How are Judges seated and how many officiate?",
      answer:
        "At the Olympic Games, World Aquatics Championships, and Diving World Cups, individual and team events use seven Judges where available (otherwise five). Synchronised events use eleven Judges where available (otherwise nine), split into five synchronisation Judges and execution Judges for each Athlete. Judges sit on both sides of the pool, with chairs in 3-metre and platform events at least 2 metres above the water level. There must always be at least one reserve Judge available.",
      cite: "DV 7.2 / DV 15.5",
    },
    {
      question: "What does the dive Number actually mean?",
      answer:
        "The first digit identifies the Group: 1 Forward, 2 Back, 3 Reverse, 4 Inward, 5 Twisting, 6 Armstand. For Forward, Back, Reverse, and Inward Groups, the second digit is 1 if the dive includes a flying action and 0 if not, and the third digit gives the number of half somersaults. For Twisting and Armstand Groups (four digits), the second digit is the take-off direction, the third is half somersaults, and the fourth is half twists. The letter at the end is the Position: A Straight, B Pike, C Tuck, D Free.",
      cite: "DV 2",
    },
    {
      question: "What entry depth and pool dimensions are required?",
      answer:
        "Minimum water depth at the plummet is 3.4 m for the 1 m springboard, 3.7 m for the 3 m springboard, and 4.5 m for the 10 m platform; preferred is 5.0 m at every plummet. The full required dimensions for length, width, height, and clearances are listed in Appendix 1 and Appendix 2. Water temperature must be at least 28°C, and lighting at the Olympic Games and World Aquatics Championships must be at least 1500 lux measured 1 metre above the water surface.",
      cite: "DV 15.1 / DV 15.2.11 / DV 15.2.12 / Appendix 2",
    },
    {
      question: "How does Age Group eligibility work for junior diving?",
      answer:
        "Age is determined by the Athlete's age on 31 December in the year of the start date of the event. Age Group A covers 16 to 18, Age Group B covers 14 to 15, and Age Group C covers 12 to 13. To compete at the Olympic Games, World Aquatics Championships, or Diving World Cups, an Athlete must be at least 14 on that 31 December date. The World Aquatics Junior Diving Championships are held for Age Groups A and B.",
      cite: "DV 1.8 / DV 13.1 / DV 13.2 / DV 13.3",
    },
    {
      question: "What happens to a dive's score if a Judge cannot give an award?",
      answer:
        "For individual events, the missing award is replaced by the average of the other Judges' awards (before any cancellation), rounded to the nearest half or whole point. In synchronised events with 11 Judges, a missing execution award is replaced by the average of the other two execution Judges for the same Athlete, and a missing synchronisation award by the average of the other four synchronisation Judges. With 9 Judges, a missing execution award is replaced by the single other execution Judge's award for that Athlete.",
      cite: "DV 9.1.6 / DV 9.1.7",
    },
    {
      question: "When can a synchronised pair re-do a dive without penalty?",
      answer:
        "In exceptional circumstances and only on request from the Athlete or their representative, the Referee may allow a dive to be repeated without a penalty deduction; the request must be made as soon as practicable after the dive. Separately, if there is a strong wind at the time an Athlete is diving, the Referee may give the right to restart the dive without deduction of points. Any other restart caused by the Athlete carries the standard 2-point deduction from each Judge's award.",
      cite: "DV 8.4.5 / DV 8.5.1 / DV 8.6.4 / DV 11.4",
    },
  ],
  datePublished: "2026-05-02",
  dateModified: "2026-05-02",
};
