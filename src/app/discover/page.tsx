import type { Metadata } from "next";
import { DiscoverFlow } from "@/components/discover/DiscoverFlow";

export const metadata: Metadata = { title: "Swipe Discovery" };

export default function DiscoverPage() {
  return <DiscoverFlow />;
}
