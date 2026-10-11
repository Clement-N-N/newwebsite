import type { Metadata } from "next";
import { ImpactPassport } from "@/components/passport/ImpactPassport";

export const metadata: Metadata = { title: "Your Impact Passport" };

export default function PassportPage() {
  return <ImpactPassport />;
}
