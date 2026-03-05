"use client";

import * as React from "react";
import Link from "next/link";
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
import { User, Mail, Briefcase, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { signupBodySchema } from "@/lib/api/contracts/auth";
import { getPublicStudentFieldOptions } from "@/lib/dal/settings";

const FALLBACK_SPECIALITIES = [
  "Quality Management",
  "Patient Safety",
  "Healthcare Administration",
  "Compliance",
  "Other",
];

function fieldErrorsFromZod(
  result: { success: false; error: { issues: { path: (string | number)[]; message: string }[] } }
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

export default function AuthSignupPage() {
  const router = useRouter();
  const { signup, status, error } = useAuth();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [speciality, setSpeciality] = React.useState<string>("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});
  const [specialities, setSpecialities] = React.useState<string[]>(FALLBACK_SPECIALITIES);

  React.useEffect(() => {
    getPublicStudentFieldOptions().then((opts) => {
      const list = opts.specialities?.length ? opts.specialities : FALLBACK_SPECIALITIES;
      setSpecialities(list);
    });
  }, []);

  React.useEffect(() => {
    if (status === "authenticated") router.replace("/dashboard");
  }, [router, status]);

  const loading = status === "loading";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    const parsed = signupBodySchema.safeParse({ name, email, password, speciality });
    if (!parsed.success) {
      setFieldErrors(fieldErrorsFromZod(parsed));
      return;
    }
    const success = await signup(parsed.data);
    if (success) router.replace("/dashboard");
  };

  return (
    <div className="min-h-screen flex bg-zinc-50">
      <div className="hidden lg:flex lg:w-1/2 relative bg-zinc-900 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-60"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&q=80)",
          }}
        />
        <div className="relative z-10 flex flex-col justify-end p-8 pb-12">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded bg-gold text-gold-foreground">
              ✓
            </span>
            <span className="font-semibold text-white">Yalla CPHQ</span>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-white">
            Join 5,000+ Healthcare Leaders
          </h2>
          <p className="mt-2 text-gold">
            — Elevating healthcare quality standards worldwide.
          </p>
          <div className="mt-4 border-b-2 border-dashed border-gold/50 w-24" />
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <header className="flex justify-end p-4 md:p-6">
          <p className="text-sm text-zinc-600">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="font-semibold text-gold hover:underline"
            >
              Login
            </Link>
          </p>
        </header>

        <main className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-md">
            <h1 className="text-2xl font-bold text-zinc-900">
              Create Your Account
            </h1>
            <p className="mt-1 text-zinc-600">
              Start your journey toward CPHQ certification today.
            </p>

            <form className="mt-8 space-y-5" onSubmit={submit}>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-zinc-700">
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <Input
                    type="text"
                    placeholder="Dr. Sarah Johnson"
                    className={`h-11 pl-10 rounded-lg border-zinc-200 ${fieldErrors.name ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (fieldErrors.name) setFieldErrors((prev) => { const n = { ...prev }; delete n.name; return n; });
                    }}
                    required
                    aria-invalid={!!fieldErrors.name}
                    aria-describedby={fieldErrors.name ? "name-error" : undefined}
                  />
                </div>
                {fieldErrors.name ? (
                  <p id="name-error" className="text-sm text-red-600">
                    {fieldErrors.name}
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-zinc-700">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <Input
                    type="email"
                    placeholder="name@hospital.com"
                    className={`h-11 pl-10 rounded-lg border-zinc-200 ${fieldErrors.email ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (fieldErrors.email) setFieldErrors((prev) => { const n = { ...prev }; delete n.email; return n; });
                    }}
                    required
                    aria-invalid={!!fieldErrors.email}
                    aria-describedby={fieldErrors.email ? "email-error" : undefined}
                  />
                </div>
                {fieldErrors.email ? (
                  <p id="email-error" className="text-sm text-red-600">
                    {fieldErrors.email}
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-zinc-700">
                  Healthcare Specialty <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <Select
                    value={speciality}
                    onValueChange={setSpeciality}
                    required
                  >
                    <SelectTrigger className={`h-11 pl-10 rounded-lg border-zinc-200 ${fieldErrors.speciality ? "border-red-500 focus-visible:ring-red-500" : ""}`}>
                      <SelectValue placeholder="Select your specialty" />
                    </SelectTrigger>
                    <SelectContent>
                      {specialities.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {fieldErrors.speciality ? (
                  <p className="text-sm text-red-600">{fieldErrors.speciality}</p>
                ) : (
                  <p className="text-xs text-zinc-500">Choose the specialty set by your institution.</p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-zinc-700">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 8 characters"
                    minLength={8}
                    className={`h-11 pl-10 pr-10 rounded-lg border-zinc-200 ${fieldErrors.password ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (fieldErrors.password) setFieldErrors((prev) => { const n = { ...prev }; delete n.password; return n; });
                    }}
                    required
                    aria-invalid={!!fieldErrors.password}
                    aria-describedby={fieldErrors.password ? "password-error" : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {fieldErrors.password ? (
                  <p id="password-error" className="text-sm text-red-600">
                    {fieldErrors.password}
                  </p>
                ) : (
                  <p className="text-xs text-zinc-500">Must be at least 8 characters</p>
                )}
              </div>

              {error ? (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </p>
              ) : null}

              <Button
                type="submit"
                disabled={loading}
                className="h-11 w-full rounded-lg bg-gold text-gold-foreground hover:bg-gold/90 font-semibold gap-2"
              >
                {loading ? "Creating…" : "Create My Account"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

            <div className="mt-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-zinc-200" />
              <span className="text-xs font-medium uppercase text-zinc-400">
                Or join with
              </span>
              <div className="h-px flex-1 bg-zinc-200" />
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-lg border-zinc-200 gap-2"
              >
                <span className="text-base font-bold">G</span>
                Google
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-lg border-zinc-200 gap-2"
              >
                in
                LinkedIn
              </Button>
            </div>

            <p className="mt-6 text-center text-xs text-zinc-500">
              By signing up, you agree to our{" "}
              <Link href="/terms" className="text-gold hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-gold hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

