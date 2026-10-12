import { z } from "zod";

export const EvidenceRefSchema = z.object({
  questionId: z.string(),
  quote: z.string(),
});

export const ClaimSchema = z.object({
  text: z.string().min(1),
  evidence: z.array(EvidenceRefSchema),
  sources: z.array(z.string()).default([]),
});

const ConfidenceSchema = z.enum(["strong", "moderate", "tentative"]);
const BasisSchema = z.enum(["demonstrated", "stated", "both"]);

/** Impact Compass §6: explicit evidence, reasonable inference, or unknown. */
export const EvidenceTypeSchema = z.enum(["Explicit evidence", "Reasonable inference"]);

export const InsightSchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string(),
  /** Why this might be useful in a different context (strengths only). */
  transfer: z.string().optional(),
  evidenceType: EvidenceTypeSchema.optional(),
  confidence: ConfidenceSchema,
  basis: BasisSchema,
  evidence: z.array(EvidenceRefSchema).min(1),
});

const RatingSchema = z.object({ score: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]), short: z.string(), label: z.string() });

export const FitSchema = z.object({
  skill: RatingSchema,
  motivation: RatingSchema,
  feasibility: RatingSchema,
  evidence: z.enum(["Low", "Moderate", "High"]),
  learning: z.enum(["Low", "Medium", "High"]),
  testability: z.enum(["Easy to test", "Takes more set-up"]),
  priority: z.enum(["Explore now", "Worth investigating", "Longer-term possibility", "Not currently practical"]),
  priorityReason: z.string(),
});

export const ExperimentSchema = z.object({
  pathwayId: z.string(),
  title: z.string(),
  hypothesis: z.string().min(1),
  steps: z.array(z.string()).min(1),
  effort: z.string().min(1),
  evidence: z.string().min(1),
  decisionRule: z.string().min(1),
});

export const PathwayRecSchema = z.object({
  id: z.string(),
  role: z.enum(["adjacent", "stretch", "no-switch"]),
  roleLabel: z.string(),
  title: z.string(),
  cause: z.string().nullable(),
  need: z.string(),
  mechanism: z.string(),
  why: ClaimSchema,
  capabilities: z.array(z.string()),
  fit: FitSchema,
  assumptions: z.array(z.string()),
  uncertainties: z.array(z.string()),
  constraints: z.array(z.string()),
  counterfactual: z.string(),
  requirements: z.string(),
  reviseIf: z.string(),
  experiment: ExperimentSchema,
  sources: z.array(z.string()).min(1),
  resources: z.array(z.string()),
});

export const MapNodeSchema = z.object({
  id: z.string(),
  group: z.enum(["capability", "motivation", "cause", "pathway"]),
  label: z.string(),
  confidence: ConfidenceSchema,
  hypothesis: z.boolean(),
  evidence: z.array(EvidenceRefSchema),
  description: z.string(),
});

export const MapEdgeSchema = z.object({
  id: z.string(),
  from: z.string(),
  to: z.string(),
  kind: z.enum(["evidence", "hypothesis"]),
  explanation: z.string(),
});

export const ImpactMapSchema = z.object({
  nodes: z.array(MapNodeSchema),
  edges: z.array(MapEdgeSchema),
});

export const ReportSchema = z.object({
  meta: z.object({
    generatedAt: z.string(),
    questionBankVersion: z.string(),
    engineVersion: z.string(),
    libraryVersion: z.string(),
    promptVersion: z.string().nullable(),
    narrative: z.enum(["rules", "ai"]),
    sample: z.boolean(),
  }),
  /** §16.1 Your Impact Discovery: a headline grounded in demonstrated experience. */
  story: z.object({ headline: z.string(), discovery: z.string(), paragraphs: z.array(ClaimSchema).min(1) }),
  strengths: z.array(InsightSchema).min(1).max(5),
  motivations: z.array(InsightSchema),
  causes: z.array(InsightSchema),
  constraints: z.array(InsightSchema),
  map: ImpactMapSchema,
  pathways: z.array(PathwayRecSchema).min(1).max(3),
  /** §16.5 Important trade-offs between the pathways. */
  tradeoffs: z.array(z.object({ dimension: z.string(), text: z.string() })),
  /** §16.6 Two or three unknowns most worth resolving. */
  unknowns: z.array(ClaimSchema).min(1).max(3),
  experiment: ExperimentSchema,
  /** §14 Seven-day plan, or a single weekly action when time is tight. */
  plan: z.object({ mode: z.enum(["daily", "weekly"]), steps: z.array(z.object({ when: z.string(), task: z.string() })).min(1) }),
  /** §16.8 One foundational lesson and an optional follow-on resource. */
  learning: z.object({ lesson: z.string(), why: z.string(), href: z.string(), followOn: z.string().nullable() }),
  /** §16.9 A reflective question specific to this profile. */
  reflectiveQuestion: z.string().min(1),
  nextSteps: z.array(z.object({ title: z.string(), description: z.string(), sourceId: z.string() })),
});

export type EvidenceRef = z.infer<typeof EvidenceRefSchema>;
export type Claim = z.infer<typeof ClaimSchema>;
export type Insight = z.infer<typeof InsightSchema>;
export type PathwayRec = z.infer<typeof PathwayRecSchema>;
export type MapNode = z.infer<typeof MapNodeSchema>;
export type MapEdge = z.infer<typeof MapEdgeSchema>;
export type ImpactMap = z.infer<typeof ImpactMapSchema>;
export type Report = z.infer<typeof ReportSchema>;
export type Experiment = z.infer<typeof ExperimentSchema>;
