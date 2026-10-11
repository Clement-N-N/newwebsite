"use client";

import { motion } from "motion/react";
import { ArrowRight, Columns3, FlaskConical, Star } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CAUSE_LABELS } from "@/lib/assessment/labels";
import { track } from "@/lib/analytics";
import { motionEmphasis } from "@/lib/design/motion";
import type { PathwayRec } from "@/lib/engine/schema";
import { useEnsureReport } from "@/lib/hooks/useEnsureReport";
import { PATHWAY_BY_ID } from "@/lib/knowledge/pathways";
import { SOURCES, isSourceId } from "@/lib/knowledge/sources";
import { ChapterIntro } from "../journey/ChapterIntro";
import { EvidenceToggle } from "../report/Evidence";
import { ReportStatusNotice } from "../report/ReportStatusNotice";
import { Button, LinkButton } from "../ui/Button";
import { Chip } from "../ui/Chip";
import { Dialog } from "../ui/Dialog";

const REJECT_REASONS = [
  "I'm not interested in this problem",
  "It doesn't fit my skills",
  "It isn't feasible for me right now",
  "I've already explored this",
];

const COMPARE_ROWS: { label: string; get: (p: PathwayRec) => string; help: string }[] = [
  { label: "Demonstrated skill fit", get: (p) => p.fit.skill, help: "How closely your stated experience matches what this work relies on." },
  { label: "Feasibility right now", get: (p) => p.fit.feasibility, help: "Given the constraints you described." },
  { label: "Motivation", get: (p) => p.fit.motivation, help: "Overlap with what you said drives you." },
  { label: "Learning required", get: (p) => p.fit.learning, help: "From the pathway library, not personalised." },
  { label: "Testing cheaply", get: (p) => p.fit.testability, help: "How easily you can try it this week." },
  { label: "Biggest unknown", get: (p) => p.uncertainties[0] ?? p.assumptions[0], help: "The first thing to check." },
];

function PathwayDetail({ p }: { p: PathwayRec }) {
  const section = "mt-5";
  return (
    <div className="space-y-1">
      <div className="flex flex-wrap gap-2">
        <Chip tone="accent">{p.roleLabel}</Chip>
        <Chip>{p.cause ? CAUSE_LABELS[p.cause as keyof typeof CAUSE_LABELS] : "Useful across many causes"}</Chip>
      </div>
      <section className={section}>
        <h3 className="font-bold text-brand-primary">The need</h3>
        <p className="text-brand-muted">{p.need}</p>
      </section>
      <section className={section}>
        <h3 className="font-bold text-brand-primary">How it could make a difference</h3>
        <p className="text-brand-muted">{p.mechanism}</p>
      </section>
      <section className={section}>
        <h3 className="font-bold text-brand-primary">Why it may be promising for you</h3>
        <p className="text-brand-muted">{p.why.text}</p>
        <EvidenceToggle evidence={p.why.evidence} />
      </section>
      {p.capabilities.length > 0 && (
        <section className={section}>
          <h3 className="font-bold text-brand-primary">Capabilities it draws on</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {p.capabilities.map((c) => (
              <Chip key={c} tone="primary">
                {c}
              </Chip>
            ))}
          </div>
        </section>
      )}
      <section className={`${section} grid gap-5 sm:grid-cols-2`}>
        <div>
          <h3 className="font-bold text-brand-primary">Assumptions to check</h3>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-brand-muted">
            {p.assumptions.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-brand-primary">Possible constraints</h3>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-brand-muted">
            {[...p.uncertainties, ...p.constraints].map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </div>
      </section>
      <section className={`${section} rounded-xl bg-brand-surface p-4`}>
        <h3 className="font-bold text-brand-primary">Low-cost experiment: {p.experiment.title}</h3>
        <ol className="mt-2 list-decimal space-y-1 pl-5">
          {p.experiment.steps.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
      </section>
      <section className={section}>
        <h3 className="font-bold text-brand-primary">Background reading</h3>
        <ul className="mt-1 space-y-1 text-sm">
          {[...new Set([...p.sources, ...p.resources])].filter(isSourceId).map((s) => (
            <li key={s}>
              <a href={SOURCES[s].url} target="_blank" rel="noreferrer" className="font-semibold text-brand-info underline underline-offset-2">
                {SOURCES[s].publisher}: {SOURCES[s].title}
              </a>
              <span className="text-brand-muted"> · {SOURCES[s].supports}</span>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-brand-muted">
          Sources describe the field in general. They do not assess you, and no job opening is implied.
        </p>
      </section>
    </div>
  );
}

export function PathwaysExplorer() {
  const a = useEnsureReport();
  const [open, setOpen] = useState<PathwayRec | null>(null);
  const [rejecting, setRejecting] = useState<PathwayRec | null>(null);
  const [reason, setReason] = useState(REJECT_REASONS[0]);
  const [other, setOther] = useState("");
  const [compare, setCompare] = useState(false);
  const [shown, setShown] = useState(a.report);

  useEffect(() => {
    if (a.report) setShown(a.report);
  }, [a.report]);

  if (!a.hydrated) return <div className="min-h-dvh bg-brand-surface" />;

  if (!a.complete || !shown) {
    return (
      <div className="min-h-dvh bg-brand-surface pt-28">
        <div className="container-page max-w-2xl" role="status">
          <h1 className="type-h1 text-brand-primary">{a.complete ? "Preparing your pathways…" : "Your pathways appear after the assessment."}</h1>
          {!a.complete && (
            <div className="mt-6 flex gap-3">
              <LinkButton href="/discover">Start or continue</LinkButton>
            </div>
          )}
        </div>
      </div>
    );
  }

  const selected = shown.pathways.find((p) => p.id === a.selectedPathwayId) ?? null;

  const openDetail = (p: PathwayRec) => {
    track("pathway_opened", { pathwayId: p.id, role: p.role });
    setOpen(p);
  };

  const submitReject = () => {
    if (!rejecting) return;
    a.rejectPathway(rejecting.id, reason === "Other" ? other.trim() || "Other" : reason);
    setRejecting(null);
    setOther("");
  };

  return (
    <div className="min-h-dvh bg-brand-surface pb-16 pt-24">
      <ChapterIntro chapterId="pathways" />
      <div className="container-page">
        <p className="type-eyebrow text-brand-accent-text">Explore your pathways</p>
        <h1 className="type-h1 mt-3 max-w-3xl text-brand-primary">Three hypotheses, side by side.</h1>
        <p className="type-lede mt-4 max-w-2xl text-brand-muted">
          None of these is a verdict. Compare them, save the ones worth keeping, and choose one to investigate this week.
        </p>
        <div className="mt-4 max-w-3xl">
          <ReportStatusNotice report={shown} status={a.reportStatus} sampleId={a.sampleId} />
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button variant={compare ? "secondary" : "ghost"} aria-pressed={compare} onClick={() => setCompare((c) => !c)}>
            <Columns3 size={18} strokeWidth={2} absoluteStrokeWidth aria-hidden />
            {compare ? "Hide comparison" : "Compare side by side"}
          </Button>
          <LinkButton href="/impact-map" variant="ghost">
            Revisit your answers
          </LinkButton>
          {a.reportStatus.state === "loading" && (
            <span role="status" className="text-sm font-semibold text-brand-muted">
              Updating…
            </span>
          )}
        </div>

        {compare && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={motionEmphasis}
            className="surface-card mt-6 overflow-x-auto"
          >
            <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
              <caption className="sr-only">Comparison of your three pathways</caption>
              <thead>
                <tr>
                  <th scope="col" className="w-48 p-4 align-bottom font-semibold text-brand-muted">
                    Category
                  </th>
                  {shown.pathways.map((p) => (
                    <th key={p.id} scope="col" className="p-4 align-bottom">
                      <span className="block text-xs font-semibold uppercase tracking-wider text-brand-accent-text">{p.roleLabel}</span>
                      <span className="mt-1 block text-base font-bold text-brand-primary">{p.title}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARE_ROWS.map((row) => (
                  <tr key={row.label} className="border-t border-brand-border">
                    <th scope="row" className="p-4 align-top font-semibold">
                      {row.label}
                      <span className="mt-0.5 block text-xs font-normal text-brand-muted">{row.help}</span>
                    </th>
                    {shown.pathways.map((p) => (
                      <td key={p.id} className="p-4 align-top">
                        {row.get(p)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="border-t border-brand-border p-4 text-xs text-brand-muted">
              Categories are judgements from your answers and the pathway library. There is deliberately no overall score.
            </p>
          </motion.div>
        )}

        <ol className="mt-8 grid gap-5 lg:grid-cols-3">
          {shown.pathways.map((p, i) => {
            const saved = a.savedPathways.includes(p.id);
            const isSelected = selected?.id === p.id;
            return (
              <motion.li
                key={p.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...motionEmphasis, delay: i * 0.08 }}
                whileHover={{ y: -4 }}
                className={`surface-card flex flex-col p-6 transition-[box-shadow] duration-150 hover:shadow-[var(--shadow-lifted)] ${isSelected ? "ring-2 ring-brand-accent" : ""}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <Chip tone="accent">{p.roleLabel}</Chip>
                  {isSelected && <Chip tone="success">Investigating</Chip>}
                </div>
                <h2 className="type-card mt-4 text-brand-primary">{p.title}</h2>
                <p className="mt-2 text-sm text-brand-muted">
                  {p.cause ? CAUSE_LABELS[p.cause as keyof typeof CAUSE_LABELS] : "Useful across many causes"}
                </p>
                <p className="mt-4 flex-1">{p.why.text}</p>
                <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div>
                    <dt className="text-brand-muted">Skill fit</dt>
                    <dd className="font-bold">{p.fit.skill}</dd>
                  </div>
                  <div>
                    <dt className="text-brand-muted">Feasibility now</dt>
                    <dd className="font-bold">{p.fit.feasibility}</dd>
                  </div>
                  <div>
                    <dt className="text-brand-muted">Learning</dt>
                    <dd className="font-bold">{p.fit.learning}</dd>
                  </div>
                  <div>
                    <dt className="text-brand-muted">To test</dt>
                    <dd className="font-bold">{p.fit.testability}</dd>
                  </div>
                </dl>
                <div className="mt-6 grid gap-2">
                  <Button variant="secondary" onClick={() => openDetail(p)}>
                    Open details
                  </Button>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="ghost" aria-pressed={saved} onClick={() => a.toggleSavedPathway(p.id)}>
                      <Star size={18} strokeWidth={2} absoluteStrokeWidth fill={saved ? "currentColor" : "none"} className={saved ? "text-brand-accent-text" : ""} aria-hidden />
                      {saved ? "Saved" : "Save"}
                    </Button>
                    <Button variant="ghost" onClick={() => a.selectPathway(p.id)} disabled={isSelected}>
                      {isSelected ? "Chosen" : "Investigate"}
                    </Button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRejecting(p)}
                    className="min-h-11 text-sm font-semibold text-brand-muted underline underline-offset-2 hover:text-brand-text"
                  >
                    Not for me
                  </button>
                </div>
              </motion.li>
            );
          })}
        </ol>

        {selected && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={motionEmphasis}
            className="mt-8 rounded-[var(--radius-card)] bg-brand-primary p-6 text-brand-on-primary sm:p-8"
            aria-live="polite"
          >
            <p className="type-eyebrow flex items-center gap-2 text-brand-accent-on-dark">
              <FlaskConical size={16} strokeWidth={2} absoluteStrokeWidth aria-hidden /> Your seven-day experiment
            </p>
            <h2 className="type-h2 mt-2">{selected.experiment.title}</h2>
            <ol className="mt-4 list-decimal space-y-1.5 pl-5 text-brand-on-primary-muted">
              {selected.experiment.steps.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
            <div className="mt-6">
              <LinkButton href="/passport">Add it to your Impact Passport</LinkButton>
            </div>
          </motion.section>
        )}

        {a.rejectedPathways.length > 0 && (
          <section className="mt-10">
            <h2 className="text-lg font-bold text-brand-primary">Set aside</h2>
            <p className="text-sm text-brand-muted">We replaced these with the next best options. Your reasons stay on this device.</p>
            <ul className="mt-3 space-y-2">
              {a.rejectedPathways.map((r) => (
                <li key={r.id} className="flex flex-wrap items-center gap-3 text-sm">
                  <span className="font-semibold">{PATHWAY_BY_ID[r.id]?.title ?? r.id}</span>
                  <span className="text-brand-muted">“{r.reason}”</span>
                  <button type="button" onClick={() => a.restorePathway(r.id)} className="min-h-11 font-semibold text-brand-info underline">
                    Restore
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="mt-12 flex flex-wrap justify-between gap-3 border-t border-brand-border pt-8">
          <Link href="/reveal" className="min-h-11 py-2 font-semibold text-brand-primary underline underline-offset-4">
            ← Back to your results
          </Link>
          <LinkButton href="/passport" size="lg" className="ps-6 pe-5">
            Open your Impact Passport <ArrowRight size={20} strokeWidth={2} absoluteStrokeWidth aria-hidden />
          </LinkButton>
        </div>
      </div>

      <Dialog open={Boolean(open)} onClose={() => setOpen(null)} title={open?.title ?? ""} wide>
        {open && <PathwayDetail p={open} />}
      </Dialog>

      <Dialog open={Boolean(rejecting)} onClose={() => setRejecting(null)} title="Why isn't this one for you?">
        <p className="text-brand-muted">Your reason helps us suggest something better. It isn&apos;t sent anywhere.</p>
        <fieldset className="mt-4 space-y-2">
          <legend className="sr-only">Reason</legend>
          {[...REJECT_REASONS, "Other"].map((r) => (
            <label key={r} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-2 hover:bg-brand-surface">
              <input type="radio" name="reason" checked={reason === r} onChange={() => setReason(r)} className="h-4 w-4 accent-[var(--brand-primary)]" />
              {r}
            </label>
          ))}
        </fieldset>
        {reason === "Other" && (
          <>
            <label htmlFor="reject-other" className="mt-3 block text-sm font-semibold">
              Tell us more (optional)
            </label>
            <input
              id="reject-other"
              value={other}
              maxLength={140}
              onChange={(e) => setOther(e.target.value)}
              className="mt-1 w-full rounded-lg border-[1.5px] border-brand-border-strong p-3"
            />
          </>
        )}
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setRejecting(null)}>
            Cancel
          </Button>
          <Button variant="secondary" onClick={submitReject}>
            Set aside and replace
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
