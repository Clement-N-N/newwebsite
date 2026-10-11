"use client";

import { useLiveMap } from "@/lib/hooks/useLiveMap";
import { ImpactMap } from "../map/ImpactMap";

export function LiveMapPanel() {
  const { map } = useLiveMap();
  const themes = map.nodes.filter((n) => n.group !== "pathway").length;
  return (
    <div className="rounded-[var(--radius-card)] lg:sticky lg:top-20 border border-brand-border bg-brand-background p-5">
      <p className="type-eyebrow text-brand-accent-text">Your Living Impact Map</p>
      <p className="mt-1 text-sm text-brand-muted" aria-live="polite">
        {themes === 0 ? "Themes will appear here as you answer." : `${themes} theme${themes === 1 ? "" : "s"} so far, from your own answers.`}
      </p>
      <div className="mt-4">
        <ImpactMap map={map} compact caption="Live preview of your Impact Map" />
      </div>
    </div>
  );
}
