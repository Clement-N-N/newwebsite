"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoPlaceholder } from "./LogoPlaceholder";

const DARK_ROUTES = ["/", "/reveal"];

export function SiteHeader() {
  const pathname = usePathname();
  const onDark = DARK_ROUTES.includes(pathname);
  return (
    <header
      className={`no-print absolute inset-x-0 top-0 z-30 ${onDark ? "text-brand-on-primary" : "text-brand-primary"}`}
    >
      <div className="container-page flex h-16 items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-3 rounded-md" aria-label="Impact Start home">
          <LogoPlaceholder onDark={onDark} />
          <span className="font-display text-base font-extrabold tracking-tight">Impact Start</span>
        </Link>
        <span
          className={`hidden text-xs font-semibold sm:block ${onDark ? "text-brand-on-primary-muted" : "text-brand-muted"}`}
        >
          Independent concept · Not an official HIP product
        </span>
      </div>
    </header>
  );
}
