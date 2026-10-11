import type { Metadata } from "next";
import { ResultsReveal } from "@/components/report/ResultsReveal";

export const metadata: Metadata = { title: "Your results" };

export default function RevealPage() {
  return <ResultsReveal />;
}
