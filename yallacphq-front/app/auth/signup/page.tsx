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
import { User, Mail, Briefcase, Lock, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

const SPECIALTIES = [
  "Physician",
  "Nurse",
  "Quality Manager",
  "Healthcare Administrator",
  "Pharmacist",
  "Other",
];

export default function AuthSignupPage() {
  const router = useRouter();
  const { signup, status, error } = useAuth();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [speciality, setSpeciality] = React.useState<string>("");
  const [password, setPassword] = React.useState("");

  React.useEffect(() => {
    if (status === "authenticated") router.push("/dashboard");
  }, [router, status]);

  const loading = status === "loading";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await signup({ name, email, password });
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
                    className="h-11 pl-10 rounded-lg border-zinc-200"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
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
                    className="h-11 pl-10 rounded-lg border-zinc-200"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-zinc-700">
                  Healthcare Specialty
                </Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <Select value={speciality} onValueChange={setSpeciality}>
                    <SelectTrigger className="h-11 pl-10 rounded-lg border-zinc-200">
                      <SelectValue placeholder="Select your specialty" />
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
              <div className="space-y-2">
                <Label className="text-sm font-medium text-zinc-700">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="h-11 pl-10 rounded-lg border-zinc-200"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
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

