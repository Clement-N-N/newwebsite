import type { Profile, Theme } from "./extract";
import type { Candidate } from "./recommend";
import type { ImpactMap, MapEdge, MapNode } from "./schema";

const refs = (t: Theme) => t.evidence.map(({ questionId, quote }) => ({ questionId, quote }));

const BASIS_TEXT = {
  demonstrated: "Based on things you said you have done.",
  stated: "Based on preferences and interests you told us.",
  both: "Based on both your experience and your stated preferences.",
} as const;

/**
 * Build the Living Impact Map. Nodes are extracted themes; edges are either evidence links
 * (two themes came from the same answer) or hypotheses (a theme is relevant to a candidate pathway).
 */
export function buildMap(profile: Profile, candidates: Candidate[] = []): ImpactMap {
  const themeNodes: [Theme, MapNode["group"]][] = [
    ...profile.capabilities.slice(0, 5).map((t) => [t, "capability"] as [Theme, MapNode["group"]]),
    ...profile.motivations.slice(0, 3).map((t) => [t, "motivation"] as [Theme, MapNode["group"]]),
    ...profile.causes.slice(0, 3).map((t) => [t, "cause"] as [Theme, MapNode["group"]]),
  ];

  const nodes: MapNode[] = themeNodes.map(([t, group]) => ({
    id: t.id,
    group,
    label: t.label,
    confidence: t.confidence,
    hypothesis: false,
    evidence: refs(t),
    description: BASIS_TEXT[t.basis],
  }));

  const edges: MapEdge[] = [];
  const seen = new Set<string>();
  const addEdge = (e: MapEdge) => {
    const key = [e.from, e.to].sort().join("|");
    if (seen.has(key)) return;
    seen.add(key);
    edges.push(e);
  };

  // Evidence links between themes that share an answer.
  for (let i = 0; i < themeNodes.length; i++) {
    for (let j = i + 1; j < themeNodes.length; j++) {
      const [a] = themeNodes[i];
      const [b] = themeNodes[j];
      const shared = a.evidence.find((ea) => b.evidence.some((eb) => eb.questionId === ea.questionId));
      if (shared) {
        addEdge({
          id: `e:${a.id}:${b.id}`,
          from: a.id,
          to: b.id,
          kind: "evidence",
          explanation: `Both come from the same answer: ${shared.quote}.`,
        });
      }
    }
  }

  for (const c of candidates) {
    const id = `pathway:${c.pathway.id}`;
    nodes.push({
      id,
      group: "pathway",
      label: c.pathway.title,
      confidence: "tentative",
      hypothesis: true,
      evidence: [],
      description: "A possible pathway to explore. This is a hypothesis, not a match.",
    });
    const linked: Theme[] = [
      ...c.matchedCapabilities.slice(0, 3),
      ...c.matchedMotivations.slice(0, 2),
      ...(c.matchedCause ? [c.matchedCause] : []),
    ];
    for (const t of linked) {
      if (!nodes.some((n) => n.id === t.id)) continue;
      addEdge({
        id: `h:${t.id}:${id}`,
        from: t.id,
        to: id,
        kind: "hypothesis",
        explanation:
          t.kind === "capability"
            ? `${t.label} is one of the capabilities this work relies on.`
            : t.kind === "cause"
              ? `This pathway works on a problem you chose.`
              : `This work tends to suit people who value ${t.label.toLowerCase()}.`,
      });
    }
  }

  return { nodes, edges };
}
