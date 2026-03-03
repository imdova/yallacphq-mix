"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CreditCard,
  Building2,
  Lock,
  Info,
  Copy,
  Check,
  Shield,
  Mail,
  Instagram,
  Building,
  BadgeCheck,
  BookOpen,
  Upload,
  FileText,
  X,
} from "lucide-react";
import { ROUTES } from "@/constants";
import { cn } from "@/lib/utils";
import { createPaymentSession } from "@/lib/dal/orders";
import { getErrorMessage } from "@/lib/api/error";
import { useAuth } from "@/contexts/auth-context";
import { validatePromoCode } from "@/lib/dal/promo-codes";

const FLAG_CDN = "https://flagcdn.com";
const COUNTRY_CODES = [
  { value: "+20", label: "+20", name: "Egypt", cc: "eg" },
  { value: "+966", label: "+966", name: "Saudi Arabia", cc: "sa" },
  { value: "+971", label: "+971", name: "UAE", cc: "ae" },
  { value: "+968", label: "+968", name: "Oman", cc: "om" },
  { value: "+973", label: "+973", name: "Bahrain", cc: "bh" },
  { value: "+974", label: "+974", name: "Qatar", cc: "qa" },
  { value: "+965", label: "+965", name: "Kuwait", cc: "kw" },
  { value: "+962", label: "+962", name: "Jordan", cc: "jo" },
  { value: "+961", label: "+961", name: "Lebanon", cc: "lb" },
  { value: "+964", label: "+964", name: "Iraq", cc: "iq" },
  { value: "+1", label: "+1", name: "USA", cc: "us" },
  { value: "+1-ca", label: "+1", name: "Canada", cc: "ca" },
  { value: "+61", label: "+61", name: "Australia", cc: "au" },
  { value: "+44", label: "+44", name: "Britain", cc: "gb" },
];

const PRODUCT = {
  name: "CPHQ Mastery Bundle",
  subtitle: "Full Access + Exam Simulator",
  price: 499,
  reference: "CPHQ-ORDER-9921",
};

const UPSELL = {
  name: "CPHQ Complete Study Guide",
  edition: "Physical Edition",
  price: 29,
  description:
    "Get the 450-page physical handbook delivered to your door. Perfect for offline studying and quick referencing.",
  socialProof: "78% of students add this to their order",
};

const BANK = {
  name: "Global Healthcare Bank",
  accountHolder: "Yalla CPHQ Learning LTD",
  iban: "AE84 0000 1234 5678 9012 345",
  swift: "GHB UAE 2X",
};

type PaymentMethod = "paypal_card" | "bank";

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? "";
const PAYPAL_SCRIPT_ID = "paypal-checkout-sdk";

declare global {
  interface Window {
    paypal?: {
      Buttons: (config: {
        style?: { shape?: string; color?: string; layout?: string; label?: string };
        createOrder?: (data: unknown, actions: { order: { create: (opts: unknown) => Promise<{ id: string }> } }) => Promise<string>;
        onApprove?: (data: unknown, actions: { order: { capture: () => Promise<unknown> } }) => Promise<void>;
        onError?: (err: unknown) => void;
      }) => { render: (selector: string) => Promise<void> };
    };
    initPayPalButton?: () => void;
  }
}

export function CheckoutView() {
  const router = useRouter();
  const { user, status } = useAuth();
  const [payment, setPayment] = React.useState<PaymentMethod>("bank");
  const [paypalReady, setPaypalReady] = React.useState(false);
  const [discountCode, setDiscountCode] = React.useState("");
  const [promoStatus, setPromoStatus] = React.useState<"idle" | "valid" | "invalid" | "loading">("idle");
  const [promoMessage, setPromoMessage] = React.useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = React.useState(0);
  const [addUpsell, setAddUpsell] = React.useState(false);
  const [countryCode, setCountryCode] = React.useState("+20");
  const [phone, setPhone] = React.useState("");
  const [receiptFile, setReceiptFile] = React.useState<File | null>(null);
  const [checkoutError, setCheckoutError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const receiptInputRef = React.useRef<HTMLInputElement>(null);

  const ACCEPTED_RECEIPT_TYPES = "image/*,.pdf";
  const MAX_RECEIPT_SIZE_MB = 10;
  const MAX_RECEIPT_BYTES = MAX_RECEIPT_SIZE_MB * 1024 * 1024;

  const handleReceiptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_RECEIPT_BYTES) {
      return; // could show toast; for now just ignore
    }
    setReceiptFile(file);
  };

  const clearReceipt = () => {
    setReceiptFile(null);
    if (receiptInputRef.current) receiptInputRef.current.value = "";
  };

  React.useEffect(() => {
    if (payment !== "paypal_card" || typeof window === "undefined") return;

    function initPayPalButton() {
      if (!window.paypal || !document.getElementById("paypal-button-container")) return;
      const container = document.getElementById("paypal-button-container");
      if (!container) return;
      container.innerHTML = "";
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
            return actions.order
              .create({
                purchase_units: [
                  {
                    description: "CPHQ PLUS DIPLOMA IN HEALTHCARE QUALITY 450",
                    amount: { currency_code: "USD", value: "450" },
                  },
                ],
              })
              .then((order) => order.id);
          },
          onApprove: function (_data: unknown, actions: { order: { capture: () => Promise<unknown> } }) {
            return actions.order.capture().then(function () {
              const element = document.getElementById("paypal-button-container");
              if (element) {
                element.innerHTML = "";
                element.innerHTML =
                  '<h3 class="text-lg font-semibold text-green-600">Thank you for your payment!</h3>';
              }
            });
          },
          onError: function (err: unknown) {
            console.error("PayPal error:", err);
            setCheckoutError("PayPal payment failed. Please try again or choose bank transfer.");
          },
        })
        .render("#paypal-button-container");
    }

    if (document.getElementById(PAYPAL_SCRIPT_ID)) {
      if (window.paypal) {
        initPayPalButton();
        setPaypalReady(true);
      }
      return;
    }

    const script = document.createElement("script");
    script.id = PAYPAL_SCRIPT_ID;
    if (!PAYPAL_CLIENT_ID) {
      setCheckoutError("Missing PayPal client id. Please configure NEXT_PUBLIC_PAYPAL_CLIENT_ID.");
      return;
    }
    script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&enable-funding=venmo&currency=USD`;
    script.setAttribute("data-sdk-integration-source", "button-factory");
    script.async = true;
    script.onload = () => {
      initPayPalButton();
      setPaypalReady(true);
    };
    document.body.appendChild(script);

    return () => {
      const el = document.getElementById(PAYPAL_SCRIPT_ID);
      if (el) el.remove();
      setPaypalReady(false);
    };
  }, [payment]);

  const [copiedField, setCopiedField] = React.useState<string | null>(null);

  const copyBankValue = (text: string, field: string) => {
    void navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const CopyButton = ({ value, field, ariaLabel }: { value: string; field: string; ariaLabel: string }) => (
    <button
      type="button"
      onClick={() => copyBankValue(value, field)}
      className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-700"
      aria-label={ariaLabel}
    >
      {copiedField === field ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
    </button>
  );

  const subtotal = PRODUCT.price;
  const upsellTotal = addUpsell ? UPSELL.price : 0;
  const preDiscountTotal = subtotal + upsellTotal;
  const total = Math.max(0, preDiscountTotal - discountAmount);

  const applyPromo = async () => {
    const code = discountCode.trim();
    if (!code) {
      setPromoStatus("idle");
      setPromoMessage(null);
      setDiscountAmount(0);
      return;
    }
    setPromoStatus("loading");
    setPromoMessage(null);
    try {
      // Checkout is currently for a single bundle product. Use a stable courseId placeholder for validation.
      const res = await validatePromoCode("bundle-cphq", code);
      setDiscountAmount(res.discountAmount);
      setPromoStatus("valid");
      setPromoMessage(`Promo applied: -$${res.discountAmount.toFixed(2)}`);
    } catch (e) {
      setDiscountAmount(0);
      setPromoStatus("invalid");
      setPromoMessage(getErrorMessage(e, "Invalid promo code"));
    }
  };

  const completeBankCheckout = async () => {
    setCheckoutError(null);
    if (status !== "authenticated" || !user) {
      router.push(`/auth/login?next=${encodeURIComponent(ROUTES.CHECKOUT)}`);
      return;
    }
    setSubmitting(true);
    try {
      await createPaymentSession({
        method: "bank",
        courseTitle: PRODUCT.name,
        currency: "USD",
        amount: total,
        discountAmount: discountAmount || undefined,
        promoCode: discountCode.trim() || undefined,
        idempotencyKey: crypto.randomUUID(),
      });
      router.push("/dashboard/orders");
    } catch (e) {
      setCheckoutError(getErrorMessage(e, "Failed to start checkout"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-100">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-zinc-200/80 bg-white/95 backdrop-blur-sm">
        <div className="container flex h-14 items-center justify-between gap-4 px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold text-gold-foreground font-bold">
              Y
            </span>
            <span className="font-semibold text-zinc-900">Yalla CPHQ</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-zinc-600 sm:flex">
            <Link href="/courses" className="hover:text-zinc-900">Courses</Link>
            <Link href="/courses" className="hover:text-zinc-900">Resources</Link>
            <Link href="/dashboard/support" className="hover:text-zinc-900">Support</Link>
          </nav>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-600">
              <Lock className="h-3 w-3" />
              Secure
            </span>
          </div>
        </div>
      </header>

      {/* Breadcrumbs */}
      <div className="border-b border-zinc-200 bg-white px-4 py-2.5 md:px-6">
        <div className="container flex flex-wrap items-center gap-2 text-sm">
          <Link href="/" className="text-zinc-500 hover:text-zinc-900">Home</Link>
          <span className="text-zinc-300">/</span>
          <Link href={ROUTES.COURSE_DETAILS} className="text-zinc-500 hover:text-zinc-900">
            CPHQ Mastery Bundle
          </Link>
          <span className="text-zinc-300">/</span>
          <span className="font-medium text-gold">Checkout</span>
        </div>
      </div>

      {/* Main */}
      <main className="flex-1 px-4 py-6 sm:py-8 md:px-6 md:py-10">
        <div className="container grid gap-8 lg:grid-cols-[1fr_400px] lg:gap-12">
          {/* Left: Checkout form */}
          <div className="min-w-0 space-y-8">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
                Secure Checkout
              </h1>
              <p className="mt-2 text-zinc-600">
                Complete your enrollment in the CPHQ Mastery Bundle. Your access will be granted
                immediately after payment.
              </p>
            </div>

            <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
              {/* 1. Account Details */}
              <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold text-sm font-bold text-gold-foreground">
                    1
                  </span>
                  <h2 className="text-lg font-semibold text-zinc-900">Account Details</h2>
                </div>
                <div className="mt-5 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-zinc-700">Full Name</Label>
                      <Input
                        type="text"
                        defaultValue="John Doe"
                        className="h-11 rounded-xl border-zinc-200 bg-zinc-50/50 focus:bg-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-zinc-700">Email Address</Label>
                      <Input
                        type="email"
                        defaultValue="john@example.com"
                        className="h-11 rounded-xl border-zinc-200 bg-zinc-50/50 focus:bg-white"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-zinc-700">Phone Number</Label>
                    <div className="flex gap-2">
                      <Select value={countryCode} onValueChange={setCountryCode}>
                        <SelectTrigger className="h-11 w-[130px] shrink-0 rounded-xl border-zinc-200 bg-zinc-50/50 focus:bg-white sm:w-[140px]">
                          <SelectValue>
                            {(() => {
                              const cur = COUNTRY_CODES.find((c) => c.value === countryCode);
                              return cur ? (
                                <span className="flex items-center gap-2">
                                  <Image
                                    src={`${FLAG_CDN}/24x18/${cur.cc}.png`}
                                    alt=""
                                    width={24}
                                    height={18}
                                    className="shrink-0 rounded-sm object-cover"
                                  />
                                  <span className="font-medium text-zinc-900">{cur.label}</span>
                                </span>
                              ) : (
                                countryCode
                              );
                            })()}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {COUNTRY_CODES.map(({ value, label, name, cc }) => (
                            <SelectItem key={value} value={value}>
                              <span className="flex items-center gap-2">
                                <Image
                                  src={`${FLAG_CDN}/24x18/${cc}.png`}
                                  alt=""
                                  width={24}
                                  height={18}
                                  className="shrink-0 rounded-sm object-cover"
                                />
                                <span>{label} {name}</span>
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        type="tel"
                        placeholder="555 123 4567"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="h-11 min-w-0 flex-1 rounded-xl border-zinc-200 bg-zinc-50/50 focus:bg-white"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* 2. Payment Method */}
              <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold text-sm font-bold text-gold-foreground">
                    2
                  </span>
                  <h2 className="text-lg font-semibold text-zinc-900">Payment Method</h2>
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setPayment("paypal_card")}
                    className={cn(
                      "flex items-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all",
                      payment === "paypal_card"
                        ? "border-gold bg-gold/10 text-gold ring-2 ring-gold/20"
                        : "border-zinc-200 bg-zinc-50/50 text-zinc-700 hover:border-zinc-300 hover:bg-zinc-100"
                    )}
                  >
                    <CreditCard className="h-4 w-4" />
                    PayPal or Card
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayment("bank")}
                    className={cn(
                      "flex items-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all",
                      payment === "bank"
                        ? "border-gold bg-gold text-gold-foreground ring-2 ring-gold/20"
                        : "border-zinc-200 bg-zinc-50/50 text-zinc-700 hover:border-zinc-300 hover:bg-zinc-100"
                    )}
                  >
                    <Building2 className="h-4 w-4" />
                    Bank Transfer
                  </button>
                </div>

                {payment === "paypal_card" && (
                  <div id="smart-button-container" className="mt-5 rounded-xl border border-zinc-200 bg-white p-6">
                    <h3 className="text-base font-bold text-zinc-900">PayPal checkout</h3>
                    <p className="mt-1 flex items-center gap-2 text-sm text-zinc-500">
                      <span className="inline-block h-5 w-5 rounded bg-[#ffc439]" aria-hidden />
                      Pay securely with your PayPal account
                    </p>
                    <div className="mt-4">
                      <div className="text-center">
                        <div id="paypal-button-container" className="min-h-[220px]" />
                      </div>
                    </div>
                    {!paypalReady && (
                      <div className="flex min-h-[180px] items-center justify-center rounded-lg border-2 border-dashed border-zinc-200 bg-zinc-50/50 text-sm text-zinc-500">
                        Loading PayPal…
                      </div>
                    )}
                    <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-zinc-400">
                      <span className="inline-block h-4 w-5 rounded bg-[#ffc439]" aria-hidden />
                      Supported by PayPal
                    </p>
                  </div>
                )}

                {payment === "bank" && (
                  <div className="mt-5 rounded-xl border-2 border-dashed border-gold/50 bg-amber-50/30 p-5">
                    <div className="flex flex-col gap-5 md:flex-row md:items-start md:gap-6">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
                          <Info className="h-4 w-4 text-gold" />
                          Official Bank Account Details
                        </div>
                        <dl className="mt-4 space-y-2 text-sm">
                          <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                            <dt className="text-zinc-500">BANK NAME</dt>
                            <dd className="flex items-center gap-2 font-medium text-zinc-900">
                              {BANK.name}
                              <CopyButton value={BANK.name} field="name" ariaLabel="Copy bank name" />
                            </dd>
                          </div>
                          <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                            <dt className="text-zinc-500">ACCOUNT HOLDER</dt>
                            <dd className="flex items-center gap-2 font-medium text-zinc-900">
                              {BANK.accountHolder}
                              <CopyButton value={BANK.accountHolder} field="accountHolder" ariaLabel="Copy account holder" />
                            </dd>
                          </div>
                          <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                            <dt className="text-zinc-500">IBAN</dt>
                            <dd className="flex items-center gap-2 font-medium text-zinc-900">
                              {BANK.iban}
                              <CopyButton value={BANK.iban} field="iban" ariaLabel="Copy IBAN" />
                            </dd>
                          </div>
                          <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                            <dt className="text-zinc-500">SWIFT / BIC</dt>
                            <dd className="flex items-center gap-2 font-medium text-zinc-900">
                              {BANK.swift}
                              <CopyButton value={BANK.swift} field="swift" ariaLabel="Copy SWIFT/BIC" />
                            </dd>
                          </div>
                          <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                            <dt className="text-zinc-500">REFERENCE</dt>
                            <dd className="flex items-center gap-2 font-medium text-zinc-900">
                              {PRODUCT.reference}
                              <CopyButton value={PRODUCT.reference} field="reference" ariaLabel="Copy reference" />
                            </dd>
                          </div>
                        </dl>
                        <p className="mt-4 text-xs text-zinc-500">
                          * Enrollment will be activated manually once the transfer is confirmed (usually
                          1–3 business days).
                        </p>
                      </div>
                      <div className="min-w-0 shrink-0 md:w-[280px] lg:w-[300px]">
                        <Label className="text-sm font-semibold text-zinc-900">
                          Attach payment receipt
                        </Label>
                        <p className="mt-1 text-xs text-zinc-500">
                          Upload your transfer receipt (PDF or image, max {MAX_RECEIPT_SIZE_MB} MB) to complete your order.
                        </p>
                        {!receiptFile ? (
                          <label className="mt-3 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-300 bg-white py-6 transition hover:border-gold/50 hover:bg-amber-50/20">
                            <input
                              ref={receiptInputRef}
                              type="file"
                              accept={ACCEPTED_RECEIPT_TYPES}
                              onChange={handleReceiptChange}
                              className="sr-only"
                            />
                            <Upload className="h-8 w-8 text-zinc-400" />
                            <span className="mt-2 text-sm font-medium text-zinc-600">
                              Choose file or drag and drop
                            </span>
                            <span className="mt-0.5 text-xs text-zinc-400">
                              PDF, JPG, PNG up to {MAX_RECEIPT_SIZE_MB} MB
                            </span>
                          </label>
                        ) : (
                          <div className="mt-3 flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3">
                            <FileText className="h-8 w-8 shrink-0 text-gold" />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-zinc-900">
                                {receiptFile.name}
                              </p>
                              <p className="text-xs text-zinc-500">
                                {(receiptFile.size / 1024).toFixed(1)} KB
                              </p>
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
                      </div>
                    </div>
                  </div>
                )}
              </section>

              {/* Upsell: Hardcopy Study Guide (dark) */}
              <section className="relative overflow-hidden rounded-2xl border-2 border-gold/40 bg-zinc-900 p-5 shadow-lg sm:p-6 dark:border-gold/50 dark:bg-zinc-950">
                <span className="absolute right-0 top-0 rounded-bl-lg bg-gold px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-zinc-900">
                  Limited Time Offer
                </span>
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
                  <div className="flex shrink-0 flex-col items-center sm:items-start">
                    <div className="relative">
                      <div className="flex h-24 w-20 items-center justify-center rounded-lg border border-zinc-600 bg-zinc-800 sm:h-28 sm:w-24">
                        <BookOpen className="h-10 w-10 text-gold sm:h-12 sm:w-12" />
                      </div>
                      <span className="absolute -bottom-1 -right-1 rounded-md border border-gold/50 bg-gold px-2 py-0.5 text-sm font-bold text-zinc-900">
                        $29
                      </span>
                    </div>
                    <p className="mt-2 text-center text-xs font-semibold uppercase tracking-wide text-zinc-200 sm:text-left">
                      {UPSELL.name}
                    </p>
                    <p className="text-xs text-zinc-400">Physical Edition</p>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-bold text-white sm:text-xl">
                      Add a Hardcopy Study Guide for only{" "}
                      <span className="text-gold">$29!</span>
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-300">
                      {UPSELL.description}
                    </p>
                    <div className="mt-4 flex items-center gap-2">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((i) => (
                          <span
                            key={i}
                            className={cn(
                              "h-2 w-2 rounded-full",
                              i === 4 ? "bg-gold" : "bg-zinc-600"
                            )}
                            aria-hidden
                          />
                        ))}
                      </div>
                      <p className="text-sm italic text-zinc-400">
                        &ldquo;{UPSELL.socialProof}&rdquo;
                      </p>
                    </div>
                    <label className="mt-5 flex cursor-pointer items-start gap-3 sm:items-center">
                      <Checkbox
                        checked={addUpsell}
                        onCheckedChange={(v) => setAddUpsell(v === true)}
                        className="h-5 w-5 rounded border-2 border-gold bg-transparent data-[state=checked]:bg-gold data-[state=checked]:text-gold-foreground"
                      />
                      <span className="text-sm font-medium text-zinc-200">
                        Yes! Add this to my order for{" "}
                        <span className="font-bold text-gold">${UPSELL.price.toFixed(2)}</span>
                      </span>
                    </label>
                  </div>
                </div>
              </section>

              {/* 30-Day Guarantee */}
              <div className="rounded-2xl border border-gold/30 bg-gold/5 p-5 sm:p-6">
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold/20">
                    <Check className="h-5 w-5 text-gold" />
                  </div>
                  <div>
                    <p className="font-semibold text-zinc-900">30-Day Money Back Guarantee</p>
                    <p className="mt-1 text-sm text-zinc-600">
                      If you&apos;re not satisfied, we&apos;ll refund your payment, no questions asked.
                    </p>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Right: Order summary sidebar */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-lg sm:p-6">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold text-gold-foreground font-bold text-sm">
                  Y
                </span>
                <span className="text-sm font-semibold uppercase tracking-wider text-zinc-900">
                  Order Summary
                </span>
              </div>
              <ul className="mt-6 space-y-3">
                <li>
                  <p className="font-medium text-zinc-900">{PRODUCT.name}</p>
                  <p className="text-sm text-zinc-500">{PRODUCT.subtitle}</p>
                  <p className="mt-1 font-semibold text-zinc-900">
                    ${PRODUCT.price.toFixed(2)}
                  </p>
                </li>
                {addUpsell && (
                  <li className="flex items-start justify-between gap-2 border-t border-zinc-100 pt-3">
                    <div>
                      <p className="font-medium text-zinc-900">{UPSELL.name}</p>
                      <p className="text-sm text-zinc-500">{UPSELL.edition}</p>
                    </div>
                    <span className="font-semibold text-gold">
                      ${UPSELL.price.toFixed(2)}
                    </span>
                  </li>
                )}
                <li className="flex justify-between text-sm">
                  <span className="text-zinc-500">Platform Fee</span>
                  <span className="text-zinc-500">$0.00</span>
                </li>
              </ul>
              <div className="mt-5 flex gap-2">
                <Input
                  placeholder="Discount code"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  className="h-10 flex-1 rounded-xl border-zinc-200 bg-zinc-50 text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 shrink-0 rounded-xl border-zinc-200"
                  disabled={promoStatus === "loading"}
                  onClick={() => void applyPromo()}
                >
                  {promoStatus === "loading" ? "Applying…" : "Apply"}
                </Button>
              </div>
              {promoMessage ? (
                <div
                  className={cn(
                    "mt-3 rounded-xl border px-3 py-2 text-sm",
                    promoStatus === "valid"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                      : promoStatus === "invalid"
                        ? "border-rose-200 bg-rose-50 text-rose-800"
                        : "border-zinc-200 bg-zinc-50 text-zinc-700"
                  )}
                >
                  {promoMessage}
                </div>
              ) : null}
              <div className="mt-5 flex items-center justify-between border-t border-zinc-200 pt-4">
                <span className="font-semibold text-zinc-900">Total</span>
                <span className="text-2xl font-bold text-gold">
                  ${total.toFixed(2)}
                </span>
              </div>
              {payment === "paypal_card" ? (
                <p className="mt-6 text-center text-sm text-zinc-500">
                  Use the PayPal or Debit / Credit Card buttons above to complete payment.
                </p>
              ) : (
                <>
                  {checkoutError ? (
                    <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                      {checkoutError}
                    </div>
                  ) : null}
                  <Button
                    className="mt-6 h-12 w-full rounded-xl bg-gold text-base font-semibold text-gold-foreground shadow-md hover:bg-gold/90"
                    onClick={() => void completeBankCheckout()}
                    disabled={submitting}
                  >
                    {submitting ? "Processing…" : "Complete Purchase"}
                    <Lock className="h-4 w-4" />
                  </Button>
                </>
              )}
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-zinc-500">
                <Shield className="h-4 w-4" />
                Secure 256-bit SSL Encrypted Payment
              </div>
              <div className="mt-6 flex justify-center gap-6 border-t border-zinc-100 pt-4">
                <div className="flex flex-col items-center gap-1">
                  <Shield className="h-5 w-5 text-zinc-400" />
                  <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">
                    SSL
                  </span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Lock className="h-5 w-5 text-zinc-400" />
                  <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">
                    Encrypted
                  </span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <BadgeCheck className="h-5 w-5 text-zinc-400" />
                  <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">
                    Certified
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white px-4 py-6 md:px-6">
        <div className="container flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold text-gold-foreground font-bold text-sm">
              Y
            </span>
            <span className="text-sm font-semibold text-zinc-900">Yalla CPHQ</span>
          </div>
          <p className="text-xs text-zinc-500">© 2024 Yalla CPHQ. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <Link href="/privacy" className="text-xs text-zinc-600 hover:text-zinc-900">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-xs text-zinc-600 hover:text-zinc-900">
              Terms of Service
            </Link>
            <Link href="/refund" className="text-xs text-zinc-600 hover:text-zinc-900">
              Refund Policy
            </Link>
            <div className="flex gap-3">
              <Mail className="h-4 w-4 text-zinc-400" aria-hidden />
              <Instagram className="h-4 w-4 text-zinc-400" aria-hidden />
              <Building className="h-4 w-4 text-zinc-400" aria-hidden />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
