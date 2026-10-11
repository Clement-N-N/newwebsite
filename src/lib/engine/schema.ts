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

export const InsightSchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string(),
  confidence: ConfidenceSchema,
  basis: BasisSchema,
  evidence: z.array(EvidenceRefSchema).min(1),
});

export const FitSchema = z.object({
  skill: z.enum(["Strong", "Moderate", "Developing"]),
  feasibility: z.enum(["Higher", "Medium", "Lower"]),
  motivation: z.enum(["Strong", "Some", "Unclear"]),
  learning: z.enum(["Low", "Medium", "High"]),
  testability: z.enum(["Easy to test", "Takes more set-up"]),
});

export const ExperimentSchema = z.object({
  pathwayId: z.string(),
  title: z.string(),
  steps: z.array(z.string()).min(1),
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
  story: z.object({ headline: z.string(), paragraphs: z.array(ClaimSchema).min(1) }),
  strengths: z.array(InsightSchema).min(1).max(5),
  motivations: z.array(InsightSchema),
  causes: z.array(InsightSchema),
  constraints: z.array(InsightSchema),
  map: ImpactMapSchema,
  pathways: z.array(PathwayRecSchema).min(1).max(3),
  unknowns: z.array(ClaimSchema).min(1),
  experiment: ExperimentSchema,
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
