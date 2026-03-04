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
import { ArrowRight } from "lucide-react";
import { registerOffer } from "@/lib/dal/leads";
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
  // Arab countries (order: Egypt, Saudi, UAE, Oman, Bahrain, Qatar, then others)
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
  // USA, Canada, Australia, Britain (+1-us / +1-ca so Select can distinguish USA vs Canada)
  { value: "+1-us", label: "+1 (USA)", cc: "us" },
  { value: "+1-ca", label: "+1 (Canada)", cc: "ca" },
  { value: "+61", label: "+61 (Australia)", cc: "au" },
  { value: "+44", label: "+44 (Britain)", cc: "gb" },
];

type SubmitStatus = "idle" | "loading" | "success" | "error";

export function Register1Form() {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [countryCode, setCountryCode] = React.useState("+20");
  const [phone, setPhone] = React.useState("");
  const [specialty, setSpecialty] = React.useState("");
  const [status, setStatus] = React.useState<SubmitStatus>("idle");
  const [errorMessage, setErrorMessage] = React.useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setStatus("loading");
    try {
      const dialCode = countryCode.startsWith("+1-") ? "+1" : countryCode;
      const codeOnly = dialCode.replace(/^\+/, "");
      const fullPhone = codeOnly + phone.trim().replace(/\s/g, "");
      const res = await registerOffer({
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
      setErrorMessage(getErrorMessage(err, "Network error. Please check your connection and try again."));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label className="text-xs font-semibold uppercase tracking-wide text-zinc-600">
          Full Name
        </Label>
        <Input
          type="text"
          placeholder="John Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-11 rounded-lg border-zinc-300 bg-zinc-50"
          required
        />
      </div>
      <div className="space-y-2">
        <Label className="text-xs font-semibold uppercase tracking-wide text-zinc-600">
          Email Address
        </Label>
        <Input
          type="email"
          placeholder="email@healthcare.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-11 rounded-lg border-zinc-300 bg-zinc-50"
          required
        />
      </div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex-1 space-y-2">
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
        <div className="min-w-0 flex-1 space-y-2 sm:min-w-[180px]">
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
      </div>
      {status === "error" && errorMessage && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {errorMessage}
        </p>
      )}
      {status === "success" && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800" role="status">
          Thank you! You&apos;re registered. We&apos;ll be in touch.
        </p>
      )}
      <Button
        type="submit"
        disabled={status === "loading"}
        className="h-12 w-full bg-gold text-gold-foreground hover:bg-gold/90 font-semibold uppercase tracking-wide gap-2 disabled:opacity-70"
      >
        {status === "loading" ? (
          "Sending…"
        ) : (
          <>
            Watch Free Lecture Now
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </Button>
      <p className="text-center text-xs text-zinc-400">
        We value your privacy. Your data is encrypted & secure.
      </p>
    </form>
  );
}
