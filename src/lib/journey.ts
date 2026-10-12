/**
 * The seven chapters of Impact Career Compass. Each one teaches a single idea, so the assessment
 * doubles as the first part of a learning journey.
 */
export interface Chapter {
  id: "discover" | "crossroads" | "map" | "reveal" | "pathways" | "passport" | "learn";
  n: number;
  href: string;
  title: string;
  stage: string;
  concept: string;
  lesson: string;
  objective: string;
  time: string;
}

export const CHAPTERS: Chapter[] = [
  {
    id: "discover",
    n: 1,
    href: "/discover",
    title: "What you bring",
    stage: "Swipe Discovery",
    concept: "Career capital",
    lesson:
      "Years of work leave you with skills, knowledge and relationships. They are assets, and many of them can be redeployed to new problems more easily than people expect.",
    objective: "Notice which strengths show up again and again in your answers.",
    time: "4–5 minutes",
  },
  {
    id: "crossroads",
    n: 2,
    href: "/crossroads",
    title: "What you'd weigh",
    stage: "Career Crossroads",
    concept: "Trade-offs are information",
    lesson:
      "Money, time and family are real constraints, not signs of weak commitment. Naming them early lets you design options that actually fit your life.",
    objective: "See which factors shape your decisions, without judgement.",
    time: "3–4 minutes",
  },
  {
    id: "map",
    n: 3,
    href: "/impact-map",
    title: "How it connects",
    stage: "Living Impact Map",
    concept: "Personal fit",
    lesson:
      "How well you fit a role matters as much as how important the role is. Fit is best judged from evidence of what you've done, not from self-image.",
    objective: "Check our reading of you, and correct anything that's wrong.",
    time: "2 minutes",
  },
  {
    id: "reveal",
    n: 4,
    href: "/reveal",
    title: "What it could mean",
    stage: "Your results",
    concept: "Hypotheses, not answers",
    lesson: "No quiz can tell you your purpose. The useful output is a few well-reasoned hypotheses you can test cheaply.",
    objective: "Understand why each possibility was suggested.",
    time: "3 minutes",
  },
  {
    id: "pathways",
    n: 5,
    href: "/pathways",
    title: "Where you could go",
    stage: "Pathways",
    concept: "Three routes to impact",
    lesson:
      "You can work directly on a problem, strengthen the organisations that do, or contribute influence and resources from where you are. None is automatically best.",
    objective: "Compare three routes and choose one to test.",
    time: "3–5 minutes",
  },
  {
    id: "passport",
    n: 6,
    href: "/passport",
    title: "What you take with you",
    stage: "Impact Passport",
    concept: "Small, deliberate tests",
    lesson: "A week-long experiment beats a year of deliberation. Keep a record so you can see what you learn.",
    objective: "Leave with a plan for the next seven days.",
    time: "2 minutes",
  },
  {
    id: "learn",
    n: 7,
    href: "/learn",
    title: "How to judge a path",
    stage: "Foundations",
    concept: "Scale, neglectedness, tractability",
    lesson:
      "Some problems are bigger, more neglected or more solvable than others. Learning to ask those three questions is the core skill of choosing where to work.",
    objective: "Practise judging a problem, then plan your tests.",
    time: "10 minutes",
  },
];

export const CHAPTER_BY_ID = Object.fromEntries(CHAPTERS.map((c) => [c.id, c])) as Record<Chapter["id"], Chapter>;

export function chapterForPath(pathname: string): Chapter | undefined {
  return CHAPTERS.find((c) => pathname === c.href || pathname.startsWith(`${c.href}/`));
}
