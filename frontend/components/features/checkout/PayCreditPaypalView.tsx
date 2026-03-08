"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Shield, ArrowLeft, CreditCard } from "lucide-react";
import { ROUTES } from "@/constants";
import { cn } from "@/lib/utils";
import { createPaymentSession, confirmPayment } from "@/lib/dal/orders";
import { getErrorMessage } from "@/lib/api/error";
import { useAuth } from "@/contexts/auth-context";
import type { Order } from "@/types/order";

const FALLBACK_ORDER_NAME = "CPHQ Mastery Bundle";

const PAYPAL_SCRIPT_ID = "paypal-sdk-script";

declare global {
  interface Window {
    initPayPalButton?: () => void;
    paypal?: {
      Buttons: (config: {
        style?: { shape?: string; color?: string; layout?: string; label?: string };
        createOrder?: (
          data: unknown,
          actions: { order: { create: (opts: unknown) => Promise<{ id: string }> } }
        ) => Promise<string>;
        onApprove?: (
          data: unknown,
          actions: { order: { capture: () => Promise<unknown> } }
        ) => Promise<void>;
        onError?: (err: unknown) => void;
      }) => { render: (selector: string) => Promise<void> };
    };
  }
}

export function PayCreditPaypalView() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, status } = useAuth();
  const method = searchParams.get("method") ?? "paypal";
  const promoCode = (searchParams.get("promo") ?? "").trim();
  const isPayPal = method === "paypal";
  const isCard = method === "card";

  const [paypalReady, setPaypalReady] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [order, setOrder] = React.useState<Order | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        if (status !== "authenticated" || !user) {
          router.push(`/auth/login?next=${encodeURIComponent("/pay-credit-paypal1?method=" + method)}`);
          return;
        }
        const session = await createPaymentSession({
          method: isPayPal ? "paypal" : "card",
          courseTitle: "CPHQ Mastery Bundle",
          currency: "USD",
          amount: 499,
          promoCode: promoCode || undefined,
          idempotencyKey: crypto.randomUUID(),
        });
        if (!cancelled) setOrder(session.order);
      } catch (e) {
        if (!cancelled) setError(getErrorMessage(e, "Failed to start payment session"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isPayPal, method, promoCode, router, status, user]);

  React.useEffect(() => {
    if (!isPayPal || typeof window === "undefined") return;

    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? "sb";

    const initPayPalButton = () => {
      if (!window.paypal || !document.getElementById("paypal-button-container")) return;
      window
        .paypal
        .Buttons({
          style: {
            layout: "vertical",
            color: "gold",
            shape: "rect",
            label: "paypal",
          },
          createOrder: function (
            _data: unknown,
            actions: { order: { create: (opts: unknown) => Promise<{ id: string }> } }
          ) {
            return actions.order
              .create({
                intent: "CAPTURE",
                purchase_units: [
                  {
                    amount: {
                      currency_code: "USD",
                      value: String(order?.amount ?? 499),
                    },
                  },
                ],
              })
              .then((order) => order.id);
          },
          onApprove: function (data: unknown) {
            const paypalOrderId =
              typeof data === "object" && data !== null && "orderID" in data
                ? String((data as { orderID: string }).orderID)
                : "";
            if (!order || !paypalOrderId) {
              const err = new Error("Missing PayPal order details.");
              setError("PayPal payment failed. Please try again or choose bank transfer.");
              return Promise.reject(err);
            }
            return confirmPayment({ orderId: order.id, transactionId: paypalOrderId })
              .then(() => {
                window.location.href = "/dashboard/orders";
              })
              .catch((err: unknown) => {
                setError(getErrorMessage(err, "PayPal payment failed. Please try again or choose bank transfer."));
                throw err;
              });
          },
          onError: function (err) {
            console.error("PayPal error:", err);
          },
        })
        .render("#paypal-button-container");
    }

    window.initPayPalButton = initPayPalButton;

    if (document.getElementById(PAYPAL_SCRIPT_ID)) {
      if (window.paypal) {
        initPayPalButton();
        setPaypalReady(true);
      }
      return;
    }

    const script = document.createElement("script");
    script.id = PAYPAL_SCRIPT_ID;
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&components=buttons&currency=USD`;
    script.async = true;
    script.onload = () => {
      if (window.initPayPalButton) {
        window.initPayPalButton();
      }
      setPaypalReady(true);
    };
    document.body.appendChild(script);

    return () => {
      const el = document.getElementById(PAYPAL_SCRIPT_ID);
      if (el) el.remove();
    };
  }, [isPayPal, order]);

  const total = order?.amount ?? 499;
  const orderName = order?.courseTitle ?? FALLBACK_ORDER_NAME;

  return (
    <div className="min-h-screen bg-zinc-100">
      <header className="sticky top-0 z-50 border-b border-zinc-200/80 bg-white/95 backdrop-blur-sm">
        <div className="container flex h-14 items-center justify-between px-4 md:px-6">
          <Link
            href={ROUTES.CHECKOUT}
            className="flex items-center gap-2 text-sm font-medium text-zinc-600 transition hover:text-zinc-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to checkout
          </Link>
          <span className="flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-600">
            <Lock className="h-3 w-3" />
            Secure payment
          </span>
        </div>
      </header>

      <main className="container px-4 py-8 md:px-6 md:py-12">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
              {isPayPal ? "Pay with PayPal" : "Credit card"}
            </h1>
            <p className="mt-2 text-zinc-600">
              Complete your payment for {order?.courseTitle ?? "CPHQ Mastery Bundle"}
            </p>
          </div>

          {error ? (
            <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
              {error}
            </div>
          ) : null}

          <div className="grid gap-8 sm:grid-cols-[1fr_320px] sm:gap-10">
            <div className="min-w-0">
              {isPayPal && (
                <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
                  <div className="flex items-center gap-3 rounded-xl bg-[#f5f5f5] p-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm">
                      <span className="text-lg font-bold text-[#003087]">Pay</span>
                      <span className="text-lg font-bold text-[#009cde]">Pal</span>
                    </div>
                    <div>
                      <p className="font-semibold text-zinc-900">PayPal checkout</p>
                      <p className="text-sm text-zinc-500">Pay securely with your PayPal account</p>
                    </div>
                  </div>
                  <div className="mt-6 min-h-[200px]">
                    {loading || !paypalReady ? (
                      <div className="flex min-h-[200px] items-center justify-center rounded-xl border-2 border-dashed border-zinc-200 bg-zinc-50/50">
                        <p className="text-sm text-zinc-500">{loading ? "Preparing checkout…" : "Loading PayPal…"}</p>
                      </div>
                    ) : null}
                    <div id="paypal-button-container" className={cn("min-h-[200px]", !paypalReady && "hidden")} />
                  </div>
                </div>
              )}

              {isCard && (
                <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
                  <div className="flex items-center gap-3 rounded-xl bg-zinc-50 p-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm">
                      <CreditCard className="h-6 w-6 text-zinc-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-zinc-900">Credit card</p>
                      <p className="text-sm text-zinc-500">Enter your card details below</p>
                    </div>
                  </div>
                  <form
                    className="mt-6 space-y-5"
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!order) return;
                      try {
                        await confirmPayment({ orderId: order.id });
                        router.push("/dashboard/orders");
                      } catch (e2) {
                        setError(getErrorMessage(e2, "Payment failed"));
                      }
                    }}
                  >
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-zinc-700">Card number</Label>
                      <Input
                        type="text"
                        placeholder="4242 4242 4242 4242"
                        className="h-11 rounded-xl border-zinc-200 bg-zinc-50/50 font-mono tracking-wider"
                        maxLength={19}
                      />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-zinc-700">Expiry</Label>
                        <Input
                          type="text"
                          placeholder="MM / YY"
                          className="h-11 rounded-xl border-zinc-200 bg-zinc-50/50 font-mono"
                          maxLength={7}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-zinc-700">CVC</Label>
                        <Input
                          type="text"
                          placeholder="123"
                          className="h-11 rounded-xl border-zinc-200 bg-zinc-50/50 font-mono"
                          maxLength={4}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-zinc-700">Name on card</Label>
                      <Input
                        type="text"
                        placeholder="John Doe"
                        className="h-11 rounded-xl border-zinc-200 bg-zinc-50/50"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="h-12 w-full rounded-xl bg-gold text-base font-semibold text-gold-foreground shadow-md hover:bg-gold/90"
                      disabled={loading || !order}
                    >
                      Pay ${Number(total).toFixed(2)}
                    </Button>
                  </form>
                </div>
              )}
            </div>

            <div className="order-first sm:order-none">
              <div className="sticky top-24 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
                  Order summary
                </h2>
              <p className="mt-3 font-medium text-zinc-900">{orderName}</p>
                <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-4">
                  <span className="font-medium text-zinc-700">Total</span>
                  <span className="text-xl font-bold text-gold">${Number(total).toFixed(2)}</span>
                </div>
                <div className="mt-4 flex items-center gap-2 text-xs text-zinc-500">
                  <Shield className="h-4 w-4 shrink-0" />
                  Secure 256-bit SSL encrypted
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
