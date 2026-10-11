import type { ReactNode } from "react";

type Tone = "neutral" | "primary" | "accent" | "success" | "warning" | "onDark";

const tones: Record<Tone, string> = {
  neutral: "bg-brand-surface text-brand-muted border-brand-border",
  primary: "bg-brand-primary-soft text-brand-primary border-transparent",
  accent: "bg-brand-accent-soft text-brand-accent-text border-transparent",
  success: "bg-brand-success-soft text-brand-success border-transparent",
  warning: "bg-brand-warning-soft text-brand-warning border-transparent",
  onDark: "bg-white/10 text-brand-on-primary border-white/20",
};

export function Chip({ tone = "neutral", children, className = "" }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.8125rem] font-semibold leading-none ${tones[tone]} ${className}`}>
      {children}
    </span>
  );
}

/** Confidence is shown in words and a dot pattern, never colour alone. */
export function ConfidenceChip({ confidence, onDark = false }: { confidence: "strong" | "moderate" | "tentative"; onDark?: boolean }) {
  const filled = confidence === "strong" ? 3 : confidence === "moderate" ? 2 : 1;
  const label = confidence === "strong" ? "Strong evidence" : confidence === "moderate" ? "Some evidence" : "Tentative";
  return (
    <Chip tone={onDark ? "onDark" : confidence === "tentative" ? "warning" : "primary"}>
      <span aria-hidden className="flex gap-0.5">
        {[0, 1, 2].map((i) => (
          <span key={i} className={`h-1.5 w-1.5 rounded-full ${i < filled ? "bg-current" : "border border-current opacity-60"}`} />
        ))}
      </span>
      {label}
    </Chip>
  );
}
