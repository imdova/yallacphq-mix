"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { confirmPayment } from "@/lib/dal/orders";
import { getErrorMessage } from "@/lib/api/error";

function PayPalReturnContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = React.useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    const ourOrderId = searchParams.get("our_order_id");
    const token = searchParams.get("token");

    if (!ourOrderId || !token) {
      setStatus("error");
      setMessage("Missing payment details. Please try again from checkout.");
      return;
    }

    let cancelled = false;
    confirmPayment({ orderId: ourOrderId, transactionId: token })
      .then(() => {
        if (!cancelled) {
          setStatus("success");
          router.replace("/dashboard/courses");
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setStatus("error");
          setMessage(getErrorMessage(err, "Payment confirmation failed. Please contact support with your order details."));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-100 px-4">
      <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-8 shadow-sm text-center">
        {status === "loading" && (
          <>
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-gold border-t-transparent" />
            <p className="mt-4 text-zinc-600">Completing your payment…</p>
          </>
        )}
        {status === "success" && (
          <>
            <p className="text-zinc-900 font-medium">Payment successful. Redirecting to your courses…</p>
            <Link href="/dashboard/courses" className="mt-4 inline-block text-gold font-medium hover:underline">
              Go to My Courses →
            </Link>
          </>
        )}
        {status === "error" && (
          <>
            <p className="text-red-600 font-medium">Something went wrong</p>
            <p className="mt-2 text-sm text-zinc-600">{message}</p>
            <Link
              href="/checkout"
              className="mt-4 inline-block rounded-lg bg-gold px-4 py-2 text-sm font-medium text-gold-foreground hover:opacity-90"
            >
              Back to Checkout
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function PayPalReturnPage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-100 px-4">
        <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-8 shadow-sm text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-gold border-t-transparent" />
          <p className="mt-4 text-zinc-600">Loading…</p>
        </div>
      </div>
    }>
      <PayPalReturnContent />
    </React.Suspense>
  );
}
