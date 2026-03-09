import type { Metadata } from "next";
import { CphqForm2View } from "@/components/features/offers/CphqForm2View";

export const metadata: Metadata = {
  title: "CPHQ Form 2 | Yalla CPHQ",
  description: "Get your CPHQ plan and resources from Yalla CPHQ.",
};

export default function CphqForm2Page() {
  return <CphqForm2View />;
}

