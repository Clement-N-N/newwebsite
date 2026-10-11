/**
 * Curated source library. Recommendations may only cite sources listed here.
 *
 * `supports` states the narrow, general point each source is cited for. Keep it modest:
 * it must be something the source says in general terms, never a specific statistic.
 * None of these URLs could be fetched from the build environment (outbound access was
 * blocked), so `checked` is false until a human confirms each link.
 */
export interface Source {
  id: string;
  publisher: string;
  title: string;
  url: string;
  supports: string;
  checked: boolean;
}

export const SOURCES = {
  "hip-home": {
    id: "hip-home",
    publisher: "High Impact Professionals",
    title: "High Impact Professionals",
    url: "https://www.highimpactprofessionals.org/",
    supports: "HIP supports experienced professionals to increase their impact, including through its Talent Directory and Pledge Club.",
    checked: false,
  },
  "hip-iap": {
    id: "hip-iap",
    publisher: "High Impact Professionals",
    title: "Impact Accelerator Program",
    url: "https://www.highimpactprofessionals.org/impact-accelerator",
    supports: "HIP runs a structured programme for professionals planning their next steps toward impact.",
    checked: false,
  },
  "hip-resources": {
    id: "hip-resources",
    publisher: "High Impact Professionals",
    title: "Free resources",
    url: "https://www.highimpactprofessionals.org/free-resources",
    supports: "HIP publishes free career-planning resources for professionals.",
    checked: false,
  },
  "80k-problems": {
    id: "80k-problems",
    publisher: "80,000 Hours",
    title: "Problem profiles",
    url: "https://80000hours.org/problem-profiles/",
    supports: "80,000 Hours compares global problems by scale, neglectedness and tractability, and profiles areas including AI, pandemics, global health and animal welfare.",
    checked: false,
  },
  "80k-guide": {
    id: "80k-guide",
    publisher: "80,000 Hours",
    title: "Career guide",
    url: "https://80000hours.org/career-guide/",
    supports: "Career impact depends on the problem you work on, the approach you take and your personal fit, and it is worth testing options cheaply before committing.",
    checked: false,
  },
  "80k-ops": {
    id: "80k-ops",
    publisher: "80,000 Hours",
    title: "Operations management in high-impact organisations",
    url: "https://80000hours.org/articles/operations-management/",
    supports: "Strong operations staff can multiply the effectiveness of mission-driven organisations, and such roles have often been hard to fill.",
    checked: false,
  },
  givewell: {
    id: "givewell",
    publisher: "GiveWell",
    title: "Top charities",
    url: "https://www.givewell.org/charities/top-charities",
    supports: "Charity evaluators publish in-depth assessments of which global health programmes appear most cost-effective.",
    checked: false,
  },
  gwwc: {
    id: "gwwc",
    publisher: "Giving What We Can",
    title: "Giving What We Can",
    url: "https://www.givingwhatwecan.org/",
    supports: "Giving pledges and evaluator recommendations help people give a share of income to effective organisations.",
    checked: false,
  },
  ace: {
    id: "ace",
    publisher: "Animal Charity Evaluators",
    title: "Animal Charity Evaluators",
    url: "https://animalcharityevaluators.org/",
    supports: "Independent evaluators assess which animal welfare organisations appear most effective.",
    checked: false,
  },
  "probably-good": {
    id: "probably-good",
    publisher: "Probably Good",
    title: "Probably Good career guidance",
    url: "https://probablygood.org/",
    supports: "Independent career guidance covers a range of impactful paths and ways to explore them.",
    checked: false,
  },
} satisfies Record<string, Source>;

export type SourceId = keyof typeof SOURCES;
export const SOURCE_LIST: Source[] = Object.values(SOURCES);
export const isSourceId = (id: string): id is SourceId => id in SOURCES;
