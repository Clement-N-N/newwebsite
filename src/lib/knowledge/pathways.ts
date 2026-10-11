import type { Capability, Cause, Mode, Motivation } from "../assessment/types";
import type { SourceId } from "./sources";

export const LIBRARY_VERSION = "lib-2026.10.1";

/** adjacent: builds on current work. stretch: needs real learning or change. no-switch: alongside a current job. */
export type ChangeLevel = "adjacent" | "stretch" | "no-switch";

export interface Pathway {
  id: string;
  title: string;
  /** null = useful across many causes. */
  cause: Cause | null;
  mode: Mode;
  change: ChangeLevel;
  need: string;
  mechanism: string;
  /** Most important first. */
  capabilities: Capability[];
  motivations: Motivation[];
  /** Pathways that suit people with little room for a switch right now. */
  lowCommitment: boolean;
  /** Draws on any one of the listed capabilities rather than mainly the first. */
  generalist?: boolean;
  learning: "Low" | "Medium" | "High";
  assumptions: string[];
  constraints: string[];
  experiment: { title: string; steps: string[] };
  sources: SourceId[];
  resources: SourceId[];
}

export const PATHWAYS: Pathway[] = [
  {
    id: "ops-impact-org",
    title: "Operations leadership at a high-impact nonprofit",
    cause: null,
    mode: "enabling",
    change: "adjacent",
    need: "Many effective organisations are small and growing fast. Their research or programme staff can only work well if hiring, finance, systems and logistics work.",
    mechanism: "You make an effective organisation able to do more of its core work, and do it more reliably.",
    capabilities: ["operations", "leadership", "people", "finance"],
    motivations: ["systems", "building"],
    lowCommitment: false,
    learning: "Low",
    assumptions: [
      "The organisation's core work is effective, which is worth checking independently.",
      "Your operations experience transfers to a smaller team with fewer specialists.",
    ],
    constraints: ["Nonprofit salaries are often lower than corporate ones.", "Smaller teams mean broader, less specialised roles."],
    experiment: {
      title: "Talk to two operations leads",
      steps: [
        "Shortlist three organisations whose work you find credible.",
        "Ask two of their operations staff for a 20-minute conversation about their hardest current problem.",
        "Write down which of their problems you have already solved somewhere else.",
      ],
    },
    sources: ["80k-ops", "80k-guide"],
    resources: ["hip-iap", "80k-ops"],
  },
  {
    id: "gh-programme-ops",
    title: "Programme delivery in global health",
    cause: "global-health",
    mode: "direct",
    change: "adjacent",
    need: "Highly regarded global health programmes depend on supply chains, partnerships and careful delivery at scale.",
    mechanism: "Better delivery means more of a proven intervention reaches the people it is meant for.",
    capabilities: ["operations", "leadership", "finance", "research"],
    motivations: ["tangible", "evidence", "systems"],
    lowCommitment: false,
    learning: "Medium",
    assumptions: [
      "The programme's evidence base holds up in the places you'd be working.",
      "You are willing to learn the specifics of the health context and its partners.",
    ],
    constraints: ["Some roles involve travel or relocation.", "Pay varies widely between organisations."],
    experiment: {
      title: "Read one evaluation and map your role in it",
      steps: [
        "Read an evaluator's assessment of one top-rated global health programme.",
        "List the three operational steps the programme most depends on.",
        "Mark which of those steps resemble work you have done.",
      ],
    },
    sources: ["givewell", "80k-problems"],
    resources: ["givewell", "hip-resources"],
  },
  {
    id: "research-management",
    title: "Research management and evaluation",
    cause: null,
    mode: "enabling",
    change: "stretch",
    need: "Research teams studying pressing problems need people who can scope questions, manage projects and turn evidence into decisions.",
    mechanism: "You help research teams produce more decision-relevant work, faster.",
    capabilities: ["research", "operations", "communication"],
    motivations: ["knowledge", "evidence", "longterm"],
    lowCommitment: false,
    learning: "Medium",
    assumptions: [
      "Your analytical experience is respected by research teams without a formal research background.",
      "The research you support is actually used by decision-makers.",
    ],
    constraints: ["Some roles prefer subject-matter credentials.", "Feedback loops can be slow."],
    experiment: {
      title: "Critique a research agenda",
      steps: [
        "Pick one research organisation working on a problem you care about.",
        "Read its published research priorities.",
        "Write a one-page note on which question you would prioritise and why, then ask someone there for a reaction.",
      ],
    },
    sources: ["80k-guide", "80k-problems"],
    resources: ["80k-problems", "probably-good"],
  },
  {
    id: "ai-governance",
    title: "AI governance and policy",
    cause: "ai-safety",
    mode: "direct",
    change: "stretch",
    need: "Governments and companies are making decisions about advanced AI with few people who combine policy, institutional and technical understanding.",
    mechanism: "Better-informed rules, standards and institutions may reduce the risks from advanced AI.",
    capabilities: ["policy", "communication", "research", "technology"],
    motivations: ["longterm", "systems", "knowledge"],
    lowCommitment: false,
    learning: "High",
    assumptions: [
      "Your institutional or communication experience transfers to a policy setting.",
      "You can build enough technical understanding of AI to be credible.",
    ],
    constraints: ["The field changes quickly and roles are competitive.", "Impact is hard to observe and slow to appear."],
    experiment: {
      title: "Write a short policy brief",
      steps: [
        "Read one problem profile on risks from advanced AI.",
        "Pick one current policy question and write a one-page brief on it.",
        "Ask someone working in the field to tell you what you missed.",
      ],
    },
    sources: ["80k-problems", "80k-guide"],
    resources: ["80k-problems", "hip-resources"],
  },
  {
    id: "ai-safety-engineering",
    title: "Engineering for AI safety",
    cause: "ai-safety",
    mode: "direct",
    change: "stretch",
    need: "Technical safety research and evaluation teams need strong engineers, not only researchers.",
    mechanism: "Engineering capacity speeds up research and testing that may make advanced AI systems safer.",
    capabilities: ["technology", "research"],
    motivations: ["longterm", "knowledge"],
    lowCommitment: false,
    learning: "High",
    assumptions: [
      "Your engineering skills transfer to research codebases and machine-learning tooling.",
      "The team's research agenda is likely to matter for safety.",
    ],
    constraints: ["Some roles require machine-learning experience.", "The field changes quickly."],
    experiment: {
      title: "Reproduce a small published result",
      steps: [
        "Pick one open-source safety or evaluation project.",
        "Spend four hours running it and fixing one small issue.",
        "Note what you would need to learn to contribute regularly.",
      ],
    },
    sources: ["80k-problems"],
    resources: ["80k-problems", "probably-good"],
  },
  {
    id: "biosecurity",
    title: "Pandemic preparedness and biosecurity",
    cause: "biosecurity",
    mode: "enabling",
    change: "stretch",
    need: "Work to prevent and prepare for pandemics needs people in policy, operations and programme management as well as scientists.",
    mechanism: "Stronger preparedness systems may reduce the chance or severity of catastrophic outbreaks.",
    capabilities: ["policy", "operations", "research", "leadership"],
    motivations: ["longterm", "systems"],
    lowCommitment: false,
    learning: "High",
    assumptions: [
      "Non-scientific roles in this field have real leverage.",
      "You are comfortable working on risks that may never become visible.",
    ],
    constraints: ["Some roles need security clearance or specific citizenship.", "Feedback is slow and indirect."],
    experiment: {
      title: "Map the field in an afternoon",
      steps: [
        "Read one problem profile on pandemic risk.",
        "List five organisations working on it and the kinds of roles they hire.",
        "Identify one role that matches your experience and read its description closely.",
      ],
    },
    sources: ["80k-problems"],
    resources: ["80k-problems"],
  },
  {
    id: "animal-campaigns",
    title: "Strategy and campaigns for farmed animal welfare",
    cause: "animal-welfare",
    mode: "direct",
    change: "stretch",
    need: "Effective animal welfare organisations negotiate with companies and run campaigns that need commercial, strategic and communication skills.",
    mechanism: "Corporate and policy commitments can change conditions for very large numbers of animals.",
    capabilities: ["communication", "finance", "entrepreneurship", "policy"],
    motivations: ["tangible", "systems"],
    lowCommitment: false,
    learning: "Medium",
    assumptions: [
      "Commitments that companies make are followed through.",
      "Your commercial experience is useful when negotiating with companies.",
    ],
    constraints: ["Nonprofit pay levels.", "Campaign work can be emotionally demanding."],
    experiment: {
      title: "Study one campaign",
      steps: [
        "Read an evaluator's review of one recommended animal welfare charity.",
        "Find one corporate campaign it ran and how it was won.",
        "Note which part you could have contributed to.",
      ],
    },
    sources: ["ace", "80k-problems"],
    resources: ["ace"],
  },
  {
    id: "alt-protein",
    title: "Building alternative protein companies",
    cause: "animal-welfare",
    mode: "direct",
    change: "adjacent",
    need: "Companies developing alternatives to factory-farmed products need operators, engineers and finance people from mainstream industry.",
    mechanism: "Competitive alternatives could reduce demand for factory-farmed animal products.",
    capabilities: ["technology", "finance", "entrepreneurship", "operations"],
    motivations: ["building", "tangible"],
    lowCommitment: false,
    learning: "Medium",
    assumptions: [
      "The products can become competitive on price and taste.",
      "A commercial role does more good here than in your current industry.",
    ],
    constraints: ["Start-up risk.", "Sector funding fluctuates."],
    experiment: {
      title: "Find your role in one company",
      steps: [
        "Pick one alternative protein company.",
        "Read its open roles and its biggest stated challenge.",
        "Write down how you would approach that challenge in your first month.",
      ],
    },
    sources: ["80k-problems"],
    resources: ["ace", "80k-problems"],
  },
  {
    id: "tech-impact-org",
    title: "Engineering and data roles at high-impact organisations",
    cause: null,
    mode: "enabling",
    change: "adjacent",
    need: "Research groups, evaluators and nonprofits increasingly depend on software, data pipelines and analysis, but often have few engineers.",
    mechanism: "Good technical infrastructure lets a small, effective team do more of its core work.",
    capabilities: ["technology", "research", "operations"],
    motivations: ["systems", "building", "knowledge"],
    lowCommitment: false,
    learning: "Low",
    assumptions: [
      "The organisation's core work is effective, which is worth checking independently.",
      "You are comfortable with a smaller team and older tooling than you may be used to.",
    ],
    constraints: ["Lower pay than many technology companies.", "Fewer specialist colleagues to learn from."],
    experiment: {
      title: "Look under the hood",
      steps: [
        "Pick two organisations working on a problem you chose.",
        "Find their technical job posts or public code and note the problems they describe.",
        "Ask one of their engineers which problem they would hand you first.",
      ],
    },
    sources: ["80k-guide", "80k-problems"],
    resources: ["probably-good", "hip-iap"],
  },
  {
    id: "grantmaking-finance",
    title: "Finance and grantmaking for impact-focused funders",
    cause: null,
    mode: "enabling",
    change: "adjacent",
    need: "Funders and evaluators need people who can assess organisations, manage money responsibly and judge cost-effectiveness.",
    mechanism: "Better allocation decisions move more money to more effective work.",
    capabilities: ["finance", "research", "policy"],
    motivations: ["evidence", "systems"],
    lowCommitment: false,
    learning: "Medium",
    assumptions: [
      "Your financial judgement carries over to judging nonprofits, where returns are not financial.",
      "The funder's priorities are well chosen.",
    ],
    constraints: ["There are relatively few roles.", "Much of the work is analytical and remote from programmes."],
    experiment: {
      title: "Evaluate one charity yourself",
      steps: [
        "Pick one charity an evaluator recommends.",
        "Read its evaluation and list the three assumptions it depends on most.",
        "Write down which assumption you would investigate further and why.",
      ],
    },
    sources: ["givewell", "80k-guide"],
    resources: ["givewell", "gwwc"],
  },
  {
    id: "found-charity",
    title: "Founding a new high-impact organisation",
    cause: null,
    mode: "direct",
    change: "stretch",
    need: "Some promising interventions have no organisation delivering them yet.",
    mechanism: "A new organisation can bring a neglected, evidence-backed intervention to people who would otherwise go without.",
    capabilities: ["entrepreneurship", "leadership", "operations", "finance"],
    motivations: ["building", "evidence"],
    lowCommitment: false,
    learning: "High",
    assumptions: [
      "The intervention you pick is supported by evidence and genuinely neglected.",
      "You can secure early funding and a co-founder.",
    ],
    constraints: ["High personal and financial risk.", "Usually a full-time commitment."],
    experiment: {
      title: "Stress-test one idea",
      steps: [
        "Pick one intervention you think is neglected.",
        "Spend two hours looking for the strongest evidence for and against it.",
        "Write down what would have to be true for a new organisation to be worth starting.",
      ],
    },
    sources: ["80k-guide"],
    resources: ["80k-guide", "hip-iap"],
  },
  {
    id: "talent-people",
    title: "Talent and people operations for impact-focused organisations",
    cause: null,
    mode: "enabling",
    change: "adjacent",
    need: "Growing nonprofits often struggle to hire, develop and keep good staff.",
    mechanism: "Good people practices help effective organisations find and keep the people they need.",
    capabilities: ["people", "leadership", "operations"],
    motivations: ["building", "systems"],
    lowCommitment: false,
    learning: "Low",
    assumptions: ["Hiring and retention are a real bottleneck for the organisation you choose."],
    constraints: ["Smaller HR teams mean broad roles.", "Nonprofit salary levels."],
    experiment: {
      title: "Review one hiring round",
      steps: [
        "Find one high-impact organisation that is hiring.",
        "Read its job description as if you were its head of talent.",
        "Write three changes you'd make, and offer them to the hiring manager.",
      ],
    },
    sources: ["80k-ops"],
    resources: ["hip-home", "80k-ops"],
  },
  {
    id: "comms-impact",
    title: "Communications for an evidence-focused organisation",
    cause: null,
    mode: "enabling",
    change: "adjacent",
    need: "Effective organisations often struggle to explain their work to funders, partners and the public.",
    mechanism: "Clear communication brings more funding, talent and support to effective work.",
    capabilities: ["communication", "policy", "research"],
    motivations: ["systems", "evidence"],
    lowCommitment: false,
    learning: "Low",
    assumptions: ["Communication is a real constraint on the organisation's growth."],
    constraints: ["Smaller teams and budgets than you may be used to."],
    experiment: {
      title: "Rewrite one page",
      steps: [
        "Pick one effective organisation's website or report.",
        "Rewrite its main explanation of its work for a sceptical professional reader.",
        "Share it with someone on their team and ask what you missed.",
      ],
    },
    sources: ["80k-guide"],
    resources: ["hip-resources"],
  },
  {
    id: "climate-policy",
    title: "Climate policy and innovation",
    cause: "climate",
    mode: "direct",
    change: "stretch",
    need: "Neglected areas of climate work, such as policy and early-stage technology, need professionals from finance, engineering and government.",
    mechanism: "Policy and innovation can change emissions at a scale that individual action cannot.",
    capabilities: ["policy", "technology", "finance", "research"],
    motivations: ["longterm", "systems"],
    lowCommitment: false,
    learning: "Medium",
    assumptions: ["You focus on the more neglected parts of climate work, not the most crowded."],
    constraints: ["Competitive roles in popular organisations."],
    experiment: {
      title: "Find the neglected corner",
      steps: [
        "Read a problem profile on climate change.",
        "List two climate approaches it describes as relatively neglected.",
        "Find one organisation working on each and note one role you could apply your experience to.",
      ],
    },
    sources: ["80k-problems"],
    resources: ["80k-problems"],
  },
  {
    id: "skilled-advising",
    title: "Skilled volunteering and advising",
    cause: null,
    mode: "enabling",
    change: "no-switch",
    need: "Many effective organisations need specialist expertise they cannot afford to hire full time.",
    mechanism: "A few hours of the right expertise can unblock a small organisation's work.",
    capabilities: ["operations", "finance", "technology", "people", "communication", "leadership"],
    motivations: ["systems", "building", "tangible"],
    lowCommitment: true,
    generalist: true,
    learning: "Low",
    assumptions: [
      "The organisation has a clearly defined problem your skills address.",
      "You can protect a few hours a month consistently.",
    ],
    constraints: ["Advice without follow-through has limited value.", "Needs reliable time alongside your job."],
    experiment: {
      title: "Offer one specific hour",
      steps: [
        "Write a two-line description of a problem you can help an organisation solve.",
        "Share it with one organisation you respect, or add it to a talent directory profile.",
        "Hold one 60-minute session and note what was actually useful.",
      ],
    },
    sources: ["hip-home", "80k-guide"],
    resources: ["hip-home", "hip-resources"],
  },
  {
    id: "effective-giving",
    title: "Effective giving with a pledge",
    cause: null,
    mode: "resources",
    change: "no-switch",
    need: "Effective organisations are often limited by funding.",
    mechanism: "Directing part of your income to highly effective organisations funds work you could not do yourself.",
    capabilities: ["finance"],
    motivations: ["evidence", "tangible"],
    lowCommitment: true,
    learning: "Low",
    assumptions: [
      "Your chosen organisations are as effective as their evaluations suggest.",
      "Giving fits your financial commitments.",
    ],
    constraints: ["Requires financial headroom.", "The money you give stays limited by your income."],
    experiment: {
      title: "Make a giving plan",
      steps: [
        "Read one evaluator's top recommendations.",
        "Decide on a percentage you could sustain without strain.",
        "Write down where it would go and when you'll review it.",
      ],
    },
    sources: ["gwwc", "givewell", "hip-home"],
    resources: ["gwwc", "hip-home"],
  },
  {
    id: "workplace-influence",
    title: "Influence from inside your current organisation",
    cause: null,
    mode: "resources",
    change: "no-switch",
    need: "Large organisations control budgets, products, supply chains and policies that affect pressing problems.",
    mechanism: "Changing what a large organisation does can matter more than what one person does alone.",
    capabilities: ["leadership", "communication", "policy", "operations"],
    motivations: ["systems", "tangible"],
    lowCommitment: true,
    generalist: true,
    learning: "Low",
    assumptions: [
      "Your organisation has a decision that meaningfully affects a pressing problem.",
      "You have, or can build, enough influence to change that decision.",
    ],
    constraints: ["Organisational politics.", "Progress can be slow."],
    experiment: {
      title: "Find one lever",
      steps: [
        "List three decisions your organisation makes that affect a problem you care about.",
        "Pick the one where you have the most influence.",
        "Have one conversation with the person who owns that decision.",
      ],
    },
    sources: ["80k-guide"],
    resources: ["80k-guide", "hip-resources"],
  },
];

export const PATHWAY_BY_ID = Object.fromEntries(PATHWAYS.map((p) => [p.id, p])) as Record<string, Pathway>;
