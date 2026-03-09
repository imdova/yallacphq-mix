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
import { Sparkles, Star, Video } from "lucide-react";

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
] as const;

type SubmitStatus = "idle" | "loading" | "success" | "error";

export function CphqForm2View() {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [countryCode, setCountryCode] = React.useState<(typeof COUNTRY_CODES)[number]["value"]>("+20");
  const [phone, setPhone] = React.useState("");
  const [status, setStatus] = React.useState<SubmitStatus>("idle");
  const [errorMessage, setErrorMessage] = React.useState("");

  const isEmailValid = React.useMemo(() => {
    const v = email.trim();
    if (!v) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }, [email]);

  const canSubmit = Boolean(name.trim() && isEmailValid && phone.trim().length >= 5 && status !== "loading");

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
    <div className="relative min-h-screen overflow-hidden bg-[#070a14] text-white">
      {/* Grid + glows */}
      <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:56px_56px]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_40%_at_50%_0%,rgba(56,189,248,0.20),transparent_60%),radial-gradient(70%_55%_at_50%_100%,rgba(59,130,246,0.12),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center px-4 pb-16 pt-12">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="rounded-[22px] border border-white/10 bg-white/[0.06] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.6)] backdrop-blur-xl">
            <div className="flex justify-center">
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-100 ring-1 ring-emerald-500/20">
                <Sparkles className="h-3.5 w-3.5 text-emerald-200" />
                50% off — limited time
              </span>
            </div>

            <h1 className="mt-4 text-center text-2xl font-extrabold leading-snug tracking-tight sm:text-[28px]">
              Build your CPHQ plan and resources
              <br />
              <span className="text-cyan-300">without guesswork</span>
            </h1>
            <p className="mt-3 text-center text-sm leading-relaxed text-white/70">
              Watch a quick video and get a practical roadmap tailored to your current level.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-3.5">
              <div className="space-y-1.5">
                <Label className="sr-only">Full name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name"
                  required
                  className="h-11 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-white/40 focus-visible:ring-cyan-400"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="sr-only">Email</Label>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  type="email"
                  required
                  aria-invalid={email.trim().length > 0 && !isEmailValid}
                  className="h-11 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-white/40 focus-visible:ring-cyan-400"
                />
                {email.trim().length > 0 && !isEmailValid ? (
                  <p className="text-xs text-rose-300">Please enter a valid email.</p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <Label className="sr-only">Phone</Label>
                <div className="flex gap-2">
                  <Select value={countryCode} onValueChange={(v) => setCountryCode(v as typeof countryCode)}>
                    <SelectTrigger className="h-11 w-[128px] shrink-0 rounded-xl border-white/10 bg-white/5 text-white focus:ring-cyan-400">
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
                              <span className="font-semibold">{cur.label}</span>
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
                    placeholder="Phone number"
                    type="tel"
                    required
                    className="h-11 flex-1 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-white/40 focus-visible:ring-cyan-400"
                  />
                </div>
                <p className="pt-1 text-center text-[11px] text-amber-100/80">
                  *Limited spots — first 100 registrations only.
                </p>
              </div>

              {status === "error" && errorMessage ? (
                <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100" role="alert">
                  {errorMessage}
                </div>
              ) : null}

              {status === "success" ? (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100" role="status">
                  You’re in. We’ll contact you soon with the details.
                </div>
              ) : null}

              <Button
                type="submit"
                disabled={!canSubmit}
                className={cn(
                  "h-11 w-full rounded-xl text-sm font-semibold",
                  "bg-gold text-gold-foreground shadow-md hover:bg-gold/90",
                  "disabled:opacity-60"
                )}
              >
                <Video className="mr-2 h-4 w-4" />
                {status === "loading" ? "Sending…" : "Take me to free lecture"}
              </Button>

              <p className="text-center text-[11px] text-white/55">Secure & encrypted.</p>
            </form>
          </div>

          {/* Bullets */}
          <div className="mt-8 space-y-3 text-sm text-white/80">
            {[
              "A realistic study plan you can stick to (no overwhelm).",
              "A structured roadmap with resources and milestones.",
              "A dashboard-style approach to track your progress.",
              "Smart tips that help you pass on the first attempt.",
            ].map((t) => (
              <div key={t} className="flex items-start gap-3">
                <Star className="mt-0.5 h-4 w-4 text-cyan-300" />
                <span>{t}</span>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="mt-10 grid grid-cols-3 gap-3">
            {[
              { k: "0", v: "Coding required" },
              { k: "1000+", v: "Learners" },
              { k: "200+", v: "Hours of content" },
            ].map((s) => (
              <div key={s.v} className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3 text-center backdrop-blur">
                <div className="text-lg font-extrabold text-cyan-200">{s.k}</div>
                <div className="mt-0.5 text-[11px] font-medium text-white/60">{s.v}</div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center text-xs text-white/40">
            <Link href="/" className="hover:text-white/70">
              Yalla CPHQ
            </Link>
            {" · "}
            <Link href="/offers" className="hover:text-white/70">
              Offers
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

