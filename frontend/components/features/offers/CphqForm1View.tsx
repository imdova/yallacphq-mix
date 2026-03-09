"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
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
import { registerOffer } from "@/lib/dal/leads";
import { getErrorMessage } from "@/lib/api/error";
import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";
import { CoursesHeader } from "@/components/features/courses/CoursesHeader";
import { CoursesFooter } from "@/components/features/courses/CoursesFooter";

const FLAG_CDN = "https://flagcdn.com";
const COUNTRY_CODES = [
  { value: "+20", label: "+20", name: "Egypt", cc: "eg" },
  { value: "+966", label: "+966", name: "Saudi Arabia", cc: "sa" },
  { value: "+971", label: "+971", name: "UAE", cc: "ae" },
  { value: "+974", label: "+974", name: "Qatar", cc: "qa" },
  { value: "+965", label: "+965", name: "Kuwait", cc: "kw" },
  { value: "+962", label: "+962", name: "Jordan", cc: "jo" },
  { value: "+44", label: "+44", name: "UK", cc: "gb" },
  { value: "+1", label: "+1", name: "USA", cc: "us" },
];

type SubmitStatus = "idle" | "loading" | "success" | "error";

export function CphqForm1View() {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [countryCode, setCountryCode] = React.useState("+20");
  const [phone, setPhone] = React.useState("");
  const [status, setStatus] = React.useState<SubmitStatus>("idle");
  const [errorMessage, setErrorMessage] = React.useState("");

  const isEmailValid = React.useMemo(() => {
    const v = email.trim();
    if (!v) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }, [email]);

  const canSubmit = name.trim() && isEmailValid && phone.trim().length >= 5 && status !== "loading";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!name.trim() || !isEmailValid || phone.trim().length < 5) {
      setStatus("error");
      setErrorMessage("Please complete the required fields correctly.");
      return;
    }

    setStatus("loading");
    try {
      const dial = countryCode.trim();
      const codeOnly = dial.replace(/^\+/, "");
      const phoneOnly = phone.trim().replace(/\s+/g, "");
      const fullPhone = `${codeOnly}${phoneOnly}`;
      const res = await registerOffer({
        name: name.trim(),
        email: email.trim(),
        phone: fullPhone,
      });
      if (!res.success) {
        setStatus("error");
        setErrorMessage(res.message || "Something went wrong. Please try again.");
        return;
      }
      setStatus("success");
      setName("");
      setEmail("");
      setPhone("");
    } catch (err) {
      setStatus("error");
      setErrorMessage(getErrorMessage(err, "Network error. Please try again."));
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50/80 text-zinc-900">
      <CoursesHeader />

      <main className="px-4 py-10 md:py-14">
        <div className="container">
          <div className="mx-auto grid max-w-6xl items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:gap-14">
            {/* Left copy */}
            <section className="order-2 lg:order-1">
              <span className="inline-flex items-center rounded-full bg-gold px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-gold-foreground">
                Limited time: 50% off
              </span>
              <h1 className="mt-5 text-balance text-3xl font-bold tracking-tight text-zinc-900 md:text-4xl">
                Start your <span className="text-gold">CPHQ</span> journey with Yalla CPHQ
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-600">
                Leave your details and we’ll help you choose the best plan—plus free resources and
                practical tips to pass on your first attempt.
              </p>

              <ul className="mt-8 space-y-3 text-sm text-zinc-700">
                {[
                  "A clear study plan aligned to the latest blueprint.",
                  "Practice questions + focused review on what matters most.",
                  "Step-by-step support all the way to exam day.",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-gold" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-10 grid grid-cols-3 gap-3 sm:gap-4">
                {[
                  { k: "0", v: "Commitment" },
                  { k: "1000+", v: "Learners" },
                  { k: "200+", v: "Hours of content" },
                ].map((s) => (
                  <div
                    key={s.v}
                    className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-center shadow-sm"
                  >
                    <div className="text-lg font-extrabold text-zinc-900">{s.k}</div>
                    <div className="mt-0.5 text-[11px] font-medium text-zinc-500">{s.v}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* Right form card */}
            <section className="order-1 lg:order-2 lg:sticky lg:top-24">
              <div className="mx-auto w-full max-w-md">
                <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-lg">
                  <h2 className="text-xl font-bold tracking-tight text-zinc-900">
                    Get the details
                  </h2>
                  <p className="mt-2 text-sm text-zinc-600">
                    Enter your info to receive the plan and next steps.
                  </p>

                  <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-zinc-700">Full Name</Label>
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        required
                        className="h-11 rounded-xl border-zinc-200 bg-zinc-50/50 focus:bg-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-zinc-700">Email Address</Label>
                      <Input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@example.com"
                        type="email"
                        required
                        aria-invalid={email.trim().length > 0 && !isEmailValid}
                        className="h-11 rounded-xl border-zinc-200 bg-zinc-50/50 focus:bg-white"
                      />
                      {email.trim().length > 0 && !isEmailValid ? (
                        <p className="text-xs text-rose-600">Please enter a valid email.</p>
                      ) : null}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-zinc-700">Phone Number</Label>
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <Select value={countryCode} onValueChange={setCountryCode}>
                          <SelectTrigger className="h-11 w-full rounded-xl border-zinc-200 bg-zinc-50/50 focus:bg-white sm:w-[150px]">
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
                                    <span className="hidden text-zinc-500 sm:inline">{cur.name}</span>
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
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="555 123 4567"
                          type="tel"
                          required
                          className="h-11 flex-1 rounded-xl border-zinc-200 bg-zinc-50/50 focus:bg-white"
                        />
                      </div>
                    </div>

                    {status === "error" && errorMessage ? (
                      <div
                        className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
                        role="alert"
                      >
                        {errorMessage}
                      </div>
                    ) : null}

                    {status === "success" ? (
                      <div
                        className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
                        role="status"
                      >
                        You’re in. We’ll contact you soon with the details.
                      </div>
                    ) : null}

                    <Button
                      type="submit"
                      disabled={!canSubmit}
                      className={cn(
                        "h-12 w-full rounded-xl bg-gold text-base font-semibold text-gold-foreground hover:bg-gold/90",
                        "disabled:opacity-60"
                      )}
                    >
                      {status === "loading" ? "Sending…" : "Book my call"}
                    </Button>

                    <p className="text-center text-xs text-zinc-400">
                      By continuing, you agree to our{" "}
                      <Link href="/#privacy" className="text-zinc-600 hover:underline">
                        privacy policy
                      </Link>
                      .
                    </p>
                  </form>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      <CoursesFooter />
    </div>
  );
}

