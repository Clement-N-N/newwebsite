"use client";

import { useMemo } from "react";
import { extractProfile } from "../engine/extract";
import { buildMap } from "../engine/map";
import { selectPathways } from "../engine/recommend";
import { useAssessment } from "../state/AssessmentProvider";

/** Pathway hypotheses only appear on the map once there is enough evidence to suggest them. */
const PATHWAY_THRESHOLD = 11;

export function useLiveMap() {
  const { responses, rejectedThemes, rejectedPathways } = useAssessment();
  return useMemo(() => {
    const profile = extractProfile(responses, rejectedThemes);
    const candidates =
      profile.answered >= PATHWAY_THRESHOLD
        ? selectPathways(
            profile,
            rejectedPathways.map((p) => p.id),
          ).map((s) => s.candidate)
        : [];
    return { profile, map: buildMap(profile, candidates) };
  }, [responses, rejectedThemes, rejectedPathways]);
}
