import type { Metadata } from "next";
import { CrossroadsFlow } from "@/components/crossroads/CrossroadsFlow";

export const metadata: Metadata = { title: "Career Crossroads" };

export default function CrossroadsPage() {
  return <CrossroadsFlow />;
}
