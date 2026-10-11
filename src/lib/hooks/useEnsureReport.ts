"use client";

import { useEffect } from "react";
import { extractProfile } from "../engine/extract";
import { useAssessment } from "../state/AssessmentProvider";

/** Requests a report whenever the assessment is complete but no current report exists. */
export function useEnsureReport() {
  const a = useAssessment();
  const complete = a.hydrated && extractProfile(a.responses).complete;
  // A report is invalidated (set to null) when answers, removed themes or set-aside pathways
  // change. Rebuild then, but don't retry automatically after an error.
  const needsReport = complete && !a.report && a.reportStatus.state !== "loading" && a.reportStatus.state !== "error";
  const { requestReport } = a;
  useEffect(() => {
    if (needsReport) void requestReport();
  }, [needsReport, requestReport]);
  return { ...a, complete };
}
