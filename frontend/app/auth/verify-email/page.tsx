import { Suspense } from "react";
import { VerifyEmailClient } from "./VerifyEmailClient";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-50" />}>
      <VerifyEmailClient />
    </Suspense>
  );
}
