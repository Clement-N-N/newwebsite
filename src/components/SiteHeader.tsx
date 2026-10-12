"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { chapterForPath } from "@/lib/journey";
import { JourneyRail } from "./journey/JourneyRail";
import { HipLogo } from "./HipLogo";

function CompassMark() {
  return (
    <svg aria-hidden width="22" height="22" viewBox="0 0 24 24" className="shrink-0">
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M15.5 8.5 13.4 13.4 8.5 15.5 10.6 10.6z" fill="var(--brand-accent)" />
    </svg>
  );
}

const DARK_ROUTES = ["/", "/reveal", "/crossroads"];

export function SiteHeader() {
  const pathname = usePathname();
  const onDark = DARK_ROUTES.includes(pathname);
  const chapter = chapterForPath(pathname);
  return (
    <header className={`no-print absolute inset-x-0 top-0 z-30 ${onDark ? "text-brand-on-primary" : "text-brand-primary"}`}>
      <div className="container-page flex h-16 items-center justify-between gap-3">
        <div className="flex shrink-0 items-center gap-4">
          <span className="hidden md:inline-flex">
            <HipLogo onDark={onDark} />
          </span>
          <span aria-hidden className={`hidden h-6 w-px md:block ${onDark ? "bg-white/25" : "bg-brand-border"}`} />
          <Link href="/" className="flex items-center gap-2 rounded-md" aria-label="Impact Career Compass home">
            <CompassMark />
            <span className="font-display text-[0.9375rem] font-bold leading-tight">Impact Career Compass</span>
          </Link>
        </div>
        {chapter ? (
          <JourneyRail current={chapter} onDark={onDark} />
        ) : (
          <span className={`hidden text-xs font-semibold sm:block ${onDark ? "text-brand-on-primary-muted" : "text-brand-muted"}`}>
            Independent concept · Not an official HIP product
          </span>
        )}
      </div>
    </header>
  );
}
