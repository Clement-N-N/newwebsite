// All copy for the site lives here so it can be edited without touching components.
// Items marked TODO need your own details (the job description and your prototype).

export const site = {
  meta: {
    title: "Program Launch Prototype for High Impact Professionals",
    description:
      "An interactive prototype for the Program Launch Lead / Director role at High Impact Professionals (HIP).",
  },

  candidate: {
    name: "Clement", // TODO: full name
    email: "clement@impact-axis.org",
    links: [
      { label: "LinkedIn", href: "#" }, // TODO
      { label: "CV", href: "#" }, // TODO
    ],
  },

  hero: {
    eyebrow: "Application prototype · Program Launch Lead / Director",
    title: ["From experienced professional", "to high-impact career."],
    lede: "A working sketch of how I would design, test and launch HIP's next program, built for this application.",
    cta: "Scroll to explore",
  },

  context: {
    kicker: "01 · Where HIP is today",
    title: "The foundations are already built. The next step is scale.",
    body: "HIP helps mid-career and senior professionals move into work on the world's most pressing problems. Its programs, resources and Talent Directory already reach thousands of people. This role is about turning that base into new programs that reach more people.",
    // Public figures from HIP's own reporting. Check them before submitting.
    stats: [
      { value: 4500, suffix: "+", label: "professionals in the Talent Directory" },
      { value: 290, suffix: "+", label: "organisations using the directory" },
      { value: 140, suffix: "+", label: "professionals helped into high-impact roles" },
      { value: 6, suffix: " wks", label: "Impact Accelerator Program" },
    ],
  },

  problem: {
    kicker: "02 · The opportunity",
    title: "Many professionals want to switch. Few find a clear way in.",
    // TODO: Replace with the specific gap your prototype addresses.
    points: [
      {
        title: "Intent is high",
        body: "Experienced professionals sign up wanting to use their skills for impact.",
      },
      {
        title: "Paths are unclear",
        body: "The step from interest to a concrete role, project or donation is where most people stall.",
      },
      {
        title: "Capacity is limited",
        body: "High-touch cohorts work, but they do not scale linearly with staff time.",
      },
    ],
  },

  journey: {
    kicker: "03 · The prototype",
    title: "Program journey", // TODO: name your program
    intro: "Keep scrolling to move through each stage of the participant journey.",
    // TODO: Replace with your prototype's real stages.
    stages: [
      {
        step: "Discover",
        title: "Self-guided entry",
        body: "Free online resources and a short diagnostic route each person to the right next step.",
        metric: "Reach",
      },
      {
        step: "Commit",
        title: "Cohort onboarding",
        body: "Small peer cohorts with clear weekly commitments and a facilitator.",
        metric: "Activation",
      },
      {
        step: "Explore",
        title: "Cause and role exploration",
        body: "Structured sprints to test fit through conversations, small projects and skills mapping.",
        metric: "Clarity",
      },
      {
        step: "Act",
        title: "Concrete moves",
        body: "Applications, volunteering, advising or pledges, with introductions through the Talent Directory.",
        metric: "Action",
      },
      {
        step: "Sustain",
        title: "Alumni network",
        body: "Alumni mentor the next cohort, which keeps the program running with fewer staff hours.",
        metric: "Counterfactual impact",
      },
    ],
  },

  roadmap: {
    kicker: "04 · Launch plan",
    title: "My first 90 days",
    // TODO: Align with the responsibilities listed in the job description.
    phases: [
      {
        when: "Days 0–30",
        title: "Listen and baseline",
        items: [
          "Review program data, alumni outcomes and funnel drop-off",
          "Interview staff, alumni and hiring organisations",
          "Agree success metrics and a counterfactual-impact method",
        ],
      },
      {
        when: "Days 31–60",
        title: "Design and pilot",
        items: [
          "Write a lean program spec with explicit assumptions",
          "Run a small pilot cohort and collect weekly feedback",
          "Build the operations behind it: tooling, comms and facilitator guides",
        ],
      },
      {
        when: "Days 61–90",
        title: "Launch and learn",
        items: [
          "Public launch with a recruitment plan and partner organisations",
          "Dashboard for reach, activation, transitions and cost per outcome",
          "Decide whether to scale, change or stop based on the evidence",
        ],
      },
    ],
  },

  about: {
    kicker: "05 · Why me",
    title: "I build programs that launch, and measure whether they worked.",
    // TODO: Your own experience, written as short points.
    points: [
      "TODO: Program you launched from zero, with the outcome",
      "TODO: Evidence of measuring impact and changing course",
      "TODO: Experience with professionals, talent or careers",
    ],
  },

  closing: {
    title: "Let's build the next HIP program together.",
    cta: "Get in touch",
  },
} as const;
