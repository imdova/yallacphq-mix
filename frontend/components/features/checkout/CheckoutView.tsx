"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Check,
  Shield,
  Mail,
  Instagram,
  Building,
  BadgeCheck,
} from "lucide-react";
import { ROUTES } from "@/constants";
import { cn } from "@/lib/utils";
import { getErrorMessage } from "@/lib/api/error";
import { useAuth } from "@/contexts/auth-context";
import { useCart } from "@/contexts/cart-context";
import { validatePromoCode } from "@/lib/dal/promo-codes";
import { getPublicCourse } from "@/lib/dal/courses";
import type { Course } from "@/types/course";
import { PRODUCT, STORAGE_KEY } from "@/components/features/checkout/checkoutData";

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

type PaymentMethod = "paypal_card" | "bank";

export function CheckoutView() {
  const router = useRouter();
  const { status } = useAuth();
  const { courseIds } = useCart();
  const [cartCourses, setCartCourses] = React.useState<Course[]>([]);
  const [cartLoading, setCartLoading] = React.useState(true);
  const [payment, setPayment] = React.useState<PaymentMethod>("bank");
  const [discountCode, setDiscountCode] = React.useState("");
  const [promoStatus, setPromoStatus] = React.useState<"idle" | "valid" | "invalid" | "loading">("idle");
  const [promoMessage, setPromoMessage] = React.useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = React.useState(0);
  const [countryCode, setCountryCode] = React.useState("+20");
  const [phone, setPhone] = React.useState("");
  const [checkoutError, setCheckoutError] = React.useState<string | null>(null);

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

  const checkoutPayloadRef = React.useRef({
    total: 0,
    courseTitle: PRODUCT.name,
    courseIds: [] as string[],
    discountAmount: 0,
    promoCode: "",
  });

  const subtotal = cartCourses.length > 0 ? cartTotal : PRODUCT.price;
  const total = Math.max(0, subtotal - discountAmount);
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

  return (
    <div className="min-h-screen flex flex-col bg-zinc-100 overflow-x-hidden w-full">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-zinc-200/80 bg-white/95 backdrop-blur-sm">
        <div className="container mx-auto w-full flex h-12 min-h-[3rem] items-center justify-between gap-2 px-3 sm:h-14 sm:gap-4 sm:px-4 md:px-6 xl:max-w-[90rem] 2xl:max-w-[100rem]">
          <Link href="/" className="flex shrink-0 items-center gap-2 min-w-0">
            <span className="flex h-8 w-24 shrink-0 items-center justify-center rounded-sm bg-black text-xs font-bold tracking-[0.35em] text-white sm:h-9 sm:w-28">
              CPHQ
            </span>
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

      {/* Main */}
      <main className="flex-1 w-full min-w-0 px-3 py-4 sm:px-4 sm:py-6 md:px-6 md:py-10">
        <div className="container mx-auto w-full grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,320px)] md:gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)] lg:gap-10 xl:grid-cols-[minmax(0,1fr)_minmax(0,400px)] xl:gap-12 xl:max-w-[90rem] 2xl:max-w-[100rem]">
          {/* Left: Checkout form - on small screens below form; on md+ first column */}
          <div className="min-w-0 space-y-6 order-2 md:order-1 sm:space-y-8">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl md:text-3xl">
                Secure Checkout
              </h1>
            </div>

            <form className="space-y-6 sm:space-y-8" onSubmit={(e) => e.preventDefault()}>
              <section className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
                {/* 1. Account Details */}
                <div className="p-4 sm:p-6">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold text-sm font-bold text-gold-foreground">
                      1
                    </span>
                    <h2 className="text-base font-semibold text-zinc-900 sm:text-lg">Account Details</h2>
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
                                  <span>
                                    {label} {name}
                                  </span>
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
                </div>

                <div className="border-t border-zinc-200" />

                {/* 2. Select Payment Method */}
                <div className="p-4 sm:p-6">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold text-sm font-bold text-gold-foreground">
                      2
                    </span>
                    <h2 className="text-base font-semibold text-zinc-900 sm:text-lg">Select Payment Method</h2>
                  </div>

                  <div className="mt-4 grid gap-3 sm:mt-5 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => setPayment("paypal_card")}
                      className={cn(
                        "group relative flex w-full items-center justify-between gap-3 rounded-xl border bg-white px-4 py-3 text-left shadow-sm transition",
                        payment === "paypal_card"
                          ? "border-gold ring-2 ring-gold/20"
                          : "border-zinc-200 hover:border-zinc-300"
                      )}
                      aria-pressed={payment === "paypal_card"}
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700">
                          <CreditCard className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-zinc-900">Credit Card</p>
                          <p className="text-xs text-zinc-500">All major cards supported</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="hidden items-center gap-1.5 sm:flex" aria-hidden>
                          <span className="h-5 w-8 rounded bg-[#1a1f71]" />
                          <span className="h-5 w-8 rounded bg-[#eb001b]" />
                          <span className="h-5 w-8 rounded bg-[#ff5f00]" />
                        </div>
                        <span
                          className={cn(
                            "flex h-5 w-5 items-center justify-center rounded-full border",
                            payment === "paypal_card" ? "border-gold bg-gold text-gold-foreground" : "border-zinc-300"
                          )}
                          aria-hidden
                        >
                          {payment === "paypal_card" ? <Check className="h-3.5 w-3.5" /> : null}
                        </span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setPayment("bank");
                        try {
                          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(checkoutPayloadRef.current));
                        } catch {
                          // ignore
                        }
                        router.push("/checkout/bank-transfer");
                      }}
                      className={cn(
                        "group relative flex w-full items-center justify-between gap-3 rounded-xl border bg-white px-4 py-3 text-left shadow-sm transition",
                        payment === "bank" ? "border-gold ring-2 ring-gold/20" : "border-zinc-200 hover:border-zinc-300"
                      )}
                      aria-pressed={payment === "bank"}
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700">
                          <Building2 className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-zinc-900">Bank Transfer</p>
                          <p className="text-xs text-zinc-500">Upload receipt after transfer</p>
                        </div>
                      </div>
                      <span
                        className={cn(
                          "flex h-5 w-5 items-center justify-center rounded-full border",
                          payment === "bank" ? "border-gold bg-gold text-gold-foreground" : "border-zinc-300"
                        )}
                        aria-hidden
                      >
                        {payment === "bank" ? <Check className="h-3.5 w-3.5" /> : null}
                      </span>
                    </button>
                  </div>
                </div>
              </section>
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
              {checkoutError ? (
                <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800 sm:mt-4 sm:rounded-2xl sm:px-4 sm:py-3">
                  {checkoutError}
                </div>
              ) : null}
              <Button
                className="mt-4 h-11 w-full rounded-xl bg-gold text-sm font-semibold text-gold-foreground shadow-md hover:bg-gold/90 sm:mt-6 sm:h-12 sm:text-base"
                onClick={() => {
                  try {
                    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(checkoutPayloadRef.current));
                  } catch {
                    // ignore
                  }
                  if (payment === "paypal_card") {
                    router.push("/checkout/card");
                    return;
                  }
                  router.push("/checkout/bank-transfer");
                }}
              >
                {payment === "paypal_card" ? "Continue to card payment" : "Continue to bank transfer"}
                <Lock className="ml-1.5 h-4 w-4 shrink-0" />
              </Button>
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
