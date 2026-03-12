import { Suspense } from "react";
import { CheckoutView } from "@/components/features/checkout/CheckoutView";

export const metadata = {
  title: "Secure Checkout | Yalla CPHQ",
  description: "Complete your enrollment in the CPHQ Mastery Bundle. Your access will be granted immediately after payment.",
};

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-50" />}>
      <CheckoutView />
    </Suspense>
  );
}
