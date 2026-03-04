import { Suspense } from "react";
import { ResetPasswordClient } from "./ResetPasswordClient";

export default function AuthResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordClient />
    </Suspense>
  );
}

