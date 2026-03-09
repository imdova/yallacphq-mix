"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Check, Copy, Info, Lock, Upload, X, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { BANK, PRODUCT, STORAGE_KEY, type StoredCheckoutPayload } from "@/components/features/checkout/checkoutData";
import { useAuth } from "@/contexts/auth-context";
import { useCart } from "@/contexts/cart-context";
import { getPublicCourse } from "@/lib/dal/courses";
import { uploadBankTransferProof } from "@/lib/dal/upload";
import { createPaymentSession } from "@/lib/dal/orders";
import { getErrorMessage } from "@/lib/api/error";
import type { Course } from "@/types/course";
import { ROUTES } from "@/constants";

export function BankTransferView() {
  const router = useRouter();
  const { user, status } = useAuth();
  const { courseIds, clearCart, refreshCart } = useCart();

  const [cartCourses, setCartCourses] = React.useState<Course[]>([]);
  const [cartLoading, setCartLoading] = React.useState(true);
  const [storedPayload, setStoredPayload] = React.useState<StoredCheckoutPayload | null>(null);

  const [receiptFile, setReceiptFile] = React.useState<File | null>(null);
  const [checkoutError, setCheckoutError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const receiptInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as StoredCheckoutPayload;
      if (parsed && typeof parsed === "object") setStoredPayload(parsed);
    } catch {
      // ignore
    }
  }, []);

  React.useEffect(() => {
    if (courseIds.length === 0) {
      setCartCourses([]);
      setCartLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setCartLoading(true);
      const list: Course[] = [];
      for (const id of courseIds) {
        const c = await getPublicCourse(id);
        if (!cancelled && c) list.push(c);
      }
      if (!cancelled) setCartCourses(list);
      setCartLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [courseIds]);

  const cartTotal = React.useMemo(() => {
    return cartCourses.reduce((sum, c) => {
      const hasSale = c.priceSale != null && c.priceSale > 0 && (c.priceRegular ?? 0) > (c.priceSale ?? 0);
      const price = hasSale ? (c.priceSale ?? 0) : (c.priceRegular ?? 0);
      return sum + price;
    }, 0);
  }, [cartCourses]);

  const useCartCheckout = cartCourses.length > 0;
  const subtotal = useCartCheckout ? cartTotal : PRODUCT.price;
  const discountAmount = storedPayload?.discountAmount ?? 0;
  const promoCode = storedPayload?.promoCode ?? "";
  const total = Math.max(0, subtotal - discountAmount);

  const ACCEPTED_RECEIPT_TYPES = "image/*,.pdf";
  const MAX_RECEIPT_SIZE_MB = 10;
  const MAX_RECEIPT_BYTES = MAX_RECEIPT_SIZE_MB * 1024 * 1024;

  const handleReceiptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_RECEIPT_BYTES) return;
    setReceiptFile(file);
  };

  const clearReceipt = () => {
    setReceiptFile(null);
    if (receiptInputRef.current) receiptInputRef.current.value = "";
  };

  const [copiedField, setCopiedField] = React.useState<string | null>(null);

  const copyBankValue = (text: string, field: string) => {
    void navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1500);
  };

  const CopyButton = ({ value, field, ariaLabel }: { value: string; field: string; ariaLabel: string }) => (
    <button
      type="button"
      onClick={() => copyBankValue(value, field)}
      className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
      aria-label={ariaLabel}
    >
      {copiedField === field ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {copiedField === field ? "Copied" : "Copy"}
    </button>
  );

  const completeBankTransfer = async () => {
    setCheckoutError(null);

    if (status !== "authenticated" || !user) {
      router.push(`/auth/login?next=${encodeURIComponent(ROUTES.CHECKOUT)}`);
      return;
    }

    if (!receiptFile) {
      setCheckoutError("Please upload your bank transfer receipt to complete the order.");
      return;
    }

    if (!cartLoading && courseIds.length > 0 && cartCourses.length === 0) {
      setCheckoutError("Your cart is empty. Add courses from the catalog.");
      return;
    }

    setSubmitting(true);
    try {
      const { url } = await uploadBankTransferProof(receiptFile);

      await createPaymentSession({
        method: "bank",
        courseTitle: useCartCheckout ? `${cartCourses.length} course(s) from Yalla CPHQ` : PRODUCT.name,
        currency: "USD",
        amount: total,
        discountAmount: discountAmount || undefined,
        promoCode: promoCode.trim() || undefined,
        idempotencyKey: crypto.randomUUID(),
        ...(useCartCheckout && courseIds.length > 0 ? { courseIds } : undefined),
        bankTransferProofUrl: url,
      });

      if (useCartCheckout) {
        await clearCart();
        await refreshCart();
      }

      router.push("/dashboard/orders?from=checkout");
    } catch (e) {
      setCheckoutError(getErrorMessage(e, "Failed to complete bank transfer checkout"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 overflow-x-hidden w-full">
      <header className="sticky top-0 z-50 border-b border-zinc-200/80 bg-white/95 backdrop-blur-sm">
        <div className="container mx-auto w-full flex h-12 min-h-[3rem] items-center justify-between gap-2 px-3 sm:h-14 sm:gap-4 sm:px-4 md:px-6 xl:max-w-[90rem] 2xl:max-w-[100rem]">
          <Link href="/" className="flex shrink-0 items-center gap-2 min-w-0">
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

      <main className="flex-1 w-full px-3 py-6 sm:px-4 md:px-6 md:py-10">
        <div className="container mx-auto w-full xl:max-w-[90rem] 2xl:max-w-[100rem]">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-xs font-medium text-zinc-500">
                <Lock className="h-3 w-3" />
                Secure bank transfer checkout
              </p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">Bank Transfer</h1>
              <p className="mt-1 text-sm text-zinc-600 max-w-2xl">
                Transfer the exact amount below, then upload your receipt. We’ll activate your enrollment after confirmation
                (usually 1–3 business days).
              </p>
            </div>
            <Link
              href="/checkout"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              ← Back
            </Link>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)] lg:items-start">
            {/* Bank details */}
            <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold text-sm font-bold text-gold-foreground">
                    1
                  </span>
                  <h2 className="text-sm font-semibold text-zinc-900 sm:text-base">Bank details</h2>
                </div>
                <p className="text-xs text-zinc-500">Copy &amp; paste into your bank app</p>
              </div>

              <div className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50/40 p-3 sm:p-4">
                <div className="grid gap-3">
                  {[
                    { label: "Bank name", value: BANK.name, field: "bankName" },
                    { label: "Account holder", value: BANK.accountHolder, field: "accountHolder" },
                    { label: "IBAN", value: BANK.iban, field: "iban" },
                    { label: "SWIFT / BIC", value: BANK.swift, field: "swift" },
                  ].map((row) => (
                    <div
                      key={row.field}
                      className="flex flex-col gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">{row.label}</p>
                        <p className="mt-0.5 break-words text-sm font-semibold text-zinc-900">{row.value}</p>
                      </div>
                      <CopyButton value={row.value} field={row.field} ariaLabel={`Copy ${row.label}`} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                <Info className="h-4 w-4 shrink-0 mt-0.5" />
                <p>
                  Transfer the <span className="font-semibold">exact amount</span>. Enrollment is activated after confirmation.
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3">
                <p className="text-sm font-medium text-zinc-700">Amount to transfer</p>
                <p className="text-lg font-bold text-gold">${total.toFixed(2)}</p>
              </div>
              {discountAmount > 0 ? (
                <p className="mt-2 text-xs text-zinc-500">
                  Discount applied: <span className="font-medium text-zinc-700">-${discountAmount.toFixed(2)}</span>
                  {promoCode ? <span className="ml-1">({promoCode})</span> : null}
                </p>
              ) : null}
            </section>

            {/* Upload receipt */}
            <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900">Upload receipt</h2>
                  <p className="mt-1 text-xs text-zinc-500">
                    Accepted: PDF, JPG, PNG. Max size {MAX_RECEIPT_SIZE_MB} MB.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[10px] font-medium text-zinc-600">
                  <Lock className="h-2.5 w-2.5" />
                  Secure
                </span>
              </div>

              <p className="mt-3 text-xs text-zinc-400">{receiptFile ? receiptFile.name : "No file chosen"}</p>

              {!receiptFile ? (
                <label className="mt-3 flex min-h-[170px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-300 bg-white px-4 py-6 text-center transition hover:border-gold/50 hover:bg-amber-50/20">
                  <input
                    ref={receiptInputRef}
                    type="file"
                    accept={ACCEPTED_RECEIPT_TYPES}
                    onChange={handleReceiptChange}
                    className="sr-only"
                  />
                  <Upload className="h-8 w-8 text-zinc-400" />
                  <p className="mt-3 text-sm font-semibold text-zinc-700">Drop your receipt here, or click to browse</p>
                  <p className="mt-1 text-xs text-zinc-400">PDF or image up to {MAX_RECEIPT_SIZE_MB} MB</p>
                </label>
              ) : (
                <div className="mt-3 flex items-center gap-3 rounded-2xl border border-zinc-200 bg-zinc-50/40 px-4 py-3">
                  <FileText className="h-7 w-7 text-gold" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-zinc-900">{receiptFile.name}</p>
                    <p className="text-xs text-zinc-500">{(receiptFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-zinc-500 hover:text-zinc-900"
                    onClick={clearReceipt}
                    aria-label="Remove receipt"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {checkoutError ? (
                <div className={cn("mt-4 rounded-xl border px-3 py-2 text-sm", "border-rose-200 bg-rose-50 text-rose-800")}>
                  {checkoutError}
                </div>
              ) : null}

              <Button
                type="button"
                className="mt-4 h-11 w-full rounded-xl bg-gold text-sm font-semibold text-gold-foreground shadow-md hover:bg-gold/90"
                onClick={() => void completeBankTransfer()}
                disabled={submitting || !receiptFile}
              >
                {submitting ? "Processing…" : cartLoading ? "Loading…" : "Complete bank transfer"}
              </Button>
              <p className="mt-2 text-center text-xs text-zinc-400">
                You’ll be redirected to your orders after upload.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

