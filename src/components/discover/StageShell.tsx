"use client";

import { ChevronLeft, Pause } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { useAssessment } from "@/lib/state/AssessmentProvider";
import { Button } from "../ui/Button";
import { Aurora } from "../fx/Aurora";
import { Dialog } from "../ui/Dialog";

/** Shared chrome for the assessment: part label, progress, back and pause. */
export function StageShell({
  part,
  position,
  total,
  onBack,
  backLabel = "Back",
  aside,
  dark = false,
  children,
}: {
  /** Deep-blue chapter treatment, used for the more cinematic crossroads. */
  dark?: boolean;
  part: string;
  position: number;
  total: number;
  onBack?: () => void;
  backLabel?: string;
  aside?: ReactNode;
  children: ReactNode;
}) {
  const router = useRouter();
  const { persist, setPersist } = useAssessment();
  const [paused, setPaused] = useState(false);
  const pct = Math.round((position / total) * 100);

  return (
    <div className={`relative isolate min-h-dvh pt-16 ${dark ? "bg-brand-primary text-brand-on-primary" : "bg-brand-surface"}`}>
      {dark && <Aurora tone="deep" className="!fixed" />}
      <div className="container-page pb-safe">
        <div className="flex items-center gap-3 py-3">
          <Button variant={dark ? "onDarkGhost" : "ghost"} onClick={onBack} disabled={!onBack} className="ps-2.5 pe-3" aria-label={backLabel}>
            <ChevronLeft size={18} strokeWidth={2} absoluteStrokeWidth aria-hidden />
            <span className="hidden sm:inline">Back</span>
          </Button>
          <div className="flex-1">
            <div className="flex items-baseline justify-between text-sm">
              <span className={`font-semibold ${dark ? "text-brand-on-primary" : "text-brand-primary"}`}>{part}</span>
              <span className={`tabular-nums ${dark ? "text-brand-on-primary-muted" : "text-brand-muted"}`}>
                {Math.min(position, total)} of {total}
              </span>
            </div>
            <div
              role="progressbar"
              aria-label={`${part} progress`}
              aria-valuemin={0}
              aria-valuemax={total}
              aria-valuenow={Math.min(position, total)}
              aria-valuetext={`${Math.min(position, total)} of ${total}`}
              className={`mt-1.5 h-1.5 overflow-hidden rounded-full ${dark ? "bg-white/15" : "bg-brand-border"}`}
            >
              <div className="h-full rounded-full bg-brand-accent transition-[width] duration-500 ease-out" style={{ width: `${pct}%` }} />
            </div>
          </div>
          <Button variant={dark ? "onDarkGhost" : "ghost"} onClick={() => setPaused(true)} className="ps-2.5 pe-3" aria-label="Pause">
            <Pause size={16} strokeWidth={2} absoluteStrokeWidth aria-hidden />
            <span className="hidden sm:inline">Pause</span>
          </Button>
        </div>

        <div className={`grid gap-8 pb-28 pt-2 md:pb-10 ${aside ? "lg:grid-cols-[minmax(0,1fr)_22rem] xl:grid-cols-[minmax(0,1fr)_26rem]" : ""}`}>
          <div className="mx-auto w-full max-w-2xl">{children}</div>
          {aside && <aside className="mx-auto hidden w-full max-w-2xl md:block lg:max-w-none">{aside}</aside>}
        </div>
      </div>

      <Dialog open={paused} onClose={() => setPaused(false)} title="Paused">
        <p className="text-brand-muted">
          Take your time. Your answers are kept while this tab is open, and you can change any of them later.
        </p>
        <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl bg-brand-surface p-4">
          <input type="checkbox" className="mt-1 h-5 w-5 accent-[var(--brand-primary)]" checked={persist} onChange={(e) => setPersist(e.target.checked)} />
          <span>
            <span className="font-semibold">Remember my answers on this device</span>
            <span className="block text-sm text-brand-muted">
              Stored only in this browser&apos;s local storage. You can delete them from your Impact Passport at any time.
            </span>
          </span>
        </label>
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <Button variant="ghost" onClick={() => router.push("/")}>
            Leave for now
          </Button>
          <Button variant="secondary" onClick={() => setPaused(false)}>
            Resume
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
