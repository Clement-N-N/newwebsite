import { QUESTION_BY_ID } from "../assessment/questions";
import type { Responses } from "../assessment/types";
import { PATHWAY_BY_ID } from "../knowledge/pathways";
import { isSourceId } from "../knowledge/sources";
import { isAnswered } from "./extract";
import { ReportSchema, type Claim, type EvidenceRef, type Report } from "./schema";

export interface ValidationIssue {
  path: string;
  message: string;
  severity: "error" | "warning";
}

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
}

/** Phrases that overclaim certainty, or numbers that would imply invented measurement. */
const OVERCLAIM_PATTERNS: [RegExp, string][] = [
  [/\d+(\.\d+)?\s?%/, "contains a percentage, which implies a measurement we do not make"],
  [/\b(guarantee[sd]?|definitely|certainly will|perfect (match|fit)|true (purpose|calling)|destined)\b/i, "overstates certainty"],
  [/\b(impact|fit|match) score\b/i, "refers to a score we do not show participants"],
  [/\b\d[\d,]*\s+(lives|people|animals) (saved|helped)\b/i, "contains an impact figure the engine cannot support"],
];

function checkText(text: string, path: string, issues: ValidationIssue[]) {
  for (const [pattern, message] of OVERCLAIM_PATTERNS) {
    if (pattern.test(text)) issues.push({ path, message: `Text ${message}: “${text.slice(0, 80)}…”`, severity: "error" });
  }
}

function checkEvidence(evidence: EvidenceRef[], responses: Responses, path: string, issues: ValidationIssue[], required = true) {
  if (required && evidence.length === 0) {
    issues.push({ path, message: "Personalised claim has no supporting evidence.", severity: "error" });
  }
  evidence.forEach((e, i) => {
    if (!QUESTION_BY_ID[e.questionId]) {
      issues.push({ path: `${path}.evidence[${i}]`, message: `Unknown question “${e.questionId}”.`, severity: "error" });
    } else if (!isAnswered(responses, e.questionId) && e.questionId !== "causes") {
      issues.push({ path: `${path}.evidence[${i}]`, message: `Cites “${e.questionId}”, which was not answered.`, severity: "error" });
    }
  });
}

function checkClaim(claim: Claim, responses: Responses, path: string, issues: ValidationIssue[], requireEvidence = true) {
  checkText(claim.text, path, issues);
  checkEvidence(claim.evidence, responses, path, issues, requireEvidence && claim.sources.length === 0);
  claim.sources.forEach((s) => {
    if (!isSourceId(s)) issues.push({ path, message: `Unknown source “${s}”.`, severity: "error" });
  });
}

/** Structural (schema) and semantic validation: every personal claim must trace back to an answer. */
export function validateReport(report: unknown, responses: Responses): ValidationResult {
  const issues: ValidationIssue[] = [];
  const parsed = ReportSchema.safeParse(report);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      issues.push({ path: issue.path.join("."), message: issue.message, severity: "error" });
    }
    return { valid: false, issues };
  }
  const r: Report = parsed.data;

  r.story.paragraphs.forEach((c, i) => checkClaim(c, responses, `story.paragraphs[${i}]`, issues));
  [...r.strengths, ...r.motivations].forEach((ins, i) => {
    checkText(ins.description, `insights[${i}]`, issues);
    checkEvidence(ins.evidence, responses, `insights[${i}] ${ins.label}`, issues);
  });
  r.unknowns.forEach((c, i) => checkClaim(c, responses, `unknowns[${i}]`, issues));

  const ids = new Set<string>();
  r.pathways.forEach((p, i) => {
    const path = `pathways[${i}] ${p.id}`;
    if (!PATHWAY_BY_ID[p.id]) issues.push({ path, message: "Pathway is not in the curated library.", severity: "error" });
    if (ids.has(p.id)) issues.push({ path, message: "Duplicate pathway.", severity: "error" });
    ids.add(p.id);
    checkClaim(p.why, responses, `${path}.why`, issues);
    p.sources.forEach((s) => {
      if (!isSourceId(s)) issues.push({ path, message: `Unknown source “${s}”.`, severity: "error" });
    });
    if (!p.assumptions.length) issues.push({ path, message: "No assumptions listed.", severity: "warning" });
  });
  if (r.pathways.length < 3) issues.push({ path: "pathways", message: "Fewer than three pathways.", severity: "warning" });

  const nodeIds = new Set(r.map.nodes.map((n) => n.id));
  r.map.edges.forEach((e) => {
    if (!nodeIds.has(e.from) || !nodeIds.has(e.to)) {
      issues.push({ path: `map.edges ${e.id}`, message: "Edge points to a missing node.", severity: "error" });
    }
  });
  r.map.nodes.forEach((n) => {
    if (n.group === "pathway" && !n.hypothesis) {
      issues.push({ path: `map.nodes ${n.id}`, message: "Pathway node must be marked as a hypothesis.", severity: "error" });
    }
    if (n.group !== "pathway" && n.evidence.length === 0) {
      issues.push({ path: `map.nodes ${n.id}`, message: "Theme node has no evidence.", severity: "error" });
    }
  });

  return { valid: !issues.some((i) => i.severity === "error"), issues };
}
