"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { createPaymentSession, confirmPayment } from "@/lib/dal/orders";
import { getErrorMessage } from "@/lib/api/error";
import {
  STORAGE_KEY,
  type StoredCheckoutPayload,
} from "@/components/features/checkout/checkoutData";

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? "";
const PAYPAL_SCRIPT_ID = "paypal-checkout-sdk";

declare global {
  interface Window {
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

export function CardPaymentView() {
  const router = useRouter();
  const [payload, setPayload] = React.useState<StoredCheckoutPayload | null>(null);
  const [paypalReady, setPaypalReady] = React.useState(false);
  const [paypalApproveUrl, setPaypalApproveUrl] = React.useState<string | null>(null);
  const [checkoutError, setCheckoutError] = React.useState<string | null>(null);
  const pendingPayPalOrderRef = React.useRef<{ id: string } | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as StoredCheckoutPayload;
      if (parsed && typeof parsed === "object") setPayload(parsed);
    } catch {
      // ignore
    }
  }, []);

  const initPayPalButton = React.useCallback(() => {
    if (typeof window === "undefined" || !window.paypal || !payload) return;
    const container = document.getElementById("paypal-button-container");
    if (!container) return;
    container.innerHTML = "";
    setPaypalReady(false);
    setCheckoutError(null);
    window.paypal
      .Buttons({
        style: {
          shape: "rect",
          color: "gold",
          layout: "vertical",
          label: "paypal",
        },
        createOrder: function (
          _data: unknown,
          actions: { order: { create: (opts: unknown) => Promise<{ id: string }> } }
        ) {
          setCheckoutError(null);
          return createPaymentSession({
            method: "paypal",
            courseTitle: payload.courseTitle,
            currency: "USD",
            amount: payload.total,
            discountAmount: payload.discountAmount || undefined,
            promoCode: payload.promoCode || undefined,
            idempotencyKey: crypto.randomUUID(),
            courseIds: payload.courseIds?.length ? payload.courseIds : undefined,
          })
            .then((res) => {
              pendingPayPalOrderRef.current = res.order;
              const origin = typeof window !== "undefined" ? window.location.origin : "";
              return actions.order.create({
                purchase_units: [
                  {
                    description: payload.courseTitle,
                    amount: { currency_code: "USD", value: payload.total.toFixed(2) },
                  },
                ],
                application_context: {
                  return_url: `${origin}/checkout/paypal-return?our_order_id=${encodeURIComponent(res.order.id)}`,
                  cancel_url: `${origin}/checkout?paypal_cancel=1`,
                },
              });
            })
            .then((order) => {
              const token =
                typeof order === "string"
                  ? order
                  : order && typeof order === "object" && "id" in order
                    ? String((order as { id: string }).id)
                    : "";
              if (token) {
                setPaypalApproveUrl(`https://www.paypal.com/checkoutnow?token=${token}`);
              }
              return typeof order === "string" ? order : ((order as { id: string })?.id ?? "");
            })
            .catch((err: unknown) => {
              setCheckoutError(
                getErrorMessage(
                  err,
                  "Could not start payment. Please try again or use bank transfer."
                )
              );
              throw err;
            });
        },
        onApprove: function (data: unknown) {
          const orderID =
            typeof data === "object" && data !== null && "orderID" in data
              ? String((data as { orderID: string }).orderID)
              : "";
          const order = pendingPayPalOrderRef.current;
          if (!order || !orderID) {
            const err = new Error("Missing PayPal order details.");
            setCheckoutError("PayPal payment failed. Please try again or choose bank transfer.");
            return Promise.reject(err);
          }
          return confirmPayment({ orderId: order.id, transactionId: orderID })
            .then(() => {
              router.push("/dashboard/orders?from=checkout");
            })
            .catch((err: unknown) => {
              setCheckoutError(
                getErrorMessage(
                  err,
                  "PayPal payment failed. Please try again or choose bank transfer."
                )
              );
              throw err;
            });
        },
        onError: function (err: unknown) {
          console.error("PayPal error:", err);
          setCheckoutError("PayPal payment failed. Please try again or choose bank transfer.");
        },
      })
      .render("#paypal-button-container")
      .then(() => setPaypalReady(true))
      .catch((err: unknown) => {
        console.error("PayPal render error:", err);
        setCheckoutError(getErrorMessage(err, "PayPal button could not load. Please try again."));
        setPaypalReady(true);
      });
  }, [router, payload]);

  React.useEffect(() => {
    if (!payload || typeof window === "undefined") return;
    if (!PAYPAL_CLIENT_ID) {
      setCheckoutError("Missing PayPal client id. Please configure NEXT_PUBLIC_PAYPAL_CLIENT_ID.");
      return;
    }
    const existing = document.getElementById(PAYPAL_SCRIPT_ID);
    if (existing) {
      if (window.paypal) initPayPalButton();
      return;
    }
    const script = document.createElement("script");
    script.id = PAYPAL_SCRIPT_ID;
    script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&intent=capture&currency=USD&enable-funding=venmo`;
    script.setAttribute("data-sdk-integration-source", "button-factory");
    script.async = true;
    script.onload = () => initPayPalButton();
    document.body.appendChild(script);
  }, [payload, initPayPalButton]);

  if (payload === null) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 p-6">
        <p className="text-zinc-600">Loading…</p>
        <Link href="/checkout" className="mt-4 text-sm text-gold hover:underline">
          ← Back to checkout
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col overflow-x-hidden bg-zinc-50">
      <header className="sticky top-0 z-50 border-b border-zinc-200/80 bg-white/95 backdrop-blur-sm">
        <div className="container mx-auto flex h-12 min-h-[3rem] w-full items-center justify-between gap-2 px-3 sm:h-14 sm:gap-4 sm:px-4 md:px-6 xl:max-w-[90rem] 2xl:max-w-[100rem]">
          <Link href="/" className="flex min-w-0 shrink-0 items-center gap-2">
            <span className="flex h-8 w-24 shrink-0 items-center justify-center rounded-sm bg-black text-xs font-bold tracking-[0.35em] text-white sm:h-9 sm:w-28">
              CPHQ
            </span>
          </Link>
          <div className="flex shrink-0 items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[10px] font-medium text-zinc-600 sm:gap-1.5 sm:px-2.5 sm:py-1 sm:text-xs">
              <Lock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              Secure
            </span>
          </div>
        </div>
      </header>

      <main className="w-full flex-1 px-3 py-6 sm:px-4 md:px-6 md:py-10">
        <div className="container mx-auto w-full max-w-xl xl:max-w-[90rem] 2xl:max-w-[100rem]">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-xs font-medium text-zinc-500">
                <Lock className="h-3 w-3" />
                Secure card payment
              </p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
                Card payment
              </h1>
              <p className="mt-1 text-sm text-zinc-600">
                Pay securely with PayPal or your card. Total:{" "}
                <span className="font-semibold text-gold">${payload.total.toFixed(2)}</span>
              </p>
            </div>
            <Link
              href="/checkout"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              ← Back
            </Link>
          </div>

          <div
            ref={containerRef}
            className="mt-8 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6"
          >
            <p className="flex items-center gap-2 text-sm text-zinc-500">
              <span className="inline-block h-5 w-5 rounded bg-[#ffc439]" aria-hidden />
              Pay securely with PayPal (cards supported)
            </p>
            {checkoutError ? (
              <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
                {checkoutError}
              </div>
            ) : null}
            {paypalApproveUrl ? (
              <div className="mt-4 rounded-lg border-2 border-gold bg-amber-50/50 p-3">
                <p className="mb-2 text-xs font-medium text-zinc-700">
                  Payment window didn&apos;t open? Use this link to pay:
                </p>
                <a
                  href={paypalApproveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg border-2 border-gold bg-gold px-4 py-3 text-sm font-semibold text-gold-foreground hover:bg-gold/90"
                >
                  Open PayPal to pay in new tab
                </a>
              </div>
            ) : null}
            <div className="relative mt-4 min-h-[220px]">
              <div id="paypal-button-container" className="min-h-[220px]" />
              {!paypalReady && !checkoutError && (
                <div className="absolute inset-0 flex items-center justify-center rounded-lg border-2 border-dashed border-zinc-200 bg-zinc-50/80 text-sm text-zinc-500 backdrop-blur-[1px]">
                  Loading PayPal…
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
