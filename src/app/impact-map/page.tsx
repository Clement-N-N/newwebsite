import type { Metadata } from "next";
import { ImpactMapPage } from "@/components/map/ImpactMapPage";

export const metadata: Metadata = { title: "Your Impact Map" };

export default function Page() {
  return <ImpactMapPage />;
}
