"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { getErrorMessage } from "@/lib/api/error";
import { getCurrentUser, updateCurrentUser } from "@/lib/dal/user";
import { useAuth } from "@/contexts/auth-context";
import {
  Calendar,
  CheckCircle2,
  ChevronDown,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Monitor,
  Shield,
  Smartphone,
  User,
} from "lucide-react";

type FormState = {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  gender: "male" | "female" | "";
  hasWhatsapp: boolean;
  category: string;
  specialization: string;
  country: string;
  state: string;
  city: string;
  email: string;
  phoneCountry: string;
  phoneNumber: string;
};

const initialState: FormState = {
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  nationality: "",
  email: "",
  gender: "",
  hasWhatsapp: false,
  category: "",
  specialization: "",
  country: "",
  state: "",
  city: "",
  phoneCountry: "EG",
  phoneNumber: "",
};

const PHONE_COUNTRIES = [
  { code: "EG", dial: "+20", name: "Egypt", flag: "🇪🇬" },
  { code: "AE", dial: "+971", name: "UAE", flag: "🇦🇪" },
  { code: "SA", dial: "+966", name: "Saudi Arabia", flag: "🇸🇦" },
  { code: "US", dial: "+1", name: "United States", flag: "🇺🇸" },
] as const;

const COUNTRIES = ["Egypt", "UAE", "Saudi Arabia", "Qatar", "Kuwait", "United States"] as const;

const STATES_BY_COUNTRY: Record<string, string[]> = {
  Egypt: ["Cairo", "Giza", "Alexandria"],
  UAE: ["Dubai", "Abu Dhabi", "Sharjah"],
  "Saudi Arabia": ["Riyadh", "Jeddah", "Dammam"],
  Qatar: ["Doha"],
  Kuwait: ["Kuwait City"],
  "United States": ["California", "Texas", "New York"],
};

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs font-semibold text-zinc-600">{label}</div>
        {hint ? <div className="text-xs text-zinc-400">{hint}</div> : null}
      </div>
      {children}
    </div>
  );
}

export function StudentSettingsView() {
  type Section = "personal" | "security";

  const searchParams = useSearchParams();
  const router = useRouter();
  const { logout, refresh } = useAuth();
  const [form, setForm] = React.useState<FormState>(initialState);
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [section, setSection] = React.useState<Section>("security");
  const [avatarUrl, setAvatarUrl] = React.useState<string>("");
  const avatarInputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    const s = searchParams.get("section");
    if (s === "personal") setSection("personal");
    if (s === "security") setSection("security");
  }, [searchParams]);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const me = await getCurrentUser();
        if (cancelled) return;
        if (!me) {
          setError("UNAUTHENTICATED");
          return;
        }
        const parts = me.name.trim().split(/\s+/);
        const firstName = parts[0] ?? "";
        const lastName = parts.slice(1).join(" ");
        setForm((p) => ({
          ...p,
          firstName,
          lastName,
          email: me.email,
          country: me.country ?? p.country,
          specialization: me.speciality ?? p.specialization,
          phoneNumber: (me.phone ?? "").replace(/[^\d]/g, ""),
        }));
      } catch (e) {
        if (!cancelled) setError(getErrorMessage(e, "Failed to load settings"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const personalCompletion = React.useMemo(() => {
    const keys: (keyof FormState)[] = [
      "firstName",
      "lastName",
      "gender",
      "dateOfBirth",
      "nationality",
      "category",
      "specialization",
      "country",
      "state",
      "city",
      "email",
      "phoneNumber",
    ];
    const completed = keys.reduce((acc, k) => {
      const v = String(form[k] ?? "").trim();
      return acc + (v ? 1 : 0);
    }, 0);
    return { completed, total: keys.length, pct: Math.round((completed / keys.length) * 100) };
  }, [form]);

  const states = React.useMemo(() => {
    return STATES_BY_COUNTRY[form.country] ?? [];
  }, [form.country]);

  const [countriesLoading, setCountriesLoading] = React.useState(true);

  React.useEffect(() => {
    const t = window.setTimeout(() => setCountriesLoading(false), 650);
    return () => window.clearTimeout(t);
  }, []);

  React.useEffect(() => {
    return () => {
      if (avatarUrl?.startsWith("blob:")) URL.revokeObjectURL(avatarUrl);
    };
  }, [avatarUrl]);

  const [twoFactor, setTwoFactor] = React.useState(false);
  const [password, setPassword] = React.useState({
    current: "",
    next: "",
    confirm: "",
  });

  const save = async () => {
    setSaving(true);
    setSaved(false);
    try {
      setError(null);
      const name = `${form.firstName} ${form.lastName}`.trim();
      const phone = form.phoneNumber.trim() ? form.phoneNumber.trim() : undefined;
      const speciality = form.specialization.trim() ? form.specialization.trim() : undefined;
      const country = form.country.trim() ? form.country.trim() : undefined;
      await updateCurrentUser({
        ...(name ? { name } : {}),
        ...(phone ? { phone } : {}),
        ...(speciality ? { speciality } : {}),
        ...(country ? { country } : {}),
      });
      await refresh();
      setSaved(true);
    } catch (e) {
      setError(getErrorMessage(e, "Failed to save changes"));
    } finally {
      setSaving(false);
      window.setTimeout(() => setSaved(false), 2000);
    }
  };

  const reset = () => {
    setForm(initialState);
    setTwoFactor(false);
    setPassword({ current: "", next: "", confirm: "" });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 md:text-3xl">
          Profile Settings
        </h1>
      </div>

      {error && error !== "UNAUTHENTICATED" ? (
        <Card className="rounded-2xl border-rose-200 bg-rose-50 shadow-sm">
          <CardContent className="p-5">
            <div className="text-sm font-semibold text-rose-800">Something went wrong</div>
            <div className="mt-1 text-sm text-rose-700">{error}</div>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[260px_1fr] lg:gap-10">
        <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
          <CardContent className="p-3">
            {(
              [
                { id: "personal", label: "Personal Info", icon: User },
                { id: "security", label: "Security & Password", icon: Shield },
              ] as const
            ).map((item) => {
              const active = section === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSection(item.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
                    active
                      ? "bg-gold/10 text-zinc-900 ring-1 ring-gold/30"
                      : "text-zinc-700 hover:bg-zinc-50"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-xl",
                      active ? "bg-gold text-gold-foreground" : "bg-zinc-100 text-zinc-600"
                    )}
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                  </span>
                  <span className="text-left">{item.label}</span>
                </button>
              );
            })}

            <div className="mt-3 rounded-2xl border border-zinc-200 bg-zinc-50/50 p-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Tip
              </div>
              <p className="mt-1 text-sm text-zinc-600">
                Keep your info up to date for certificates and receipts.
              </p>
              <Button
                type="button"
                variant="outline"
                className="mt-3 h-9 w-full rounded-xl border-zinc-200"
                onClick={reset}
                disabled={saving}
              >
                Reset changes
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="min-w-0 space-y-6">
          {section === "personal" ? (
            <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <CardTitle className="text-base">Personal Info</CardTitle>
                    <CardDescription>
                      Your identity details used across your account.
                    </CardDescription>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-xs font-semibold text-zinc-500">Profile completeness</div>
                    <div className="mt-1 inline-flex items-center gap-2">
                      <div className="h-2 w-24 overflow-hidden rounded-full bg-zinc-100">
                        <div
                          className="h-full rounded-full bg-gold"
                          style={{ width: `${personalCompletion.pct}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-zinc-700">
                        {personalCompletion.completed}/{personalCompletion.total}
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6 pt-0">
                <div className="grid gap-4 rounded-2xl border border-zinc-200 bg-zinc-50/40 p-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <div className="grid gap-4 sm:grid-cols-[140px_1fr] sm:items-start">
                      <div className="space-y-2">
                        <div className="text-xs font-semibold text-zinc-600">Profile picture</div>
                        <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-lime-400 p-4">
                          <button
                            type="button"
                            onClick={() => avatarInputRef.current?.click()}
                            className="mx-auto flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-[3px] border-white bg-white/30 shadow-sm ring-1 ring-black/10 transition hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
                            style={
                              avatarUrl
                                ? {
                                    backgroundImage: `url(${avatarUrl})`,
                                    backgroundSize: "cover",
                                    backgroundPosition: "center",
                                  }
                                : undefined
                            }
                            aria-label="Upload profile picture"
                          >
                            {!avatarUrl ? (
                              <span className="text-lg font-bold text-white drop-shadow">
                                {(form.firstName[0] ?? "A").toUpperCase()}
                                {(form.lastName[0] ?? "A").toUpperCase()}
                              </span>
                            ) : (
                              <span className="sr-only">Profile picture</span>
                            )}
                          </button>
                          <input
                            ref={avatarInputRef}
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const next = URL.createObjectURL(file);
                              setAvatarUrl((prev) => {
                                if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
                                return next;
                              });
                            }}
                          />
                        </div>
                      </div>

                      <div className="grid gap-4 pt-6 sm:grid-cols-2 sm:pt-7">
                        <Field label="First Name">
                          <div className="relative">
                            <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                            <Input
                              value={form.firstName}
                              onChange={(e) =>
                                setForm((p) => ({ ...p, firstName: e.target.value }))
                              }
                              className="h-10 rounded-xl border-zinc-200 bg-white pl-9"
                            />
                          </div>
                        </Field>

                        <Field label="Last Name">
                          <div className="relative">
                            <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                            <Input
                              value={form.lastName}
                              onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
                              className="h-10 rounded-xl border-zinc-200 bg-white pl-9"
                            />
                          </div>
                        </Field>
                      </div>
                    </div>
                  </div>

                  <Field label="Phone Number">
                    <div className="flex h-10 overflow-hidden rounded-xl border border-zinc-200 bg-white">
                      <Select
                        value={form.phoneCountry}
                        onValueChange={(v) => setForm((p) => ({ ...p, phoneCountry: v }))}
                      >
                        <SelectTrigger className="h-10 w-[132px] border-0 bg-transparent px-3">
                          <SelectValue placeholder="+20" />
                        </SelectTrigger>
                        <SelectContent>
                          {PHONE_COUNTRIES.map((c) => (
                            <SelectItem key={c.code} value={c.code}>
                              {c.flag} {c.dial}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="w-px bg-zinc-200" />
                      <Input
                        value={form.phoneNumber}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            phoneNumber: e.target.value.replace(/[^\d]/g, ""),
                          }))
                        }
                        placeholder="1220707190"
                        className="h-10 border-0 bg-transparent px-3 focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                    </div>
                    <label className="mt-2 flex items-center gap-2 text-sm text-zinc-600">
                      <Checkbox
                        checked={form.hasWhatsapp}
                        onCheckedChange={(v) => setForm((p) => ({ ...p, hasWhatsapp: Boolean(v) }))}
                        className="border-zinc-300 data-[state=checked]:border-gold data-[state=checked]:bg-gold"
                      />
                      I have WhatsApp on this number
                    </label>
                  </Field>

                  <Field label="Email">
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                      <Input
                        type="email"
                        value={form.email}
                        readOnly
                        disabled
                        placeholder="name@example.com"
                        className="h-10 rounded-xl border-zinc-200 bg-white pl-9"
                      />
                    </div>
                    {form.email.trim().includes("@") ? (
                      <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Email looks good
                      </div>
                    ) : null}
                  </Field>

                  <Field label="Gender">
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setForm((p) => ({ ...p, gender: "male" }))}
                        className={cn(
                          "flex h-10 items-center justify-center gap-2 rounded-xl border text-sm font-semibold transition-colors",
                          form.gender === "male"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                            : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
                        )}
                      >
                        Male
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm((p) => ({ ...p, gender: "female" }))}
                        className={cn(
                          "flex h-10 items-center justify-center gap-2 rounded-xl border text-sm font-semibold transition-colors",
                          form.gender === "female"
                            ? "border-rose-200 bg-rose-50 text-rose-800"
                            : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
                        )}
                      >
                        Female
                      </button>
                    </div>
                  </Field>

                  <Field label="Date of Birth">
                    <div className="relative">
                      <Calendar className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                      <Input
                        type="date"
                        value={form.dateOfBirth}
                        onChange={(e) => setForm((p) => ({ ...p, dateOfBirth: e.target.value }))}
                        className="h-10 rounded-xl border-zinc-200 bg-white pr-9"
                      />
                    </div>
                  </Field>

                  <div className="grid gap-4 sm:col-span-2 sm:grid-cols-3">
                    <Field label="Category">
                      <Select
                        value={form.category}
                        onValueChange={(v) => setForm((p) => ({ ...p, category: v }))}
                      >
                        <SelectTrigger className="h-10 rounded-xl border-zinc-200 bg-white">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {[
                            "Business Administration",
                            "Healthcare Management",
                            "Nursing",
                            "Public Health",
                            "Quality Improvement",
                          ].map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>

                    <Field label="Specialization">
                      <div className="relative">
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-transparent" />
                        <Input
                          value={form.specialization}
                          onChange={(e) => setForm((p) => ({ ...p, specialization: e.target.value }))}
                          className="h-10 rounded-xl border-zinc-200 bg-white"
                        />
                      </div>
                    </Field>

                    <Field label="Nationality">
                      <Input
                        value={form.nationality}
                        onChange={(e) => setForm((p) => ({ ...p, nationality: e.target.value }))}
                        className="h-10 rounded-xl border-zinc-200 bg-white"
                      />
                    </Field>
                  </div>

                  <div className="grid gap-4 sm:col-span-2 sm:grid-cols-3">
                    <Field label="Residence Country">
                      <Select
                        value={form.country}
                        onValueChange={(v) =>
                          setForm((p) => ({
                            ...p,
                            country: v,
                            state: STATES_BY_COUNTRY[v]?.[0] ?? "",
                          }))
                        }
                        disabled={countriesLoading}
                      >
                        <SelectTrigger className="h-10 rounded-xl border-zinc-200 bg-white">
                          <SelectValue placeholder={countriesLoading ? "Loading countries…" : "Select"} />
                        </SelectTrigger>
                        <SelectContent>
                          {COUNTRIES.map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>

                    <Field label="State">
                      <Select
                        value={form.state}
                        onValueChange={(v) => setForm((p) => ({ ...p, state: v }))}
                        disabled={countriesLoading || states.length === 0}
                      >
                        <SelectTrigger className="h-10 rounded-xl border-zinc-200 bg-white">
                          <SelectValue placeholder={states.length === 0 ? "Select state…" : "Select"} />
                        </SelectTrigger>
                        <SelectContent>
                          {states.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>

                    <Field label="City">
                      <div className="relative">
                        <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                        <Input
                          value={form.city}
                          onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
                          className="h-10 rounded-xl border-zinc-200 bg-white pl-9"
                        />
                      </div>
                    </Field>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : null}

          {section === "security" ? (
            <>
              <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Lock className="h-4 w-4 text-gold" />
                    Change Password
                  </CardTitle>
                  <CardDescription>
                    Use a strong password you don’t reuse elsewhere.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid gap-4">
                    <Field label="Current Password">
                      <Input
                        type="password"
                        value={password.current}
                        onChange={(e) => setPassword((p) => ({ ...p, current: e.target.value }))}
                        placeholder="Enter current password"
                        className="h-10 rounded-xl border-zinc-200 bg-white"
                      />
                    </Field>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="New Password">
                        <Input
                          type="password"
                          value={password.next}
                          onChange={(e) => setPassword((p) => ({ ...p, next: e.target.value }))}
                          placeholder="New password"
                          className="h-10 rounded-xl border-zinc-200 bg-white"
                        />
                      </Field>
                      <Field label="Confirm New Password">
                        <Input
                          type="password"
                          value={password.confirm}
                          onChange={(e) => setPassword((p) => ({ ...p, confirm: e.target.value }))}
                          placeholder="Confirm new password"
                          className="h-10 rounded-xl border-zinc-200 bg-white"
                        />
                      </Field>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
                <CardContent className="flex items-center justify-between gap-6 p-5">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-zinc-900">
                      Two‑Factor Authentication
                    </div>
                    <div className="mt-1 text-sm text-zinc-600">
                      Add an extra layer of security to your account. We’ll send a code when you
                      sign in from a new device.
                    </div>
                  </div>
                  <Switch
                    checked={twoFactor}
                    onCheckedChange={(checked) => setTwoFactor(Boolean(checked))}
                    className="data-[state=checked]:bg-gold"
                  />
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Login Activity</CardTitle>
                  <CardDescription>Devices currently signed into your account.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  <div className="flex items-center justify-between gap-4 rounded-2xl border border-zinc-200 bg-zinc-50/50 px-4 py-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-zinc-700 ring-1 ring-zinc-200">
                        <Monitor className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-zinc-900">
                          MacBook Pro · Dubai, UAE
                        </div>
                        <div className="text-xs text-zinc-500">Chrome Browser · Active now</div>
                      </div>
                    </div>
                    <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                      Current device
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4 rounded-2xl border border-zinc-200 bg-white px-4 py-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700 ring-1 ring-zinc-200/80">
                        <Smartphone className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-zinc-900">
                          iPhone 15 Pro · Abu Dhabi, UAE
                        </div>
                        <div className="text-xs text-zinc-500">Yalla CPHQ App · 2 hours ago</div>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-9 rounded-xl border-zinc-200 text-zinc-700"
                      onClick={async () => {
                        await logout();
                        router.push("/auth/login");
                      }}
                    >
                      <LogOut className="h-4 w-4" />
                      Log out
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : null}

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-xl border-zinc-200"
              onClick={reset}
              disabled={saving || loading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className={cn(
                "h-10 rounded-xl bg-gold text-gold-foreground hover:bg-gold/90",
                saved && "bg-emerald-600 hover:bg-emerald-600"
              )}
              onClick={() => void save()}
              disabled={saving || loading}
            >
              {saving ? "Saving…" : saved ? "Saved" : "Save changes"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
