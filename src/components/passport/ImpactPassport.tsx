"use client";

import { useEffect, useState } from "react";
import { Aurora } from "../fx/Aurora";
import { track } from "@/lib/analytics";
import { buildPlan } from "@/lib/engine/report";
import type { Report } from "@/lib/engine/schema";
import { useEnsureReport } from "@/lib/hooks/useEnsureReport";
import { SOURCES, isSourceId } from "@/lib/knowledge/sources";
import { ReportStatusNotice } from "../report/ReportStatusNotice";
import { Button, LinkButton } from "../ui/Button";
import { ConfidenceChip } from "../ui/Chip";

/** Shareable text deliberately omits free-text answers and individual responses. */
export function privacySafeSummary(report: Report, experimentTitle: string) {
  return [
    "My Impact Career Compass summary",
    "",
    `Strengths: ${report.strengths.map((s) => s.label).join(", ")}`,
    `Pathways I'm exploring: ${report.pathways.map((p) => p.title).join("; ")}`,
    `This week's experiment: ${experimentTitle}`,
    "",
    "Impact Career Compass is an independent concept prototype, not an official High Impact Professionals product.",
  ].join("\n");
}

const FEEDBACK = [
  { key: "recognised" as const, q: "Did you recognise yourself in these results?", options: ["Not really", "Partly", "Yes"] },
  { key: "useful" as const, q: "Do you know what to do next?", options: ["Not yet", "Somewhat", "Clearly"] },
];

export function ImpactPassport() {
  const a = useEnsureReport();
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [shown, setShown] = useState(a.report);
  useEffect(() => {
    if (a.report) setShown(a.report);
  }, [a.report]);
  const { markChapterSeen } = a;
  useEffect(() => markChapterSeen("passport"), [markChapterSeen]);

  if (!a.hydrated) return <div className="min-h-dvh bg-brand-surface" />;
  if (!a.complete || !shown) {
    return (
      <div className="min-h-dvh bg-brand-surface pt-28">
        <div className="container-page max-w-2xl" role="status">
          <h1 className="type-h1 text-brand-primary">{a.complete ? "Preparing your passport…" : "Your Impact Passport appears after the assessment."}</h1>
          {!a.complete && (
            <div className="mt-6">
              <LinkButton href="/discover">Start or continue</LinkButton>
            </div>
          )}
        </div>
      </div>
    );
  }

  const r = shown;
  const chosen = r.pathways.find((p) => p.id === a.selectedPathwayId) ?? r.pathways[0];
  const notes = Object.entries(a.responses).flatMap(([id, ans]) => (ans.type === "scenario" && ans.note ? [{ id, note: ans.note }] : []));
  const plan = chosen.id === r.experiment.pathwayId ? r.plan : buildPlan(chosen.experiment, chosen.title, r.plan.mode === "weekly");
  const followOn = r.learning.followOn && isSourceId(r.learning.followOn) ? SOURCES[r.learning.followOn] : null;
  const date = new Date(r.meta.generatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  const download = () => {
    track("passport_downloaded");
    window.print();
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(privacySafeSummary(r, chosen.experiment.title));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  const h2 = "text-xs font-bold uppercase tracking-[0.14em] text-brand-accent-text";

  return (
    <div className="min-h-dvh bg-brand-surface pb-16 pt-24 print:bg-white print:p-0">
      <div className="container-page max-w-4xl">
        <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="type-eyebrow text-brand-accent-text">Your Impact Passport</p>
            <p className="text-sm text-brand-muted">A record to keep, print or save as a PDF.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={download}>
              Download PDF
            </Button>
            <Button variant="ghost" onClick={copy}>
              {copied ? "Copied" : "Copy a shareable summary"}
            </Button>
          </div>
        </div>
        <p className="no-print sr-only" aria-live="polite">
          {copied ? "Summary copied. It contains only strengths, pathway titles and your experiment title." : ""}
        </p>

        <article className="surface-card overflow-hidden print:border-0 print:shadow-none">
          <header className="relative isolate overflow-hidden bg-brand-primary p-6 text-brand-on-primary sm:p-10 print:bg-white print:p-0 print:text-brand-text">
            <div className="no-print">
              <Aurora tone="warm" />
            </div>
            <p className="type-eyebrow text-brand-accent print:text-brand-accent-text">Impact Career Compass · Impact Passport</p>
            <h1 className="type-h1 mt-3">What your experience could make possible</h1>
            <p className="mt-3 text-brand-on-primary-muted print:text-brand-muted">Prepared {date}. Hypotheses to explore, not conclusions.</p>
          </header>

          <div className="space-y-10 p-6 sm:p-10 print:px-0">
            <div className="no-print">
              <ReportStatusNotice report={r} status={a.reportStatus} sampleId={a.sampleId} />
            </div>

            <section className="print-break">
              <h2 className={h2}>1 · Your impact discovery</h2>
              <p className="type-h2 mt-2 text-brand-primary">{r.story.headline}</p>
              <p className="mt-2 text-brand-muted">{r.story.discovery}</p>
              <div className="mt-3 space-y-2 text-lg">
                {r.story.paragraphs.map((p, i) => (
                  <p key={i}>{p.text}</p>
                ))}
              </div>
            </section>

            <section className="print-break">
              <h2 className={h2}>2 · Your professional capital</h2>
              <ul className="mt-4 grid gap-4 sm:grid-cols-2">
                {r.strengths.map((s) => (
                  <li key={s.id} className="rounded-xl border border-brand-border p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-lg font-bold text-brand-primary">{s.label}</h3>
                      <ConfidenceChip confidence={s.confidence} />
                    </div>
                    <p className="mt-2 text-sm text-brand-muted">{s.description}</p>
                    {s.transfer && (
                      <p className="mt-2 text-sm">
                        <strong>Why it travels:</strong> {s.transfer}
                      </p>
                    )}
                    {s.evidenceType && <p className="mt-2 text-xs font-semibold text-brand-muted">{s.evidenceType}</p>}
                  </li>
                ))}
              </ul>
            </section>

            <section className="print-break grid gap-8 sm:grid-cols-2">
              <div>
                <h2 className={h2}>3 · What drives you</h2>
                <ul className="mt-3 space-y-2">
                  {r.motivations.map((m) => (
                    <li key={m.id}>
                      <span className="font-semibold">{m.label}</span>
                      <span className="text-brand-muted"> · {m.basis === "both" ? "stated and shown in your experience" : "stated preference"}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className={h2}>Problems you want to learn about</h2>
                <p className="mt-3">{r.causes.length ? r.causes.map((c) => c.label).join(", ") : "Not chosen yet."}</p>
                {r.constraints.length > 0 && (
                  <>
                    <h2 className={`${h2} mt-6`}>What you&apos;re weighing</h2>
                    <p className="mt-3">{r.constraints.map((c) => c.label).join(", ")}</p>
                  </>
                )}
              </div>
            </section>

            <section>
              <h2 className={h2}>4 · Opportunities worth exploring</h2>
              <ol className="mt-4 space-y-4">
                {r.pathways.map((p, i) => (
                  <li key={p.id} className="print-break rounded-xl border border-brand-border p-5">
                    <p className="text-xs font-bold uppercase tracking-wider text-brand-muted">
                      {i + 1}. {p.roleLabel}
                      {p.id === chosen.id && " · Selected to investigate"}
                      {a.savedPathways.includes(p.id) && " · Saved"}
                    </p>
                    <h3 className="mt-1 text-xl font-bold text-brand-primary">{p.title}</h3>
                    <p className="mt-2">{p.why.text}</p>
                    <p className="mt-3 text-sm">
                      <strong>Priority:</strong> {p.fit.priority}. {p.fit.priorityReason}
                    </p>
                    <p className="mt-1 text-sm">
                      <strong>Skill fit:</strong> {p.fit.skill.label} · <strong>Motivation:</strong> {p.fit.motivation.label} ·{" "}
                      <strong>Feasibility now:</strong> {p.fit.feasibility.label} · <strong>Evidence for the opportunity:</strong> {p.fit.evidence}
                    </p>
                    <p className="mt-1 text-sm text-brand-muted">
                      <strong className="text-brand-text">Compared with what would happen anyway:</strong> {p.counterfactual}
                    </p>
                    <p className="mt-1 text-sm text-brand-muted">
                      <strong className="text-brand-text">What would change this view:</strong> {p.reviseIf}
                    </p>
                    <p className="mt-2 text-sm text-brand-muted">
                      <strong className="text-brand-text">Check first:</strong> {[...p.uncertainties, ...p.assumptions].slice(0, 2).join(" ")}
                    </p>
                  </li>
                ))}
              </ol>
            </section>

            {r.tradeoffs.length > 0 && (
              <section className="print-break">
                <h2 className={h2}>5 · Important trade-offs</h2>
                <dl className="mt-3 space-y-3">
                  {r.tradeoffs.map((t) => (
                    <div key={t.dimension}>
                      <dt className="font-semibold">{t.dimension}</dt>
                      <dd className="text-brand-muted">{t.text}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}

            <section className="print-break">
              <h2 className={h2}>6 · Key unknowns</h2>
              <ul className="mt-3 list-disc space-y-2 pl-5">
                {r.unknowns.map((u, i) => (
                  <li key={i}>{u.text}</li>
                ))}
              </ul>
              {notes.length > 0 && (
                <>
                  <h3 className="mt-5 font-bold">In your own words</h3>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-brand-muted">
                    {notes.map((n) => (
                      <li key={n.id}>“{n.note}”</li>
                    ))}
                  </ul>
                </>
              )}
            </section>

            <section className="print-break rounded-xl bg-brand-primary-soft p-6">
              <h2 className={h2}>7 · Your seven-day experiment</h2>
              <h3 className="type-h2 mt-2 text-brand-primary">{chosen.experiment.title}</h3>
              <p className="mt-1 text-brand-muted">To test: {chosen.title}</p>
              <p className="mt-3">
                <strong>Hypothesis:</strong> {chosen.experiment.hypothesis}
              </p>
              <ol className="mt-4 space-y-2">
                {plan.steps.map((s) => (
                  <li key={s.when} className="flex gap-3">
                    <span aria-hidden className="mt-0.5 h-5 w-5 shrink-0 rounded border-[1.5px] border-brand-primary" />
                    <span>
                      <strong>{s.when}:</strong> {s.task}
                    </span>
                  </li>
                ))}
              </ol>
              <p className="mt-4 text-sm">
                <strong>Effort:</strong> {chosen.experiment.effort} · <strong>Decision rule:</strong> {chosen.experiment.decisionRule}
              </p>
            </section>

            <section className="print-break">
              <h2 className={h2}>8 · Your next learning step</h2>
              <p className="mt-3 font-semibold">{r.learning.lesson}</p>
              <p className="text-brand-muted">{r.learning.why}</p>
              {followOn && (
                <p className="mt-2 text-sm">
                  Then:{" "}
                  <a href={followOn.url} target="_blank" rel="noreferrer" className="font-semibold text-brand-info underline underline-offset-2">
                    {followOn.publisher}: {followOn.title}
                  </a>
                </p>
              )}
              <h3 className="mt-5 font-bold">Further reading</h3>
              <ul className="mt-2 space-y-2">
                {r.nextSteps.map((n) => (
                  <li key={n.sourceId}>
                    {isSourceId(n.sourceId) ? (
                      <a href={SOURCES[n.sourceId].url} target="_blank" rel="noreferrer" className="font-semibold text-brand-info underline underline-offset-2">
                        {n.title}
                      </a>
                    ) : (
                      <span className="font-semibold">{n.title}</span>
                    )}
                    <span className="text-brand-muted"> · {n.description}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="print-break rounded-xl border-l-4 border-brand-accent bg-brand-surface p-6">
              <h2 className={h2}>9 · A question to reflect on</h2>
              <p className="type-h2 mt-2 text-brand-primary">{r.reflectiveQuestion}</p>
            </section>

            <footer className="border-t border-brand-border pt-4 text-xs text-brand-muted">
              Impact Career Compass is an independent concept prototype created for a job application. It is not an official High Impact Professionals
              product. Results come from your answers and a curated pathway library ({r.meta.libraryVersion}, {r.meta.engineVersion}). They are
              hypotheses to test, not predictions.
            </footer>
          </div>
        </article>

        <section className="no-print surface-card mt-8 p-6 sm:p-8">
          <h2 className="type-h2 text-brand-primary">A quick reflection</h2>
          <p className="mt-1 text-brand-muted">Optional. Helps improve Impact Career Compass; only your choice is recorded, never your answers.</p>
          <div className="mt-5 grid gap-6 sm:grid-cols-2">
            {FEEDBACK.map((f) => (
              <fieldset key={f.key}>
                <legend className="font-semibold">{f.q}</legend>
                <div className="mt-3 flex flex-wrap gap-2">
                  {f.options.map((o) => (
                    <button
                      key={o}
                      type="button"
                      aria-pressed={a.feedback[f.key] === o}
                      onClick={() => a.giveFeedback(f.key, o)}
                      className={`min-h-11 rounded-full border-[1.5px] px-4 text-sm font-semibold ${
                        a.feedback[f.key] === o ? "border-brand-primary bg-brand-primary text-brand-on-primary" : "border-brand-border-strong hover:bg-brand-surface"
                      }`}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              </fieldset>
            ))}
          </div>
        </section>

        <section className="no-print surface-card mt-6 p-6 sm:p-8">
          <h2 className="type-h2 text-brand-primary">Your data</h2>
          <label className="mt-4 flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              className="mt-1 h-5 w-5 accent-[var(--brand-primary)]"
              checked={a.persist}
              onChange={(e) => a.setPersist(e.target.checked)}
            />
            <span>
              <span className="font-semibold">Remember my answers and results on this device</span>
              <span className="block text-sm text-brand-muted">
                Saved in this browser&apos;s local storage only, so you can come back later. Off by default.
              </span>
            </span>
          </label>
          <div className="mt-6 flex flex-wrap gap-3">
            <LinkButton href="/discover" variant="ghost">
              Update my answers
            </LinkButton>
            <LinkButton href="/pathways" variant="ghost">
              Revisit pathways
            </LinkButton>
            {confirmDelete ? (
              <>
                <Button
                  variant="secondary"
                  onClick={() => {
                    a.setPersist(false);
                    a.reset();
                    setConfirmDelete(false);
                  }}
                >
                  Yes, delete everything
                </Button>
                <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
                  Cancel
                </Button>
              </>
            ) : (
              <Button variant="ghost" onClick={() => setConfirmDelete(true)}>
                Delete my answers
              </Button>
            )}
          </div>
        </section>

        <div className="no-print mt-10 flex flex-col items-start gap-4 rounded-[var(--radius-card)] bg-brand-primary p-6 text-brand-on-primary sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <h2 className="type-h2">Keep going: the foundations</h2>
            <p className="mt-1 text-brand-on-primary-muted">A ten-minute lesson on how to judge whether a career path is high-impact.</p>
          </div>
          <LinkButton href="/learn" size="lg">
            Start the first lesson
          </LinkButton>
        </div>
      </div>
    </div>
  );
}
