"use client";

import * as React from "react";
import Image from "next/image";
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
import { Lock, ArrowRight } from "lucide-react";
import { registerWebinar } from "@/lib/dal/leads";
import { getErrorMessage } from "@/lib/api/error";

const SPECIALTIES = [
  "Physician",
  "Nurse",
  "Quality Manager",
  "Healthcare Administrator",
  "Pharmacist",
  "Other",
];

const FLAG_CDN = "https://flagcdn.com";
const COUNTRY_CODES = [
  { value: "+20", label: "+20 (Egypt)", cc: "eg" },
  { value: "+966", label: "+966 (Saudi Arabia)", cc: "sa" },
  { value: "+971", label: "+971 (UAE)", cc: "ae" },
  { value: "+968", label: "+968 (Oman)", cc: "om" },
  { value: "+973", label: "+973 (Bahrain)", cc: "bh" },
  { value: "+974", label: "+974 (Qatar)", cc: "qa" },
  { value: "+965", label: "+965 (Kuwait)", cc: "kw" },
  { value: "+962", label: "+962 (Jordan)", cc: "jo" },
  { value: "+961", label: "+961 (Lebanon)", cc: "lb" },
  { value: "+964", label: "+964 (Iraq)", cc: "iq" },
  { value: "+970", label: "+970 (Palestine)", cc: "ps" },
  { value: "+967", label: "+967 (Yemen)", cc: "ye" },
  { value: "+963", label: "+963 (Syria)", cc: "sy" },
  { value: "+213", label: "+213 (Algeria)", cc: "dz" },
  { value: "+212", label: "+212 (Morocco)", cc: "ma" },
  { value: "+218", label: "+218 (Libya)", cc: "ly" },
  { value: "+216", label: "+216 (Tunisia)", cc: "tn" },
  { value: "+249", label: "+249 (Sudan)", cc: "sd" },
  { value: "+1-us", label: "+1 (USA)", cc: "us" },
  { value: "+1-ca", label: "+1 (Canada)", cc: "ca" },
  { value: "+61", label: "+61 (Australia)", cc: "au" },
  { value: "+44", label: "+44 (Britain)", cc: "gb" },
];

// Countdown target: Oct 25, 2025 8:00 PM GMT+3 (example)
const DEFAULT_TARGET = new Date();
DEFAULT_TARGET.setDate(DEFAULT_TARGET.getDate() + 2);
DEFAULT_TARGET.setHours(20, 0, 0, 0);

function useCountdown(target: Date) {
  const [diff, setDiff] = React.useState({ days: 0, hrs: 0, mins: 0 });
  React.useEffect(() => {
    const tick = () => {
      const now = new Date();
      let ms = target.getTime() - now.getTime();
      if (ms <= 0) {
        setDiff({ days: 0, hrs: 0, mins: 0 });
        return;
      }
      const days = Math.floor(ms / (24 * 60 * 60 * 1000));
      ms -= days * 24 * 60 * 60 * 1000;
      const hrs = Math.floor(ms / (60 * 60 * 1000));
      ms -= hrs * 60 * 60 * 1000;
      const mins = Math.floor(ms / (60 * 1000));
      setDiff({ days, hrs, mins });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);
  return diff;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function Webinar1SpotForm() {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [countryCode, setCountryCode] = React.useState("+20");
  const [phone, setPhone] = React.useState("");
  const [specialty, setSpecialty] = React.useState("");
  const [status, setStatus] = React.useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = React.useState("");
  const countdown = useCountdown(DEFAULT_TARGET);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setStatus("loading");
    try {
      const dialCode = countryCode.startsWith("+1-") ? "+1" : countryCode;
      const codeOnly = dialCode.replace(/^\+/, "");
      const fullPhone = codeOnly + phone.trim().replace(/\s/g, "");
      const res = await registerWebinar({
        name: name.trim(),
        email: email.trim(),
        phone: fullPhone,
        specialty,
      });
      if (!res.success) {
        setStatus("error");
        setErrorMessage(res.message || "Registration failed. Please try again.");
        return;
      }
      setStatus("success");
      setName("");
      setEmail("");
      setPhone("");
      setSpecialty("");
    } catch (err) {
      setStatus("error");
      setErrorMessage(getErrorMessage(err, "Network error. Please try again."));
    }
  };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-lg md:p-8">
      <h3 className="text-xl font-bold tracking-tight text-zinc-900">Save My Spot</h3>
      <p className="mt-1 text-sm text-zinc-500">Fill in the details below to receive your webinar link.</p>

      <div className="mt-6 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-red-600">
          HURRY! ONLY 25 SPOTS LEFT
        </p>
        <div className="rounded-xl bg-gold/90 px-4 py-3 text-gold-foreground">
          <div className="flex items-baseline justify-center gap-1 font-mono text-2xl font-bold tabular-nums md:text-3xl">
            <span>{pad(countdown.days)}</span>
            <span className="opacity-80"> : </span>
            <span>{pad(countdown.hrs)}</span>
            <span className="opacity-80"> : </span>
            <span>{pad(countdown.mins)}</span>
          </div>
          <div className="mt-1 flex justify-center gap-6 text-xs font-medium uppercase opacity-90">
            <span>Days</span>
            <span>Hrs</span>
            <span>Mins</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wide text-zinc-600">Full Name</Label>
          <Input
            type="text"
            placeholder="Dr. John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-11 rounded-lg border-zinc-300 bg-zinc-50"
            required
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wide text-zinc-600">Email</Label>
          <Input
            type="email"
            placeholder="john@hospital.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11 rounded-lg border-zinc-300 bg-zinc-50"
            required
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wide text-zinc-600">
            Phone
          </Label>
          <div className="flex gap-2">
            <Select value={countryCode} onValueChange={setCountryCode} required>
              <SelectTrigger className="h-11 w-[140px] shrink-0 rounded-lg border-zinc-300 bg-zinc-50">
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
                        <span>{cur.label}</span>
                      </span>
                    ) : (
                      countryCode
                    );
                  })()}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {COUNTRY_CODES.map(({ value, label, cc }) => (
                  <SelectItem key={value} value={value}>
                    <span className="flex items-center gap-2">
                      <Image
                        src={`${FLAG_CDN}/24x18/${cc}.png`}
                        alt=""
                        width={24}
                        height={18}
                        className="shrink-0 rounded-sm object-cover"
                      />
                      <span>{label}</span>
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
              className="h-11 flex-1 rounded-lg border-zinc-300 bg-zinc-50"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wide text-zinc-600">
            Speciality
          </Label>
          <Select value={specialty} onValueChange={setSpecialty} required>
            <SelectTrigger className="h-11 w-full rounded-lg border-zinc-300 bg-zinc-50">
              <SelectValue placeholder="Select speciality" />
            </SelectTrigger>
            <SelectContent>
              {SPECIALTIES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {status === "error" && errorMessage && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {errorMessage}
          </p>
        )}
        {status === "success" && (
          <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800" role="status">
            You&apos;re registered! We&apos;ll send your webinar link to your email.
          </p>
        )}
        <Button
          type="submit"
          disabled={status === "loading"}
          className="h-12 w-full rounded-lg bg-gold text-gold-foreground hover:bg-gold/90 font-semibold gap-2"
        >
          {status === "loading" ? "Sending…" : "Register Now"}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </form>

      <p className="mt-4 flex items-center gap-2 text-xs text-zinc-500">
        <Lock className="h-3.5 w-3.5 shrink-0" />
        100% Secure & Private Registration
      </p>

      <div className="mt-6 flex items-center gap-3">
        <div
          className="h-12 w-12 shrink-0 rounded-full bg-zinc-300 bg-cover bg-center"
          style={{ backgroundImage: "url(https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=96&h=96&fit=crop&crop=face)" }}
        />
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">HOSTED BY</p>
          <p className="text-sm font-medium text-zinc-900">Dr. Jane Smith, CPHQ</p>
        </div>
      </div>
    </div>
  );
}
