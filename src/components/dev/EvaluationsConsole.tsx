"use client";

import { useEffect, useMemo, useState } from "react";
import { QUESTIONS } from "@/lib/assessment/questions";
import type { Answer, Responses } from "@/lib/assessment/types";
import { clearEvents, getEvents, subscribe, type AnalyticsEvent } from "@/lib/analytics";
import { extractProfile, type Theme } from "@/lib/engine/extract";
import { rankPathways, selectPathways } from "@/lib/engine/recommend";
import { buildReport, IncompleteAssessmentError } from "@/lib/engine/report";
import type { Report } from "@/lib/engine/schema";
import { validateReport } from "@/lib/engine/validate";
import { SAMPLE_PROFILES } from "@/lib/fixtures/profiles";
import { useAssessment } from "@/lib/state/AssessmentProvider";
import { Chip } from "../ui/Chip";

const TABS = ["Responses", "Extraction", "Recommendations", "Report and evidence", "Validator", "Event log", "Funnel"] as const;
type Tab = (typeof TABS)[number];

/** Illustrative only. There are no real participants; these numbers exist to design the dashboard. */
const SEEDED_FUNNEL = [
  { event: "landing_viewed", label: "Viewed landing", n: 1000 },
  { event: "assessment_started", label: "Started assessment", n: 610 },
  { event: "crossroads_started", label: "Reached crossroads", n: 470 },
  { event: "assessment_completed", label: "Completed assessment", n: 425 },
  { event: "results_viewed", label: "Viewed results", n: 410 },
  { event: "pathway_opened", label: "Opened a pathway", n: 290 },
  { event: "experiment_selected", label: "Chose an experiment", n: 205 },
  { event: "passport_downloaded", label: "Downloaded passport", n: 150 },
  { event: "learning_completed", label: "Completed lesson 1", n: 80 },
];

function describe(a: Answer | undefined) {
  if (!a) return <span className="text-brand-muted">—</span>;
  switch (a.type) {
    case "swipe":
      return a.value;
    case "select":
      return a.values.join(", ") || "(none)";
    case "rank":
      return a.order.join(" > ");
    case "text":
      return `“${a.text}”`;
    case "scenario":
      return `${a.values.join(", ")}${a.note ? ` · note: “${a.note}”` : ""}`;
  }
}

function ThemeTable({ title, themes }: { title: string; themes: Theme[] }) {
  return (
    <section className="mt-6">
      <h3 className="font-bold">{title}</h3>
      {themes.length === 0 ? (
        <p className="text-sm text-brand-muted">None extracted.</p>
      ) : (
        <table className="mt-2 w-full text-left text-sm">
          <thead>
            <tr className="text-brand-muted">
              <th className="py-1 pr-3">Theme</th>
              <th className="py-1 pr-3">Score</th>
              <th className="py-1 pr-3">Confidence</th>
              <th className="py-1 pr-3">Basis</th>
              <th className="py-1">Evidence</th>
            </tr>
          </thead>
          <tbody>
            {themes.map((t) => (
              <tr key={t.id} className="border-t border-brand-border align-top">
                <td className="py-1.5 pr-3 font-semibold">{t.label}</td>
                <td className="py-1.5 pr-3 tabular-nums">{t.score.toFixed(1)}</td>
                <td className="py-1.5 pr-3">{t.confidence}</td>
                <td className="py-1.5 pr-3">{t.basis}</td>
                <td className="py-1.5">{t.evidence.map((e) => `${e.questionId}: ${e.quote}`).join(" | ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

export function EvaluationsConsole() {
  const session = useAssessment();
  const [source, setSource] = useState<string>(SAMPLE_PROFILES[0].id);
  const [tab, setTab] = useState<Tab>("Responses");
  const [injected, setInjected] = useState(false);
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);

  useEffect(() => {
    setEvents(getEvents());
    return subscribe(setEvents);
  }, []);

  const { responses, rejectedThemes, rejectedPathways } = useMemo(() => {
    if (source === "session") {
      return {
        responses: session.responses,
        rejectedThemes: session.rejectedThemes,
        rejectedPathways: session.rejectedPathways.map((p) => p.id),
      };
    }
    const sample = SAMPLE_PROFILES.find((p) => p.id === source);
    return { responses: (sample?.responses ?? {}) as Responses, rejectedThemes: [] as string[], rejectedPathways: [] as string[] };
  }, [source, session.responses, session.rejectedThemes, session.rejectedPathways]);

  const profile = useMemo(() => extractProfile(responses, rejectedThemes), [responses, rejectedThemes]);
  const ranked = useMemo(() => rankPathways(profile, rejectedPathways), [profile, rejectedPathways]);
  const chosen = useMemo(() => selectPathways(profile, rejectedPathways), [profile, rejectedPathways]);
  const { report, error } = useMemo(() => {
    try {
      return { report: buildReport(responses, { rejectedThemes, rejectedPathways, sample: source !== "session" }), error: null };
    } catch (e) {
      return { report: null, error: e instanceof IncompleteAssessmentError ? e.message : String(e) };
    }
  }, [responses, rejectedThemes, rejectedPathways, source]);

  const tested: Report | null = useMemo(() => {
    if (!report || !injected) return report;
    const r = structuredClone(report);
    r.story.paragraphs.push({ text: "You are guaranteed a 95% match with this career and could save 1,000 lives saved each year.", evidence: [], sources: [] });
    return r;
  }, [report, injected]);
  const validation = tested ? validateReport(tested, responses) : null;

  const maxFunnel = SEEDED_FUNNEL[0].n;

  return (
    <div className="min-h-dvh bg-brand-surface pb-16 pt-24">
      <div className="container-page">
        <p className="type-eyebrow text-brand-accent-text">Development only</p>
        <h1 className="type-h1 mt-2 text-brand-primary">Evaluation console</h1>
        <p className="mt-2 max-w-3xl text-brand-muted">
          Inspect how the engine reads fictional participants. Sample profiles are invented. &ldquo;Current session&rdquo; reads only this
          browser&apos;s in-memory answers; nothing is fetched from a server.
        </p>

        <div className="mt-6 flex flex-wrap items-end gap-4">
          <label className="flex flex-col text-sm font-semibold">
            Participant
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="mt-1 min-h-11 rounded-lg border-[1.5px] border-brand-border-strong bg-brand-background px-3"
            >
              {SAMPLE_PROFILES.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
              <option value="session">Current session (this browser)</option>
            </select>
          </label>
          <p className="max-w-xl text-sm text-brand-muted">{SAMPLE_PROFILES.find((p) => p.id === source)?.summary ?? "Your live answers."}</p>
        </div>

        <div role="tablist" aria-label="Review sections" className="mt-6 flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t}
              role="tab"
              type="button"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={`min-h-11 rounded-full px-4 text-sm font-semibold ${tab === t ? "bg-brand-primary text-brand-on-primary" : "bg-brand-background hover:bg-brand-primary-soft"}`}
            >
              {t}
            </button>
          ))}
        </div>

        <div role="tabpanel" aria-label={tab} className="surface-card mt-4 overflow-x-auto p-5 sm:p-8">
          {tab === "Responses" && (
            <table className="w-full min-w-[40rem] text-left text-sm">
              <thead>
                <tr className="text-brand-muted">
                  <th className="py-1 pr-3">Question</th>
                  <th className="py-1 pr-3">Purpose</th>
                  <th className="py-1">Answer</th>
                </tr>
              </thead>
              <tbody>
                {QUESTIONS.map((q) => (
                  <tr key={q.id} className="border-t border-brand-border align-top">
                    <td className="py-2 pr-3">
                      <span className="font-mono text-xs text-brand-muted">{q.id}</span>
                      <br />
                      {q.type === "swipe" ? q.statement : q.type === "scenario" ? q.title : q.prompt}
                    </td>
                    <td className="py-2 pr-3 text-brand-muted">{q.purpose}</td>
                    <td className="py-2">{describe(responses[q.id])}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {tab === "Extraction" && (
            <>
              <p className="text-sm">
                Answered {profile.answered} of {profile.required} required questions. Unsure: {profile.unsure.map((q) => q.id).join(", ") || "none"}.
                Rejected by participant: {profile.rejected.join(", ") || "none"}.
              </p>
              <ThemeTable title="Capabilities" themes={profile.capabilities} />
              <ThemeTable title="Motivations" themes={profile.motivations} />
              <ThemeTable title="Causes" themes={profile.causes} />
              <ThemeTable title="Contribution modes" themes={profile.modes} />
              <ThemeTable title="Constraints" themes={profile.constraints} />
              <ThemeTable title="Readiness" themes={profile.readiness} />
            </>
          )}

          {tab === "Recommendations" && (
            <>
              <p className="text-sm text-brand-muted">
                Internal scores rank the library; participants never see them. Chosen: {chosen.map((c) => `${c.candidate.pathway.id} (${c.role})`).join(", ")}.
              </p>
              <table className="mt-3 w-full min-w-[48rem] text-left text-sm">
                <thead>
                  <tr className="text-brand-muted">
                    <th className="py-1 pr-3">Pathway</th>
                    <th className="py-1 pr-3">Type</th>
                    <th className="py-1 pr-3">Score</th>
                    <th className="py-1 pr-3">Skill</th>
                    <th className="py-1 pr-3">Motivation</th>
                    <th className="py-1 pr-3">Cause</th>
                    <th className="py-1 pr-3">Mode</th>
                    <th className="py-1">Feasibility</th>
                  </tr>
                </thead>
                <tbody className="tabular-nums">
                  {ranked.map((c) => (
                    <tr
                      key={c.pathway.id}
                      className={`border-t border-brand-border ${chosen.some((x) => x.candidate.pathway.id === c.pathway.id) ? "bg-brand-accent-soft font-semibold" : ""}`}
                    >
                      <td className="py-1.5 pr-3">{c.pathway.title}</td>
                      <td className="py-1.5 pr-3">{c.pathway.change}</td>
                      <td className="py-1.5 pr-3">{c.score.toFixed(3)}</td>
                      {(["skill", "motivation", "cause", "mode", "feasibility"] as const).map((k) => (
                        <td key={k} className="py-1.5 pr-3">
                          {c.parts[k].toFixed(2)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {tab === "Report and evidence" &&
            (report ? (
              <div className="space-y-5 text-sm">
                {[
                  ...report.story.paragraphs.map((c) => ({ kind: "Story", ...c })),
                  ...report.pathways.map((p) => ({ kind: `Why: ${p.title}`, ...p.why })),
                  ...report.unknowns.map((c) => ({ kind: "Unknown", ...c })),
                ].map((c, i) => (
                  <div key={i} className="border-t border-brand-border pt-3">
                    <Chip>{c.kind}</Chip>
                    <p className="mt-2">{c.text}</p>
                    <p className="mt-1 text-brand-muted">
                      Evidence: {c.evidence.map((e) => e.questionId).join(", ") || "none"} · Sources: {c.sources.join(", ") || "none"}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-brand-warning">{error}</p>
            ))}

          {tab === "Validator" && (
            <>
              <label className="flex items-center gap-3 text-sm font-semibold">
                <input type="checkbox" checked={injected} onChange={(e) => setInjected(e.target.checked)} className="h-5 w-5" />
                Inject an unsupported claim to test the validator
              </label>
              {validation ? (
                <div className="mt-4">
                  <p className={`font-bold ${validation.valid ? "text-brand-success" : "text-brand-warning"}`}>
                    {validation.valid ? "✓ Report passes validation" : "✕ Report fails validation"}
                  </p>
                  <ul className="mt-2 space-y-1 text-sm">
                    {validation.issues.map((i, k) => (
                      <li key={k}>
                        <strong>[{i.severity}]</strong> {i.path}: {i.message}
                      </li>
                    ))}
                    {validation.issues.length === 0 && <li className="text-brand-muted">No issues.</li>}
                  </ul>
                </div>
              ) : (
                <p className="mt-4 text-brand-warning">{error}</p>
              )}
            </>
          )}

          {tab === "Event log" && (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm text-brand-muted">
                  {events.length} events in this browser session. Payloads contain IDs and categories only, never answers.
                </p>
                <button type="button" onClick={clearEvents} className="min-h-11 text-sm font-semibold underline">
                  Clear
                </button>
              </div>
              <ol className="mt-3 space-y-1 font-mono text-xs">
                {[...events].reverse().map((e, i) => (
                  <li key={i} className="border-t border-brand-border py-1">
                    {e.at.slice(11, 19)} <strong>{e.name}</strong> {JSON.stringify(e.props)} <span className="text-brand-muted">{e.versions.questions}</span>
                  </li>
                ))}
              </ol>
            </>
          )}

          {tab === "Funnel" && (
            <>
              <h2 className="text-lg font-bold">Participant funnel</h2>
              <p className="mt-1 rounded-lg bg-brand-warning-soft px-3 py-2 text-sm text-brand-warning">
                Seeded illustration: these are invented numbers for designing the dashboard, not data from real participants.
              </p>
              <ol className="mt-5 space-y-2.5">
                {SEEDED_FUNNEL.map((s, i) => {
                  const prev = SEEDED_FUNNEL[i - 1]?.n;
                  const tip = `${s.label}: ${s.n.toLocaleString("en-GB")}${prev ? ` (${Math.round((s.n / prev) * 100)}% of previous step)` : ""}`;
                  return (
                    <li key={s.event} className="grid grid-cols-[10rem_1fr] items-center gap-3 sm:grid-cols-[13rem_1fr]" title={tip}>
                      <span className="text-sm">
                        {s.label}
                        <span className="block font-mono text-[0.6875rem] text-brand-muted">{s.event}</span>
                      </span>
                      <span className="flex items-center gap-2">
                        <span className="h-5 rounded-r bg-brand-info" style={{ width: `${(s.n / maxFunnel) * 85}%` }} aria-hidden />
                        <span className="text-sm tabular-nums text-brand-text">{s.n.toLocaleString("en-GB")}</span>
                      </span>
                    </li>
                  );
                })}
              </ol>
              <details className="mt-4 text-sm">
                <summary className="min-h-11 cursor-pointer py-2 font-semibold">View as a table</summary>
                <table className="mt-2 text-left">
                  <thead>
                    <tr>
                      <th className="pr-4">Step</th>
                      <th className="pr-4">Participants</th>
                      <th>Of previous</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SEEDED_FUNNEL.map((s, i) => (
                      <tr key={s.event}>
                        <td className="pr-4">{s.label}</td>
                        <td className="pr-4 tabular-nums">{s.n}</td>
                        <td className="tabular-nums">{i ? `${Math.round((s.n / SEEDED_FUNNEL[i - 1].n) * 100)}%` : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </details>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
