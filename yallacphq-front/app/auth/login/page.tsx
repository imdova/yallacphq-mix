import { Suspense } from "react";
import { LoginClient } from "./LoginClient";

export default function AuthLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginClient />
    </Suspense>
  );
}

