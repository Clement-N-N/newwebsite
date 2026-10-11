import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EvaluationsConsole } from "@/components/dev/EvaluationsConsole";

export const metadata: Metadata = { title: "Evaluation console (dev)", robots: { index: false } };
export const dynamic = "force-dynamic";

/**
 * Development-only review area. Hidden in production unless ENABLE_DEV_REVIEW=1 is set,
 * for example on a private preview deployment used for demos. It only ever shows fictional
 * profiles or the viewer's own in-browser session.
 */
export default function EvaluationsPage() {
  if (process.env.NODE_ENV === "production" && process.env.ENABLE_DEV_REVIEW !== "1") notFound();
  return <EvaluationsConsole />;
}
