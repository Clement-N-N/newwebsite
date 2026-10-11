"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { QUESTION_BY_ID } from "../assessment/questions";
import type { Answer, Responses } from "../assessment/types";
import { track } from "../analytics";
import type { NarrativeStatus } from "../ai/narrative";
import { buildReport } from "../engine/report";
import type { Report } from "../engine/schema";
import type { ValidationResult } from "../engine/validate";
import { SAMPLE_BY_ID } from "../fixtures/profiles";

const STORAGE_KEY = "impact-start:v1";

export type ReportStatus =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "ready"; source: "server" | "local-fallback"; ai: NarrativeStatus | null; validation: ValidationResult | null; error?: string }
  | { state: "error"; message: string };

export interface RejectedPathway {
  id: string;
  reason: string;
}

interface PersistedState {
  responses: Responses;
  rejectedThemes: string[];
  rejectedPathways: RejectedPathway[];
  savedPathways: string[];
  selectedPathwayId: string | null;
  sampleId: string | null;
  tutorialSeen: boolean;
  chaptersSeen: string[];
  lessonsCompleted: string[];
  feedback: { recognised?: string; useful?: string };
  report: Report | null;
}

const EMPTY: PersistedState = {
  responses: {},
  rejectedThemes: [],
  rejectedPathways: [],
  savedPathways: [],
  selectedPathwayId: null,
  sampleId: null,
  tutorialSeen: false,
  chaptersSeen: [],
  lessonsCompleted: [],
  feedback: {},
  report: null,
};

interface AssessmentContextValue extends PersistedState {
  hydrated: boolean;
  persist: boolean;
  reportStatus: ReportStatus;
  setAnswer: (questionId: string, answer: Answer) => void;
  rejectTheme: (id: string) => void;
  restoreTheme: (id: string) => void;
  rejectPathway: (id: string, reason: string) => void;
  restorePathway: (id: string) => void;
  toggleSavedPathway: (id: string) => void;
  selectPathway: (id: string) => void;
  markTutorialSeen: () => void;
  markChapterSeen: (id: string) => void;
  completeLesson: (id: string) => void;
  giveFeedback: (key: "recognised" | "useful", value: string) => void;
  requestReport: () => Promise<void>;
  loadSample: (id: string) => void;
  setPersist: (persist: boolean) => void;
  reset: () => void;
}

const AssessmentContext = createContext<AssessmentContextValue | null>(null);

function readStorage(): PersistedState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? { ...EMPTY, ...(JSON.parse(raw) as PersistedState) } : null;
  } catch {
    return null;
  }
}

/**
 * Holds the assessment for this browser tab. Nothing is stored unless the participant opts in
 * to "Remember on this device", which writes to localStorage and can be cleared at any time.
 */
export function AssessmentProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedState>(EMPTY);
  const [persist, setPersistState] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [reportStatus, setReportStatus] = useState<ReportStatus>({ state: "idle" });
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    const stored = readStorage();
    if (stored) {
      setState(stored);
      setPersistState(true);
      if (stored.report) setReportStatus({ state: "ready", source: "local-fallback", ai: null, validation: null });
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      if (persist) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      else window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Storage can be unavailable (private mode, blocked site data). The session still works.
    }
  }, [state, persist, hydrated]);

  const update = useCallback((patch: Partial<PersistedState> | ((s: PersistedState) => Partial<PersistedState>)) => {
    setState((s) => ({ ...s, ...(typeof patch === "function" ? patch(s) : patch) }));
  }, []);

  const setAnswer = useCallback(
    (questionId: string, answer: Answer) => {
      const previous = stateRef.current.responses[questionId];
      const q = QUESTION_BY_ID[questionId];
      track(previous ? "answer_revised" : "question_answered", { questionId, questionType: q?.type, stage: q?.stage });
      update((s) => ({
        responses: { ...s.responses, [questionId]: answer },
        // Editing answers takes the participant out of a sample profile and invalidates old results.
        sampleId: null,
        report: null,
      }));
      setReportStatus({ state: "idle" });
    },
    [update],
  );

  const requestReport = useCallback(async () => {
    const s = stateRef.current;
    setReportStatus({ state: "loading" });
    track("report_requested", { sample: Boolean(s.sampleId) });
    const payload = {
      responses: s.responses,
      rejectedThemes: s.rejectedThemes,
      rejectedPathways: s.rejectedPathways.map((p) => p.id),
      selectedPathwayId: s.selectedPathwayId,
      sample: Boolean(s.sampleId),
    };
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.status === 422) {
        setReportStatus({ state: "error", message: "Some required questions are still unanswered." });
        track("report_generation_failed", { reason: "incomplete" });
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { report: Report; ai: NarrativeStatus; validation: ValidationResult };
      update({ report: data.report });
      setReportStatus({ state: "ready", source: "server", ai: data.ai, validation: data.validation });
      track("report_generated", { narrative: data.report.meta.narrative, sample: data.report.meta.sample });
    } catch {
      // The rules engine also runs in the browser, so the participant still gets results.
      try {
        const report = buildReport(s.responses, { ...payload, rejectedPathways: payload.rejectedPathways });
        update({ report });
        setReportStatus({
          state: "ready",
          source: "local-fallback",
          ai: null,
          validation: null,
          error: "We couldn't reach the analysis service, so these results were produced on this device by the rules-based engine.",
        });
        track("report_generation_failed", { reason: "server-unreachable" });
        track("report_generated", { narrative: "rules", sample: payload.sample });
      } catch {
        setReportStatus({ state: "error", message: "Some required questions are still unanswered." });
        track("report_generation_failed", { reason: "incomplete" });
      }
    }
  }, [update]);

  const value = useMemo<AssessmentContextValue>(
    () => ({
      ...state,
      hydrated,
      persist,
      reportStatus,
      setAnswer,
      requestReport,
      rejectTheme: (id) => update((s) => ({ rejectedThemes: [...new Set([...s.rejectedThemes, id])], report: null })),
      restoreTheme: (id) => update((s) => ({ rejectedThemes: s.rejectedThemes.filter((t) => t !== id), report: null })),
      rejectPathway: (id, reason) =>
        update((s) => ({
          rejectedPathways: [...s.rejectedPathways.filter((p) => p.id !== id), { id, reason }],
          savedPathways: s.savedPathways.filter((p) => p !== id),
          selectedPathwayId: s.selectedPathwayId === id ? null : s.selectedPathwayId,
          report: null,
        })),
      restorePathway: (id) => update((s) => ({ rejectedPathways: s.rejectedPathways.filter((p) => p.id !== id), report: null })),
      toggleSavedPathway: (id) => {
        const saved = stateRef.current.savedPathways.includes(id);
        if (!saved) track("pathway_saved", { pathwayId: id });
        update((s) => ({ savedPathways: saved ? s.savedPathways.filter((p) => p !== id) : [...s.savedPathways, id] }));
      },
      selectPathway: (id) => {
        track("experiment_selected", { pathwayId: id });
        update({ selectedPathwayId: id });
      },
      markTutorialSeen: () => update({ tutorialSeen: true }),
      // Returns the same state object when nothing changes, so callers can run this from effects.
      markChapterSeen: (id) => setState((s) => (s.chaptersSeen.includes(id) ? s : { ...s, chaptersSeen: [...s.chaptersSeen, id] })),
      completeLesson: (id) => update((s) => ({ lessonsCompleted: [...new Set([...s.lessonsCompleted, id])] })),
      giveFeedback: (key, value) => {
        track("feedback_submitted", { questionId: key, rating: value });
        update((s) => ({ feedback: { ...s.feedback, [key]: value } }));
      },
      loadSample: (id) => {
        const sample = SAMPLE_BY_ID[id];
        if (!sample) return;
        setState({ ...EMPTY, responses: sample.responses, sampleId: id, tutorialSeen: true, chaptersSeen: ["discover", "crossroads", "map"] });
        setReportStatus({ state: "idle" });
      },
      setPersist: (next) => setPersistState(next),
      reset: () => {
        setState(EMPTY);
        setReportStatus({ state: "idle" });
      },
    }),
    [state, hydrated, persist, reportStatus, setAnswer, requestReport, update],
  );

  return <AssessmentContext.Provider value={value}>{children}</AssessmentContext.Provider>;
}

export function useAssessment() {
  const ctx = useContext(AssessmentContext);
  if (!ctx) throw new Error("useAssessment must be used inside AssessmentProvider");
  return ctx;
}
