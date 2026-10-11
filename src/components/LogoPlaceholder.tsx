/**
 * The official HIP logo could not be obtained or verified for this build, so this clearly
 * marked placeholder stands in for it. Replace it with the licensed asset; do not redraw it.
 */
export function LogoPlaceholder({ onDark = false }: { onDark?: boolean }) {
  return (
    <span
      className={`inline-flex h-9 items-center rounded-md border border-dashed px-2.5 text-[0.6875rem] font-semibold uppercase leading-none tracking-wider ${
        onDark ? "border-brand-on-primary-muted/70 text-brand-on-primary-muted" : "border-brand-border-strong text-brand-muted"
      }`}
      title="Placeholder: the official HIP logo was not available for this prototype"
    >
      HIP logo placeholder
    </span>
  );
}
