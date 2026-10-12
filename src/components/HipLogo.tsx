/* eslint-disable @next/next/no-img-element -- a tiny fixed-size raster; next/image adds nothing here */

/**
 * HIP's logo, cropped from a screenshot of highimpactprofessionals.org supplied for this
 * application. It is low resolution: replace public/brand/hip-logo-screenshot.png with the
 * official SVG before any wider use. Shown with "Concept for" so it is never read as HIP's own
 * product.
 */
export function HipLogo({ onDark = false }: { onDark?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`text-[0.6875rem] font-semibold uppercase tracking-wider ${onDark ? "text-brand-on-primary-muted" : "text-brand-muted"}`}>
        Concept for
      </span>
      <img src="/brand/hip-logo-screenshot.png" alt="High Impact Professionals" width={107} height={24} className="h-6 w-auto rounded-[2px]" />
    </span>
  );
}
