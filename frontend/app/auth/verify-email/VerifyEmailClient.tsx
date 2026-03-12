"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getErrorMessage } from "@/lib/api/error";
import { authResendVerification, authVerifyEmail } from "@/lib/dal/auth";

export function VerifyEmailClient() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const sent = searchParams.get("sent") === "1";
  const [email, setEmail] = React.useState(searchParams.get("email") ?? "");
  const [otp, setOtp] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [resendLoading, setResendLoading] = React.useState(false);
  const [resendSuccess, setResendSuccess] = React.useState(false);
  const autoTriedRef = React.useRef(false);

  React.useEffect(() => {
    if (!token || autoTriedRef.current) return;
    autoTriedRef.current = true;
    setLoading(true);
    setError(null);
    void authVerifyEmail({ token })
      .then(() => setSuccess(true))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [token]);

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await authVerifyEmail({ email, otp });
      setSuccess(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setResendLoading(true);
    setResendSuccess(false);
    setError(null);
    try {
      await authResendVerification(email);
      setResendSuccess(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-zinc-900">Verify your email</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Confirm your account using the email link or the 6-digit OTP code.
        </p>

        {sent ? (
          <div className="mt-6 rounded-lg border border-gold/30 bg-gold/10 p-4 text-sm text-zinc-700">
            Verification email sent. Check your inbox for the link or OTP code.
          </div>
        ) : null}

        {loading && token ? (
          <div className="mt-6 rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700">
            Verifying your email...
          </div>
        ) : null}

        {success ? (
          <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            Your email has been verified successfully.
          </div>
        ) : null}

        {error ? (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {!success ? (
          <form className="mt-6 space-y-4" onSubmit={handleOtpSubmit}>
            <div className="space-y-2">
              <Label>Email address</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Verification code</Label>
              <Input
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="123456"
                required
              />
            </div>
            <Button
              type="submit"
              disabled={loading || !email || otp.length !== 6}
              className="w-full bg-gold text-gold-foreground hover:bg-gold/90"
            >
              {loading ? "Verifying..." : "Verify email"}
            </Button>
          </form>
        ) : null}

        <div className="mt-4 space-y-3">
          <Button
            type="button"
            variant="outline"
            disabled={resendLoading || !email}
            onClick={handleResend}
            className="w-full"
          >
            {resendLoading ? "Sending..." : "Resend verification email"}
          </Button>
          {resendSuccess ? (
            <p className="text-sm text-emerald-700">
              A new verification email has been sent.
            </p>
          ) : null}
        </div>

        <p className="mt-6 text-center text-sm text-zinc-600">
          <Link href="/auth/login" className="font-medium text-gold hover:underline">
            Return to login
          </Link>
        </p>
      </div>
    </div>
  );
}
