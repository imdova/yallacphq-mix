import { Suspense } from "react";
import { PayCreditPaypalView } from "@/components/features/checkout/PayCreditPaypalView";

export const metadata = {
  title: "Complete Payment | Yalla CPHQ",
  description: "Complete your payment securely with credit card or PayPal.",
};

function PaymentFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center bg-zinc-50">
      <p className="text-zinc-500">Loading…</p>
    </div>
  );
}

export default function PayCreditPaypalPage() {
  return (
    <Suspense fallback={<PaymentFallback />}>
      <PayCreditPaypalView />
    </Suspense>
  );
}
