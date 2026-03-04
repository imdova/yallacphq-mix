"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Eye, EyeOff, Check, Circle } from "lucide-react";
import { getErrorMessage } from "@/lib/api/error";
import { authResetPassword } from "@/lib/dal/auth";

function requirementMet(value: string, test: (v: string) => boolean) {
  return test(value);
}

export function ResetPasswordClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  const min8 = requirementMet(password, (v) => v.length >= 8);
  const hasUpper = requirementMet(password, (v) => /[A-Z]/.test(v));
  const hasNumber = requirementMet(password, (v) => /[0-9]/.test(v));
  const hasSpecial = requirementMet(password, (v) => /[!@#$%]/.test(v));
  const allMet = min8 && hasUpper && hasNumber && hasSpecial;
  const match = password.length > 0 && password === confirm;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (!allMet || !match) return;
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await authResetPassword(token, password);
      setSuccess(true);
      window.setTimeout(() => router.push("/auth/login"), 700);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      <header className="flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-gold text-gold-foreground font-bold">
            Y
          </span>
          <span className="font-semibold uppercase tracking-wide text-zinc-900">
            Yalla CPHQ
          </span>
        </Link>
        <span className="text-sm text-zinc-500">Healthcare Quality Portal</span>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-zinc-200 border-t-4 border-t-gold bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-zinc-900">Reset Password</h1>
          <p className="mt-2 text-zinc-600">
            Choose a strong password to secure your account.
          </p>

          {!token && (
            <div className="mt-6 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-zinc-700">
              <p className="font-medium text-destructive">Missing token</p>
              <p className="mt-1">
                Please use the reset link from your email. It contains a required
                token.
              </p>
            </div>
          )}

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-600">
                New password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="h-11 pl-10 pr-10 rounded-lg border-zinc-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-600">
                Confirm password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <Input
                  type={showConfirm ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Re-enter password"
                  className="h-11 pl-10 pr-10 rounded-lg border-zinc-200"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                >
                  {showConfirm ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="rounded-lg bg-gold/10 border border-gold/20 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-700">
                Security requirements
              </p>
              <ul className="mt-3 space-y-2 text-sm text-zinc-600">
                <li className="flex items-center gap-2">
                  {min8 ? (
                    <Check className="h-4 w-4 text-gold shrink-0" />
                  ) : (
                    <Circle className="h-4 w-4 text-zinc-300 shrink-0" />
                  )}
                  Minimum 8 characters long
                </li>
                <li className="flex items-center gap-2">
                  {hasUpper ? (
                    <Check className="h-4 w-4 text-gold shrink-0" />
                  ) : (
                    <Circle className="h-4 w-4 text-zinc-300 shrink-0" />
                  )}
                  At least one uppercase letter
                </li>
                <li className="flex items-center gap-2">
                  {hasNumber ? (
                    <Check className="h-4 w-4 text-gold shrink-0" />
                  ) : (
                    <Circle className="h-4 w-4 text-zinc-300 shrink-0" />
                  )}
                  At least one number (0-9)
                </li>
                <li className="flex items-center gap-2">
                  {hasSpecial ? (
                    <Check className="h-4 w-4 text-gold shrink-0" />
                  ) : (
                    <Circle className="h-4 w-4 text-zinc-300 shrink-0" />
                  )}
                  One special character (!@#$%)
                </li>
              </ul>
            </div>

            <Button
              type="submit"
              disabled={!token || !allMet || !match}
              className="h-11 w-full rounded-lg bg-gold text-gold-foreground hover:bg-gold/90 font-semibold gap-2 disabled:opacity-50"
            >
              {loading ? "Updating…" : "Update password"}
              <span aria-hidden>→</span>
            </Button>

            {allMet && match && token && (
              <div className="flex items-center gap-2 rounded-lg border border-gold bg-gold/10 px-3 py-2 text-sm font-medium text-gold">
                <Check className="h-4 w-4 shrink-0" />
                Security verified
              </div>
            )}

            {error ? (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            ) : null}
            {success ? (
              <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                Password updated. Redirecting to login…
              </p>
            ) : null}
          </form>

          <p className="mt-6 text-center">
            <Link
              href="/auth/login"
              className="text-sm font-medium text-gold hover:underline"
            >
              Return to login
            </Link>
          </p>
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-zinc-500">
        © 2026 Yalla CPHQ Healthcare Quality Platform. All rights reserved.
      </footer>
    </div>
  );
}

