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
import { createPaymentSession, confirmPayment } from "@/lib/dal/orders";
import { getErrorMessage } from "@/lib/api/error";
import { useAuth } from "@/contexts/auth-context";
import { useCart } from "@/contexts/cart-context";
import { validatePromoCode } from "@/lib/dal/promo-codes";
import { getPublicCourse } from "@/lib/dal/courses";
import { uploadBankTransferProof } from "@/lib/dal/upload";
import type { Course } from "@/types/course";

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
  const { courseIds, clearCart, refreshCart } = useCart();
  const [cartCourses, setCartCourses] = React.useState<Course[]>([]);
  const [cartLoading, setCartLoading] = React.useState(true);
  const [payment, setPayment] = React.useState<PaymentMethod>("bank");
  const [paypalReady, setPaypalReady] = React.useState(false);
  const [paypalApproveUrl, setPaypalApproveUrl] = React.useState<string | null>(null);
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
  const pendingPayPalOrderRef = React.useRef<{ id: string } | null>(null);

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
            const payload = checkoutPayloadRef.current;
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
                return typeof order === "string" ? order : (order as { id: string })?.id ?? "";
              })
              .catch((err: unknown) => {
                setCheckoutError(getErrorMessage(err, "Could not start payment. Please try again or use bank transfer."));
                throw err;
              });
          },
          onApprove: function (
            data: unknown,
            actions: { order: { capture: () => Promise<unknown> } }
          ) {
            const orderID = typeof data === "object" && data !== null && "orderID" in data
              ? String((data as { orderID: string }).orderID)
              : "";
            return actions.order.capture().then(async () => {
              const order = pendingPayPalOrderRef.current;
              if (order) {
                await confirmPayment({ orderId: order.id, transactionId: orderID });
              }
              router.push("/dashboard/courses");
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
    }

    if (document.getElementById(PAYPAL_SCRIPT_ID)) {
      if (window.paypal) {
        initPayPalButton();
      }
      return;
    }

    const script = document.createElement("script");
    script.id = PAYPAL_SCRIPT_ID;
    if (!PAYPAL_CLIENT_ID) {
      setCheckoutError("Missing PayPal client id. Please configure NEXT_PUBLIC_PAYPAL_CLIENT_ID.");
      return;
    }
    script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&intent=capture&currency=USD&enable-funding=venmo`;
    script.setAttribute("data-sdk-integration-source", "button-factory");
    script.async = true;
    script.onload = () => {
      initPayPalButton();
    };
    document.body.appendChild(script);

    return () => {
      const el = document.getElementById(PAYPAL_SCRIPT_ID);
      if (el) el.remove();
      setPaypalReady(false);
      setPaypalApproveUrl(null);
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
      className="shrink-0 rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-700"
      aria-label={ariaLabel}
    >
      {copiedField === field ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
    </button>
  );

  const checkoutPayloadRef = React.useRef({
    total: 0,
    courseTitle: PRODUCT.name,
    courseIds: [] as string[],
    discountAmount: 0,
    promoCode: "",
  });

  const subtotal = cartCourses.length > 0 ? cartTotal : PRODUCT.price;
  const upsellTotal = addUpsell ? UPSELL.price : 0;
  const preDiscountTotal = subtotal + upsellTotal;
  const total = Math.max(0, preDiscountTotal - discountAmount);
  const useCartCheckout = cartCourses.length > 0;

  React.useEffect(() => {
    checkoutPayloadRef.current = {
      total,
      courseTitle: useCartCheckout ? `${cartCourses.length} course(s) from Yalla CPHQ` : PRODUCT.name,
      courseIds: useCartCheckout ? courseIds : [],
      discountAmount,
      promoCode: discountCode.trim(),
    };
  }, [total, useCartCheckout, cartCourses.length, courseIds, discountAmount, discountCode]);

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
      const courseIdForPromo = cartCourses.length > 0 ? (cartCourses[0]?.id ?? "bundle-cphq") : "bundle-cphq";
      const res = await validatePromoCode(courseIdForPromo, code);
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
    if (useCartCheckout && cartCourses.length === 0) {
      setCheckoutError("Your cart is empty. Add courses from the catalog.");
      return;
    }
    if (payment === "bank" && !receiptFile) {
      setCheckoutError("Please upload your bank transfer receipt to complete the order.");
      return;
    }
    setSubmitting(true);
    try {
      let bankTransferProofUrl: string | undefined;
      if (payment === "bank" && receiptFile) {
        const { url } = await uploadBankTransferProof(receiptFile);
        bankTransferProofUrl = url;
      }
      await createPaymentSession({
        method: "bank",
        courseTitle: useCartCheckout
          ? `${cartCourses.length} course(s) from Yalla CPHQ`
          : PRODUCT.name,
        currency: "USD",
        amount: total,
        discountAmount: discountAmount || undefined,
        promoCode: discountCode.trim() || undefined,
        idempotencyKey: crypto.randomUUID(),
        ...(useCartCheckout && courseIds.length > 0 ? { courseIds } : undefined),
        ...(bankTransferProofUrl ? { bankTransferProofUrl } : undefined),
      });
      if (useCartCheckout) {
        await clearCart();
        await refreshCart();
      }
      router.push("/dashboard/orders");
    } catch (e) {
      setCheckoutError(getErrorMessage(e, "Failed to start checkout"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-100 overflow-x-hidden w-full">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-zinc-200/80 bg-white/95 backdrop-blur-sm">
        <div className="container mx-auto w-full flex h-12 min-h-[3rem] items-center justify-between gap-2 px-3 sm:h-14 sm:gap-4 sm:px-4 md:px-6 xl:max-w-[90rem] 2xl:max-w-[100rem]">
          <Link href="/" className="flex shrink-0 items-center gap-2 min-w-0">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold text-gold-foreground font-bold text-sm sm:h-9 sm:w-9">
              Y
            </span>
            <span className="truncate font-semibold text-zinc-900 text-sm sm:text-base">Yalla CPHQ</span>
          </Link>
          <nav className="hidden items-center gap-4 text-sm font-medium text-zinc-600 sm:flex sm:gap-6">
            <Link href="/courses" className="hover:text-zinc-900 whitespace-nowrap">Courses</Link>
            <Link href="/courses" className="hover:text-zinc-900 whitespace-nowrap">Resources</Link>
            <Link href="/dashboard/support" className="hover:text-zinc-900 whitespace-nowrap">Support</Link>
          </nav>
          <div className="flex shrink-0 items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[10px] font-medium text-zinc-600 sm:gap-1.5 sm:px-2.5 sm:py-1 sm:text-xs">
              <Lock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              Secure
            </span>
          </div>
        </div>
      </header>

      {/* Breadcrumbs */}
      <div className="border-b border-zinc-200 bg-white px-3 py-2 sm:px-4 md:px-6 overflow-x-hidden">
        <div className="container mx-auto w-full flex min-w-0 flex-wrap items-center gap-1.5 text-xs sm:gap-2 sm:text-sm xl:max-w-[90rem] 2xl:max-w-[100rem]">
          <Link href="/" className="text-zinc-500 hover:text-zinc-900 truncate">Home</Link>
          <span className="text-zinc-300 shrink-0">/</span>
          <Link href={ROUTES.COURSE_DETAILS} className="min-w-0 truncate text-zinc-500 hover:text-zinc-900">
            CPHQ Mastery Bundle
          </Link>
          <span className="text-zinc-300 shrink-0">/</span>
          <span className="font-medium text-gold shrink-0">Checkout</span>
        </div>
      </div>

      {/* Main */}
      <main className="flex-1 w-full min-w-0 px-3 py-4 sm:px-4 sm:py-6 md:px-6 md:py-10">
        <div className="container mx-auto w-full grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,320px)] md:gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)] lg:gap-10 xl:grid-cols-[minmax(0,1fr)_minmax(0,400px)] xl:gap-12 xl:max-w-[90rem] 2xl:max-w-[100rem]">
          {/* Left: Checkout form - on small screens below form; on md+ first column */}
          <div className="min-w-0 space-y-6 order-2 md:order-1 sm:space-y-8">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl md:text-3xl">
                Secure Checkout
              </h1>
              <p className="mt-1.5 text-sm text-zinc-600 sm:mt-2 sm:text-base">
                Complete your enrollment in the CPHQ Mastery Bundle. Your access will be granted
                immediately after payment.
              </p>
            </div>

            <form className="space-y-6 sm:space-y-8" onSubmit={(e) => e.preventDefault()}>
              {/* 1. Account Details */}
              <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold text-sm font-bold text-gold-foreground">
                    1
                  </span>
                  <h2 className="text-lg font-semibold text-zinc-900">Account Details</h2>
                </div>
                <div className="mt-4 space-y-4 sm:mt-5">
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-zinc-700">Full Name</Label>
                      <Input
                        type="text"
                        defaultValue="John Doe"
                        className="h-10 rounded-xl border-zinc-200 bg-zinc-50/50 focus:bg-white sm:h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-zinc-700">Email Address</Label>
                      <Input
                        type="email"
                        defaultValue="john@example.com"
                        className="h-10 rounded-xl border-zinc-200 bg-zinc-50/50 focus:bg-white sm:h-11"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-zinc-700">Phone Number</Label>
                    <div className="flex flex-col gap-2 sm:flex-row sm:gap-2">
                      <Select value={countryCode} onValueChange={setCountryCode}>
                        <SelectTrigger className="h-10 w-full rounded-xl border-zinc-200 bg-zinc-50/50 focus:bg-white sm:h-11 sm:w-[130px] sm:shrink-0 md:w-[140px]">
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
                        className="h-10 min-w-0 flex-1 rounded-xl border-zinc-200 bg-zinc-50/50 focus:bg-white sm:h-11"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* 2. Payment Method */}
              <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-6 min-w-0">
                <div className="flex flex-wrap items-center gap-3 min-w-0">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold text-sm font-bold text-gold-foreground sm:h-9 sm:w-9">
                    2
                  </span>
                  <h2 className="text-base font-semibold text-zinc-900 min-w-0 sm:text-lg">Payment Method</h2>
                </div>
                <div className="mt-4 flex flex-col gap-3 sm:mt-5 sm:flex-row sm:flex-wrap sm:gap-3">
                  <button
                    type="button"
                    onClick={() => setPayment("paypal_card")}
                    className={cn(
                      "flex w-full items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all sm:w-auto",
                      payment === "paypal_card"
                        ? "border-gold bg-gold/10 text-gold ring-2 ring-gold/20"
                        : "border-zinc-200 bg-zinc-50/50 text-zinc-700 hover:border-zinc-300 hover:bg-zinc-100"
                    )}
                  >
                    <CreditCard className="h-4 w-4 shrink-0" />
                    PayPal or Card
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayment("bank")}
                    className={cn(
                      "flex w-full items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all sm:w-auto",
                      payment === "bank"
                        ? "border-gold bg-gold text-gold-foreground ring-2 ring-gold/20"
                        : "border-zinc-200 bg-zinc-50/50 text-zinc-700 hover:border-zinc-300 hover:bg-zinc-100"
                    )}
                  >
                    <Building2 className="h-4 w-4 shrink-0" />
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
                    {paypalApproveUrl && (
                      <div className="mt-4 rounded-lg border-2 border-gold bg-amber-50/50 p-3">
                        <p className="text-xs font-medium text-zinc-700 mb-2">
                          Payment window didn&apos;t open? Use this link to pay:
                        </p>
                        <a
                          href={paypalApproveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 w-full rounded-lg border-2 border-gold bg-gold px-4 py-3 text-sm font-semibold text-gold-foreground hover:bg-gold/90"
                        >
                          Open PayPal to pay in new tab
                        </a>
                      </div>
                    )}
                    <div className="relative mt-4 min-h-[220px]">
                      <div id="paypal-button-container" className="min-h-[220px]" />
                      {!paypalReady && (
                        <div className="absolute inset-0 flex items-center justify-center rounded-lg border-2 border-dashed border-zinc-200 bg-zinc-50/80 text-sm text-zinc-500 backdrop-blur-[1px]">
                          Loading PayPal…
                        </div>
                      )}
                    </div>
                    <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-zinc-400">
                      <span className="inline-block h-4 w-5 rounded bg-[#ffc439]" aria-hidden />
                      Supported by PayPal
                    </p>
                  </div>
                )}

                {payment === "bank" && (
                  <div className="mt-4 rounded-xl border-2 border-dashed border-gold/50 bg-amber-50/30 p-4 sm:mt-5 sm:p-5">
                    <div className="flex flex-col gap-5 overflow-hidden lg:flex-row lg:items-start lg:gap-6">
                      <div className="min-w-0 flex-1 lg:min-w-[280px]">
                        <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
                          <Info className="h-4 w-4 shrink-0 text-gold" />
                          Official Bank Account Details
                        </div>
                        <dl className="mt-3 grid grid-cols-1 gap-y-3 gap-x-4 text-sm sm:mt-4 sm:grid-cols-[auto_minmax(12rem,1fr)] sm:items-center">
                          <div className="contents sm:block">
                            <dt className="text-zinc-500 sm:mb-1">BANK NAME</dt>
                            <dd className="flex min-w-0 items-center gap-2 font-medium text-zinc-900">
                              <span className="min-w-0 flex-1 break-words">{BANK.name}</span>
                              <CopyButton value={BANK.name} field="name" ariaLabel="Copy bank name" />
                            </dd>
                          </div>
                          <div className="contents sm:block">
                            <dt className="text-zinc-500 sm:mb-1">ACCOUNT HOLDER</dt>
                            <dd className="flex min-w-0 items-center gap-2 font-medium text-zinc-900">
                              <span className="min-w-0 flex-1 break-words">{BANK.accountHolder}</span>
                              <CopyButton value={BANK.accountHolder} field="accountHolder" ariaLabel="Copy account holder" />
                            </dd>
                          </div>
                          <div className="contents sm:block">
                            <dt className="text-zinc-500 sm:mb-1">IBAN</dt>
                            <dd className="flex min-w-0 items-center gap-2 font-medium text-zinc-900">
                              <span className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap text-zinc-900 [-webkit-overflow-scrolling:touch]">
                                {BANK.iban}
                              </span>
                              <CopyButton value={BANK.iban} field="iban" ariaLabel="Copy IBAN" />
                            </dd>
                          </div>
                          <div className="contents sm:block">
                            <dt className="text-zinc-500 sm:mb-1">SWIFT / BIC</dt>
                            <dd className="flex min-w-0 items-center gap-2 font-medium text-zinc-900">
                              <span className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap text-zinc-900 [-webkit-overflow-scrolling:touch]">
                                {BANK.swift}
                              </span>
                              <CopyButton value={BANK.swift} field="swift" ariaLabel="Copy SWIFT/BIC" />
                            </dd>
                          </div>
                          <div className="contents sm:block">
                            <dt className="text-zinc-500 sm:mb-1">REFERENCE</dt>
                            <dd className="flex min-w-0 items-center gap-2 font-medium text-zinc-900">
                              <span className="min-w-0 flex-1 break-words">{PRODUCT.reference}</span>
                              <CopyButton value={PRODUCT.reference} field="reference" ariaLabel="Copy reference" />
                            </dd>
                          </div>
                        </dl>
                        <p className="mt-3 text-xs text-zinc-500 sm:mt-4">
                          * Enrollment will be activated manually once the transfer is confirmed (usually
                          1–3 business days).
                        </p>
                      </div>
                      <div className="min-w-0 w-full shrink-0 lg:min-w-0 lg:max-w-[280px] lg:w-[280px] xl:max-w-[300px] xl:w-[300px]">
                        <div className="min-w-0 overflow-hidden">
                          <Label className="text-sm font-semibold text-zinc-900">
                            Attach payment receipt
                          </Label>
                          <p className="mt-1 text-xs text-zinc-500">
                            Upload your transfer receipt (PDF or image, max {MAX_RECEIPT_SIZE_MB} MB) to complete your order.
                          </p>
                          {!receiptFile ? (
                            <label className="mt-3 flex min-h-[120px] w-full min-w-0 max-w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-300 bg-white py-6 transition hover:border-gold/50 hover:bg-amber-50/20">
                              <input
                                ref={receiptInputRef}
                                type="file"
                                accept={ACCEPTED_RECEIPT_TYPES}
                                onChange={handleReceiptChange}
                                className="sr-only"
                              />
                              <Upload className="h-8 w-8 shrink-0 text-zinc-400" />
                              <span className="mt-2 text-center text-sm font-medium text-zinc-600">
                                Choose file or drag and drop
                              </span>
                              <span className="mt-0.5 text-center text-xs text-zinc-400">
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
                  </div>
                )}
              </section>

              {/* Upsell: Hardcopy Study Guide (dark) */}
              <section className="relative overflow-hidden rounded-xl border-2 border-gold/40 bg-zinc-900 p-4 shadow-lg sm:rounded-2xl sm:p-6 dark:border-gold/50 dark:bg-zinc-950">
                <span className="absolute right-0 top-0 rounded-bl-lg bg-gold px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-900 sm:px-3 sm:py-1.5 sm:text-xs">
                  Limited Time Offer
                </span>
                <div className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-start sm:gap-6 sm:pt-0">
                  <div className="flex shrink-0 flex-col items-center sm:items-start">
                    <div className="relative">
                      <div className="flex h-20 w-16 items-center justify-center rounded-lg border border-zinc-600 bg-zinc-800 sm:h-24 sm:w-20 md:h-28 md:w-24">
                        <BookOpen className="h-8 w-8 text-gold sm:h-10 sm:w-10 md:h-12 md:w-12" />
                      </div>
                      <span className="absolute -bottom-1 -right-1 rounded-md border border-gold/50 bg-gold px-1.5 py-0.5 text-xs font-bold text-zinc-900 sm:px-2 sm:text-sm">
                        $29
                      </span>
                    </div>
                    <p className="mt-2 text-center text-xs font-semibold uppercase tracking-wide text-zinc-200 sm:text-left">
                      {UPSELL.name}
                    </p>
                    <p className="text-xs text-zinc-400">Physical Edition</p>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-bold text-white sm:text-lg md:text-xl">
                      Add a Hardcopy Study Guide for only{" "}
                      <span className="text-gold">$29!</span>
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-zinc-300 sm:mt-2">
                      {UPSELL.description}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2 sm:mt-4">
                      <div className="flex gap-1 shrink-0">
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
                      <p className="text-xs italic text-zinc-400 sm:text-sm">
                        &ldquo;{UPSELL.socialProof}&rdquo;
                      </p>
                    </div>
                    <label className="mt-4 flex cursor-pointer items-start gap-3 sm:items-center sm:mt-5">
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
              <div className="rounded-xl border border-gold/30 bg-gold/5 p-4 sm:rounded-2xl sm:p-6">
                <div className="flex gap-3 sm:gap-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold/20 sm:h-10 sm:w-10">
                    <Check className="h-4 w-4 text-gold sm:h-5 sm:w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-zinc-900 sm:text-base">30-Day Money Back Guarantee</p>
                    <p className="mt-0.5 text-xs text-zinc-600 sm:mt-1 sm:text-sm">
                      If you&apos;re not satisfied, we&apos;ll refund your payment, no questions asked.
                    </p>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Right: Order summary - on small screens show first; on md+ second column, sticky */}
          <div className="order-1 min-w-0 md:order-2 md:sticky md:top-24 md:self-start">
            <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-lg sm:rounded-2xl sm:p-6">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold text-gold-foreground font-bold text-sm">
                  Y
                </span>
                <span className="text-sm font-semibold uppercase tracking-wider text-zinc-900">
                  Order Summary
                </span>
              </div>
              <ul className="mt-4 space-y-3 sm:mt-6">
                {cartLoading ? (
                  <li className="text-sm text-zinc-500">Loading cart…</li>
                ) : cartCourses.length > 0 ? (
                  cartCourses.map((c) => {
                    const hasSale =
                      c.priceSale != null &&
                      c.priceSale > 0 &&
                      (c.priceRegular ?? 0) > (c.priceSale ?? 0);
                    const price = hasSale ? c.priceSale! : (c.priceRegular ?? 0);
                    return (
                      <li key={c.id} className="min-w-0">
                        <p className="truncate font-medium text-zinc-900">{c.title}</p>
                        <p className="text-xs text-zinc-500 sm:text-sm">{c.instructorName}</p>
                        <p className="mt-1 font-semibold text-zinc-900">
                          ${typeof price === "number" ? price.toFixed(2) : "0.00"}
                        </p>
                      </li>
                    );
                  })
                ) : (
                  <>
                    <li>
                      <p className="font-medium text-zinc-900">{PRODUCT.name}</p>
                      <p className="text-sm text-zinc-500">{PRODUCT.subtitle}</p>
                      <p className="mt-1 font-semibold text-zinc-900">
                        ${PRODUCT.price.toFixed(2)}
                      </p>
                    </li>
                  </>
                )}
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
              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:gap-2">
                <Input
                  placeholder="Discount code"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  className="h-10 min-w-0 flex-1 rounded-xl border-zinc-200 bg-zinc-50 text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 w-full shrink-0 rounded-xl border-zinc-200 sm:w-auto"
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
              <div className="mt-4 flex items-center justify-between gap-3 border-t border-zinc-200 pt-4 min-w-0">
                <span className="font-semibold text-zinc-900 shrink-0">Total</span>
                <span className="text-xl font-bold text-gold shrink-0 sm:text-2xl">
                  ${total.toFixed(2)}
                </span>
              </div>
              {payment === "paypal_card" ? (
                <p className="mt-4 text-center text-xs text-zinc-500 sm:mt-6 sm:text-sm">
                  Use the PayPal or Debit / Credit Card buttons above to complete payment.
                </p>
              ) : (
                <>
                  {checkoutError ? (
                    <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800 sm:mt-4 sm:rounded-2xl sm:px-4 sm:py-3">
                      {checkoutError}
                    </div>
                  ) : null}
                  <Button
                    className="mt-4 h-11 w-full rounded-xl bg-gold text-sm font-semibold text-gold-foreground shadow-md hover:bg-gold/90 sm:mt-6 sm:h-12 sm:text-base"
                    onClick={() => void completeBankCheckout()}
                    disabled={submitting || (payment === "bank" && !receiptFile)}
                  >
                    {submitting ? "Processing…" : payment === "bank" && !receiptFile ? "Upload receipt to continue" : "Complete Purchase"}
                    <Lock className="ml-1.5 h-4 w-4 shrink-0" />
                  </Button>
                </>
              )}
              <div className="mt-3 flex items-center justify-center gap-2 text-[10px] text-zinc-500 sm:mt-4 sm:text-xs">
                <Shield className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                Secure 256-bit SSL Encrypted Payment
              </div>
              <div className="mt-4 flex justify-center gap-4 border-t border-zinc-100 pt-4 sm:mt-6 sm:gap-6">
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
      <footer className="border-t border-zinc-200 bg-white px-3 py-4 sm:px-4 sm:py-6 md:px-6">
        <div className="container mx-auto w-full flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4 xl:max-w-[90rem] 2xl:max-w-[100rem]">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gold text-gold-foreground font-bold text-xs sm:h-8 sm:w-8 sm:text-sm">
              Y
            </span>
            <span className="text-xs font-semibold text-zinc-900 sm:text-sm">Yalla CPHQ</span>
          </div>
          <p className="text-[10px] text-zinc-500 sm:text-xs">© 2024 Yalla CPHQ. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-3 sm:gap-6">
            <Link href="/privacy" className="text-[10px] text-zinc-600 hover:text-zinc-900 sm:text-xs">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-[10px] text-zinc-600 hover:text-zinc-900 sm:text-xs">
              Terms of Service
            </Link>
            <Link href="/refund" className="text-[10px] text-zinc-600 hover:text-zinc-900 sm:text-xs">
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
