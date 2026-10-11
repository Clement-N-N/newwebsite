import type { Metadata } from "next";
import { LearningContinuation } from "@/components/learn/LearningContinuation";

export const metadata: Metadata = { title: "Learn the foundations" };

export default function LearnPage() {
  return <LearningContinuation />;
}
