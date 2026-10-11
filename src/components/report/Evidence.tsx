"use client";

import { useId, useState } from "react";
import { QUESTION_BY_ID } from "@/lib/assessment/questions";
import type { EvidenceRef } from "@/lib/engine/schema";
import { SOURCES, isSourceId } from "@/lib/knowledge/sources";

export function questionLabel(id: string) {
  const q = QUESTION_BY_ID[id];
  if (!q) return id;
  if (q.type === "swipe") return `“${q.statement}”`;
  if (q.type === "scenario") return `Crossroads: ${q.title}`;
  return q.prompt;
}

/** A disclosure listing the answers (and sources) behind a claim. */
export function EvidenceToggle({
  evidence,
  sources = [],
  onDark = false,
  label = "Why we say this",
}: {
  evidence: EvidenceRef[];
  sources?: string[];
  onDark?: boolean;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const muted = onDark ? "text-brand-on-primary-muted" : "text-brand-muted";
  if (!evidence.length && !sources.length) return null;
  return (
    <div className="mt-3">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className={`inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold underline decoration-1 underline-offset-4 ${
          onDark ? "text-brand-on-primary" : "text-brand-primary"
        }`}
      >
        {label}
        <span aria-hidden className={`transition-transform ${open ? "rotate-180" : ""}`}>
          ▾
        </span>
      </button>
      <div id={id} hidden={!open} className={`mt-1 space-y-2 text-sm ${muted}`}>
        {evidence.length > 0 && (
          <ul className="space-y-1.5">
            {evidence.map((e, i) => (
              <li key={i}>
                <span className={onDark ? "text-brand-on-primary" : "text-brand-text"}>You said {e.quote}.</span> From: {questionLabel(e.questionId)}
              </li>
            ))}
          </ul>
        )}
        {sources.length > 0 && (
          <ul className="space-y-1.5">
            {sources.filter(isSourceId).map((s) => (
              <li key={s}>
                Background:{" "}
                <a href={SOURCES[s].url} target="_blank" rel="noreferrer" className="font-semibold underline underline-offset-2">
                  {SOURCES[s].publisher}, {SOURCES[s].title}
                </a>
                . {SOURCES[s].supports}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
