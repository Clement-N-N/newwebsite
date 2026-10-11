"use client";

import Link from "next/link";
import { useMemo } from "react";
import { DISCOVER_QUESTIONS } from "@/lib/assessment/questions";
import { extractProfile } from "@/lib/engine/extract";
import { useLiveMap } from "@/lib/hooks/useLiveMap";
import { useAssessment } from "@/lib/state/AssessmentProvider";
import { ChapterIntro } from "../journey/ChapterIntro";
import { LinkButton } from "../ui/Button";
import { ImpactMap } from "./ImpactMap";

export function ImpactMapPage() {
  const { hydrated, responses, rejectedThemes, rejectTheme, restoreTheme } = useAssessment();
  const { map, profile } = useLiveMap();
  const labels = useMemo(
    () =>
      Object.fromEntries(
        (() => {
          const p = extractProfile(responses);
          return [...p.capabilities, ...p.motivations, ...p.causes].map((t) => [t.id, t.label]);
        })(),
      ),
    [responses],
  );

  if (!hydrated) return <div className="min-h-dvh bg-brand-surface" />;

  return (
    <div className="min-h-dvh bg-brand-surface pb-16 pt-24">
      <ChapterIntro chapterId="map" />
      <div className="container-page">
        <p className="type-eyebrow text-brand-accent-text">Your Living Impact Map</p>
        <h1 className="type-h1 mt-3 max-w-3xl text-brand-primary">Here&apos;s what we heard, and where it might lead.</h1>
        <p className="type-lede mt-4 max-w-2xl text-brand-muted">
          Every item comes from your answers. Select one to see why it&apos;s here. If something doesn&apos;t describe you, remove it and
          your results will change.
        </p>

        {!profile.complete && (
          <div className="mt-6 flex flex-col gap-3 rounded-xl bg-brand-warning-soft p-4 text-brand-warning sm:flex-row sm:items-center sm:justify-between">
            <p>
              {profile.required - profile.answered} required question{profile.required - profile.answered === 1 ? " is" : "s are"} still
              unanswered, so the map is incomplete.
            </p>
            <LinkButton href={DISCOVER_QUESTIONS.some((q) => !q.optional && !responses[q.id]) ? "/discover" : "/crossroads"} variant="secondary">
              Continue the assessment
            </LinkButton>
          </div>
        )}

        <div className="surface-card mt-8 p-5 sm:p-8">
          {map.nodes.length ? (
            <ImpactMap
              map={map}
              rejected={rejectedThemes}
              onReject={rejectTheme}
              onRestore={restoreTheme}
              rejectedLabels={labels}
            />
          ) : (
            <p className="text-brand-muted">
              Your map is empty so far. <Link href="/discover" className="font-semibold text-brand-primary underline">Start with Part 1</Link>.
            </p>
          )}
        </div>

        <div className="mt-8 flex flex-wrap justify-end gap-3">
          <LinkButton href="/crossroads" variant="ghost">
            Revisit the crossroads
          </LinkButton>
          {profile.complete && (
            <LinkButton href="/reveal" size="lg">
              Reveal your results
            </LinkButton>
          )}
        </div>
      </div>
    </div>
  );
}
