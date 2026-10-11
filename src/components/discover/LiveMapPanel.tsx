"use client";

import { useLiveMap } from "@/lib/hooks/useLiveMap";
import { ImpactMap } from "../map/ImpactMap";

export function LiveMapPanel({ onDark = false }: { onDark?: boolean }) {
  const { map } = useLiveMap();
  const themes = map.nodes.filter((n) => n.group !== "pathway").length;
  return (
    <div className={`p-5 lg:sticky lg:top-20 ${onDark ? "surface-dark" : "surface-card"}`}>
      <p className={`type-eyebrow ${onDark ? "text-brand-accent-on-dark" : "text-brand-accent-text"}`}>Your Living Impact Map</p>
      <p className={`mt-1 text-sm ${onDark ? "text-brand-on-primary-muted" : "text-brand-muted"}`} aria-live="polite">
        {themes === 0 ? "Themes will appear here as you answer." : `${themes} theme${themes === 1 ? "" : "s"} so far, from your own answers.`}
      </p>
      <div className="mt-4">
        <ImpactMap map={map} compact onDark={onDark} caption="Live preview of your Impact Map" />
      </div>
    </div>
  );
}
