import type { Metadata } from "next";
import { CphqForm1View } from "@/components/features/offers/CphqForm1View";

export const metadata: Metadata = {
  title: "CPHQ Form 1 | Yalla CPHQ",
  description: "Register your interest in CPHQ preparation with Yalla CPHQ.",
};

export default function CphqForm1Page() {
  return <CphqForm1View />;
}

