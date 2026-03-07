"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { loginBodySchema } from "@/lib/api/contracts/auth";

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

export function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, status, error, user } = useAuth();
  const [showPassword, setShowPassword] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [rememberMe, setRememberMe] = React.useState(false);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});
  const [redirecting, setRedirecting] = React.useState(false);

  React.useEffect(() => {
    if (status !== "authenticated") return;
    const next = searchParams.get("next");
    const role = user?.role;
    // Admin always goes to admin dashboard; others respect ?next= or home
    const destination =
      role === "admin"
        ? "/admin"
        : next && next.startsWith("/")
          ? next
          : "/";
    router.replace(destination);
  }, [router, searchParams, status, user?.role]);

  const loading = status === "loading" || redirecting;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    const parsed = loginBodySchema.safeParse({ email, password, rememberMe });
    if (!parsed.success) {
      setFieldErrors(fieldErrorsFromZod(parsed));
      return;
    }
    const success = await login(parsed.data);
    if (success) setRedirecting(true);
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
        <nav className="flex gap-6 text-sm font-medium text-zinc-600">
          <Link href="/courses" className="hover:text-zinc-900">
            Resources
          </Link>
          <Link href="/dashboard/support" className="hover:text-zinc-900">
            Support
          </Link>
        </nav>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
          <div className="flex justify-center">
            <Image
              src="/brand/logo-auth.png"
              alt="Yalla CPHQ"
              width={240}
              height={100}
              className="h-14 w-auto"
              priority
            />
          </div>
          <h1 className="mt-6 text-center text-2xl font-bold text-zinc-900">Welcome Back</h1>
          <p className="mt-1 text-center text-zinc-600">Access your healthcare quality dashboard</p>

          <form className="mt-8 space-y-5" onSubmit={submit}>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-zinc-700">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <Input
                  type="email"
                  placeholder="name@organization.com"
                  className={`h-11 pl-10 rounded-lg border-zinc-200 ${fieldErrors.email ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors((prev) => { const n = { ...prev }; delete n.email; return n; });
                  }}
                  required
                  aria-invalid={!!fieldErrors.email}
                  aria-describedby={fieldErrors.email ? "login-email-error" : undefined}
                />
              </div>
              {fieldErrors.email ? (
                <p id="login-email-error" className="text-sm text-red-600">{fieldErrors.email}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-zinc-700">Password</Label>
                <Link href="/auth/forgot-password" className="text-sm font-medium text-gold hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={`h-11 pl-10 pr-10 rounded-lg border-zinc-200 ${fieldErrors.password ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors((prev) => { const n = { ...prev }; delete n.password; return n; });
                  }}
                  required
                  minLength={1}
                  aria-invalid={!!fieldErrors.password}
                  aria-describedby={fieldErrors.password ? "login-password-error" : undefined}
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
                <p id="login-password-error" className="text-sm text-red-600">{fieldErrors.password}</p>
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="keep"
                checked={rememberMe}
                onCheckedChange={(v) => setRememberMe(Boolean(v))}
              />
              <Label htmlFor="keep" className="text-sm text-zinc-600 cursor-pointer">
                Keep me logged in
              </Label>
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
              {loading ? (redirecting ? "Redirecting…" : "Signing in…") : "Login to Dashboard"}
              <span aria-hidden>→</span>
            </Button>

            <div className="relative my-6">
              <span className="absolute inset-0 flex items-center" aria-hidden>
                <span className="w-full border-t border-zinc-200" />
              </span>
              <p className="relative flex justify-center text-xs font-medium text-zinc-500">
                <span className="bg-white px-3">Or continue with</span>
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              className="h-11 w-full rounded-lg border-zinc-200 bg-white font-medium text-zinc-800 hover:bg-zinc-50"
              onClick={() => {
                // Wire to your Google OAuth endpoint when ready, e.g. window.location.href = '/api/auth/google';
                window.location.href = "/api/auth/google";
              }}
            >
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" aria-hidden>
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Login with Google
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-600">
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="font-semibold text-gold hover:underline">
              Sign up
            </Link>
          </p>

          <div className="mt-6 flex items-center justify-center gap-2 rounded-lg bg-zinc-50 py-2 text-xs font-medium text-zinc-500">
            <Lock className="h-3.5 w-3.5" />
            Secure login environment
          </div>
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-zinc-500">
        © 2026 Yalla CPHQ. Certified Professional in Healthcare Quality. All rights reserved.
      </footer>
    </div>
  );
}

