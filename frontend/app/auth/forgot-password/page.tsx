"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowLeft } from "lucide-react";
import { getErrorMessage } from "@/lib/api/error";
import { authForgotPassword } from "@/lib/dal/auth";

export default function AuthForgotPasswordPage() {
  const [submitted, setSubmitted] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [devToken, setDevToken] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setDevToken(null);
    try {
      const res = await authForgotPassword(email);
      setDevToken(res.token ?? null);
      setSubmitted(true);
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
          <span className="font-semibold text-zinc-900">Yalla CPHQ</span>
        </Link>
        <span className="text-sm text-zinc-500">Healthcare Quality Portal</span>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-zinc-900">
            Reset your password
          </h1>
          <p className="mt-2 text-zinc-600">
            Enter your email and we&apos;ll send you a link to reset your password.
          </p>

          {submitted ? (
            <div className="mt-8 rounded-lg bg-gold/10 border border-gold/30 p-4 text-sm text-zinc-700">
              <p className="font-medium text-gold">Check your email</p>
              <p className="mt-1">
                If an account exists for that address, we&apos;ve sent a password
                reset link. The link will expire in 24 hours.
              </p>
              <Link
                href="/auth/login"
                className="mt-4 inline-block font-medium text-gold hover:underline"
              >
                Return to login
              </Link>
              {devToken ? (
                <p className="mt-3 text-xs text-zinc-600">
                  Dev reset link:{" "}
                  <Link
                    className="font-mono text-gold hover:underline"
                    href={`/auth/reset-password?token=${encodeURIComponent(devToken)}`}
                  >
                    open reset page
                  </Link>
                </p>
              ) : null}
            </div>
          ) : (
            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-zinc-700">
                  Email address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <Input
                    type="email"
                    name="email"
                    placeholder="name@organization.com"
                    className="h-11 pl-10 rounded-lg border-zinc-200"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                {loading ? "Sending…" : "Send reset link"}
                <span aria-hidden>→</span>
              </Button>
            </form>
          )}
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-zinc-500">
        © 2026 Yalla CPHQ. All rights reserved.
      </footer>
    </div>
  );
}

