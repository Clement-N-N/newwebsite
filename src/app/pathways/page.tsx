import type { Metadata } from "next";
import { PathwaysExplorer } from "@/components/pathways/PathwaysExplorer";

export const metadata: Metadata = { title: "Explore your pathways" };

export default function PathwaysPage() {
  return <PathwaysExplorer />;
}
