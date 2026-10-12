import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "onDark" | "onDarkGhost";
type Size = "md" | "lg";

// Press feedback: scale 0.96 over 150ms ease-out, never on disabled buttons (better-ui).
const base =
  "inline-flex items-center justify-center gap-2 rounded-[var(--radius-button)] font-semibold transition-[background-color,color,box-shadow,scale,filter] duration-150 ease-out enabled:active:scale-[0.96] [&:is(a)]:active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-50 min-h-11 text-center";

const variants: Record<Variant, string> = {
  primary: "bg-accent-gradient text-brand-primary-deep font-bold hover:brightness-105 shadow-soft",
  secondary: "bg-brand-primary text-brand-on-primary hover:bg-brand-primary-deep",
  ghost: "border border-brand-border-strong bg-brand-background text-brand-primary hover:bg-brand-primary-soft",
  onDark: "bg-brand-on-primary text-brand-primary hover:bg-brand-primary-soft",
  onDarkGhost: "border border-brand-on-primary-muted/60 text-brand-on-primary hover:bg-white/10",
};

const sizes: Record<Size, string> = {
  md: "px-4 py-2.5 text-[0.9375rem]",
  lg: "px-6 py-3.5 text-base sm:text-lg",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", extra = "") {
  return `${base} ${variants[variant]} ${sizes[size]} ${extra}`;
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ComponentProps<"button"> & { variant?: Variant; size?: Size }) {
  return <button type="button" className={buttonClass(variant, size, className)} {...props} />;
}

export function LinkButton({
  href,
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: Omit<ComponentProps<typeof Link>, "className"> & { variant?: Variant; size?: Size; className?: string; children: ReactNode }) {
  return (
    <Link href={href} className={buttonClass(variant, size, className)} {...props}>
      {children}
    </Link>
  );
}
