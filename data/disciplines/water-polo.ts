// Discipline content — single source of truth for the public Water Polo page.
// Citations verified against World Aquatics Water Polo Competition Regulations
// (in force from 18 February 2026).

import type { DisciplineContent } from "./swimming";

export const waterPolo: DisciplineContent = {
  slug: "water-polo",
  name: "Water Polo",
  metaTitle: "Water Polo Rules — AI Rules Assistant | AquaRef",
  metaDescription:
    "Get instant answers about Water Polo rules, fouls, exclusions, and penalties. Reviewed by World Aquatics certified Technical Officials. Try free.",
  ogImagePath: "/og-images/water-polo.png",
  rulebookName: "World Aquatics Water Polo Competition Regulations",
  rulebookCycle: "In force from 18 February 2026",
  heroEyebrow: "World Aquatics Water Polo",
  heroSub:
    "Instant answers from the World Aquatics Water Polo Competition Regulations, reviewed by certified Technical Officials.",
  demoPlaceholder: "Ask anything about Water Polo rules...",
  suggestedQuestions: [
    "What is the difference between an exclusion foul and a penalty foul?",
    "How long is a player excluded for violent action?",
    "From where is a penalty throw taken?",
  ],
  sectionHeading: "The ten calls every official, coach, and parent should know.",
  sectionLead:
    "Every call below is grounded in a specific World Aquatics article. Tap any card to ask the AI for the full ruling.",
  dqReasons: [
    {
      num: "01",
      category: "ORDINARY FOUL",
      title: "Pushing off an opponent",
      body: "A Free Throw is awarded to the opposing team when a player pushes or pushes-off from an opponent who is dribbling the ball or who is not holding, lifting, or carrying the ball. The Free Throw is taken from the location of the ball without undue delay.",
      cite: "WP 8.2.7 / WP 12.4",
    },
    {
      num: "02",
      category: "ORDINARY FOUL",
      title: "Two hands on the ball (field player)",
      body: "Except for the goalkeeper inside the defensive 6 Metre Area, a field player commits an Ordinary Foul if they touch the ball with two hands at the same time, intentionally or otherwise. A Free Throw is awarded to the opposing team.",
      cite: "WP 8.2.11.2",
    },
    {
      num: "03",
      category: "ORDINARY FOUL",
      title: "Shot Clock expiry",
      body: "If a team retains possession for longer than 28 seconds of Actual Play without shooting at the opposing team's goal, an Ordinary Foul is awarded and possession passes to the opposing team via Free Throw.",
      cite: "WP 8.3 / WP 9.1",
    },
    {
      num: "04",
      category: "EXCLUSION FOUL",
      title: "Holding, sinking, or pulling back",
      body: "A player commits an Exclusion Foul if they impede an opponent who is not holding the ball, including by holding, sinking, or pulling back the opponent, or by using one or two hands to hold an opponent. The excluded player leaves the field for 18 seconds of Actual Play, or until earlier change of possession, an awarded goal, or a free, goal, or penalty throw to their team.",
      cite: "WP 10.1.4 / WP 10.5.2",
    },
    {
      num: "05",
      category: "EXCLUSION FOUL",
      title: "Tactical foul",
      body: "An Exclusion Foul is committed if a player commits any foul (Ordinary or Exclusion) tactically — meaning with the sole or primary purpose of impeding or stopping the flow of the opposing team's attack. A foul is not tactical if the player intends to validly tackle, block, or defend but in doing so impedes the attack.",
      cite: "WP 10.1.5",
    },
    {
      num: "06",
      category: "EXCLUSION FOUL",
      title: "Misconduct (Red Card)",
      body: "Misconduct includes unacceptable language, aggressive play, refusing referee orders, disrespect toward an official, leaving the pool without permission, or conduct against the Spirit of the Game. The player is shown a Red Card and excluded for the remainder of the match. A substitute may enter at the earliest of: 18 seconds of Actual Play elapsed, a goal awarded, the excluded player's team retaking possession, or that team being awarded a free, goal, or penalty throw.",
      cite: "WP 10.2.2 / WP 10.6",
    },
    {
      num: "07",
      category: "EXCLUSION FOUL",
      title: "Violent Action (Red Card + Penalty)",
      body: "If a player commits Violent Action during play, the player is excluded for the remainder of the match, a Penalty Throw is awarded to the opposing team, and a substitute may replace the excluded player only after 4 minutes of Actual Play have elapsed. Violent Action means making or attempting contact with malicious intent, including kicking and striking.",
      cite: "WP 10.8",
    },
    {
      num: "08",
      category: "PENALTY FOUL",
      title: "Foul inside defensive 6 Metre Area",
      body: "A goalkeeper or field player within their defensive 6 Metre Area commits a Penalty Foul if they commit any foul where, without that action, a goal would in the referee's view have been likely to result. A Penalty Throw is awarded to the opposing team, taken from any point on the 5 Metre Line.",
      cite: "WP 11.1.1 / WP 16.2.1",
    },
    {
      num: "09",
      category: "PENALTY FOUL",
      title: "Two hands or clenched fist (defensive 6m)",
      body: "A field player within their defensive 6 Metre Area commits a Penalty Foul if they block or attempt to block a pass or shot with two hands, or play the ball with a clenched fist. A Penalty Throw is awarded to the opposing team.",
      cite: "WP 11.1.2",
    },
    {
      num: "10",
      category: "PERSONAL FOUL",
      title: "Three Personal Fouls = exclusion for the match",
      body: "A Personal Foul is recorded against any player who commits an Exclusion Foul or a Penalty Foul. If three Personal Fouls are recorded against a player in a match, that player is excluded for the remainder of the match. If the third Personal Foul is a Penalty Foul, a substitute may replace the excluded player immediately.",
      cite: "WP 17.1 / WP 17.3",
    },
  ],
  faqs: [
    {
      question: "How long is a water polo match?",
      answer:
        "Four periods of 8 minutes of Actual Play each. Intervals are 2 minutes between periods 1–2 and 3–4, and 5 minutes between periods 2–3. If scores are level at the end of the fourth period, a Penalty Shootout decides the winner.",
      cite: "WP 4.1 / WP 4.3 / WP 4.4.2",
    },
    {
      question: "How many players on each team?",
      answer:
        "Each team starts with 7 players on the field of play — one goalkeeper and six field players. The Start List must include 7 to 14 players: a maximum of 12 field players and 1 to 2 goalkeepers. A team's minimum to continue a match is 2 players; below that, the team forfeits.",
      cite: "WP 2.2.2 / WP 2.3.1 / WP 2.3.6",
    },
    {
      question: "How long is the Shot Clock and when does it reset?",
      answer:
        "A team has 28 seconds of Actual Play to shoot at the opposing goal. After a shot that rebounds without the opposing team gaining possession, the team that shot has 18 seconds. The clock also resets to 18 seconds after a Penalty Throw not resulting in a change of possession, after a Corner Throw, or after certain Side Line restarts caused by the defensive team.",
      cite: "WP 9.1 / WP 9.8.2 / WP 9.10",
    },
    {
      question: "From where is a Penalty Throw taken?",
      answer:
        "A Penalty Throw is taken from any point on the opponents' 5 Metre Line. Only the thrower and the defending goalkeeper are allowed inside the 6 Metre Area; all other players must be at least 3 metres from the thrower. The goalkeeper must be between the goalposts with some part of their head level with or behind the goal line.",
      cite: "WP 16.2.1 / WP 16.3",
    },
    {
      question: "Can a goal be scored directly from a Free Throw?",
      answer:
        "A Direct Shot goal is allowed from a Free Throw only if the throw is taken behind the offensive 6 Metre Line and taken without delay. From inside the 6 Metre Line, the player who Visibly Puts the Ball Into Play must first move so that both their head and the ball are behind the 6 Metre Line before shooting, or the ball must be played by another player. Direct Shots are also allowed from a Penalty Throw, Goal Throw, or Corner Throw.",
      cite: "WP 7.5.1 / WP 7.5.3 / WP 7.6",
    },
    {
      question: "What is the difference between an Exclusion Foul and a Penalty Foul?",
      answer:
        "An Exclusion Foul removes a player from the field of play for a period — typically 18 seconds of Actual Play, or longer or permanent for Violent Action, Misconduct, or interference with a Penalty Throw — and the opposing team is awarded a Free Throw. A Penalty Foul results in a Penalty Throw to the opposing team from the 5 Metre Line, and is awarded mainly for fouls inside the defensive 6 Metre Area where a goal would likely have resulted.",
      cite: "WP 10 / WP 11 / WP 16",
    },
    {
      question: "When can a substitute enter the field?",
      answer:
        "Substitutions can be made at any time during play via the Exclusion Re-Entry Area — after the leaving player visibly surfaces inside it — or via the Flying Substitution Area, after both players touch hands above the water. Substitutes can also enter from any place during intervals between periods, immediately after a goal, during a timeout, or when replacing a bleeding or injured player.",
      cite: "WP 2.5.2 / WP 2.5.3 / WP 2.5.8",
    },
    {
      question: "How many timeouts does each team get?",
      answer:
        "Each team may request up to 2 timeouts per match. Each timeout is 1 minute. A timeout may only be requested by the team in possession during play, or by the team due to receive possession during a stoppage. Timeouts cannot be called during a VAR Review or between periods. Calling a timeout when not in possession results in a Penalty Throw to the opposing team.",
      cite: "WP 5.1 / WP 5.3 / WP 5.8.1",
    },
    {
      question: "What happens if a team commits a foul inside their own Goal Area?",
      answer:
        "If a defensive player commits a foul while the ball is inside the Goal Area — the rectangle between the goal line and 2 Metre Line, within the goalposts plus 2 metres each side — the resulting Free Throw is taken from the 2 Metre Line at the closest point to where the ball was when the foul occurred, not from inside the Goal Area itself.",
      cite: "WP 12.5.1 / WP 20.4",
    },
    {
      question: "What happens if a Penalty Throw is awarded in the last minute of the match?",
      answer:
        "The Head Coach of the team awarded the Penalty Throw may elect to take a Free Throw on or behind the Halfway Line instead. If they do, the Shot Clock resets to 28 seconds and that team retains possession. The Head Coach must signal this election clearly to the referees without delay.",
      cite: "WP 16.9",
    },
  ],
  datePublished: "2026-05-02",
  dateModified: "2026-05-02",
};