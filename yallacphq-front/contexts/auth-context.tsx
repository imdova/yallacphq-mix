"use client";

import * as React from "react";
import type { ApiUser } from "@/lib/api/contracts/user";
import { getErrorMessage } from "@/lib/api/error";
import { authLogin, authLogout, authSignup, type LoginInput, type SignupInput } from "@/lib/dal/auth";
import { getCurrentUser } from "@/lib/dal/user";

type AuthStatus = "idle" | "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  user: ApiUser | null;
  status: AuthStatus;
  error: string | null;
  refresh: () => Promise<void>;
  login: (data: LoginInput) => Promise<void>;
  signup: (data: SignupInput) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<ApiUser | null>(null);
  const [status, setStatus] = React.useState<AuthStatus>("idle");
  const [error, setError] = React.useState<string | null>(null);

  const refresh = React.useCallback(async () => {
    setStatus("loading");
    setError(null);
    try {
      // Prefer /me for user profile data; treat 401 as unauthenticated.
      const user = await getCurrentUser();
      setUser(user);
      setStatus(user ? "authenticated" : "unauthenticated");
    } catch (e) {
      setUser(null);
      setStatus("unauthenticated");
      setError(getErrorMessage(e));
    }
  }, []);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  const login = React.useCallback(async (data: LoginInput) => {
    setStatus("loading");
    setError(null);
    try {
      const res = await authLogin(data);
      setUser(res.user);
      setStatus("authenticated");
    } catch (e) {
      setUser(null);
      setStatus("unauthenticated");
      setError(getErrorMessage(e));
    }
  }, []);

  const signup = React.useCallback(async (data: SignupInput) => {
    setStatus("loading");
    setError(null);
    try {
      const res = await authSignup(data);
      setUser(res.user);
      setStatus("authenticated");
    } catch (e) {
      setUser(null);
      setStatus("unauthenticated");
      setError(getErrorMessage(e));
    }
  }, []);

  const logout = React.useCallback(async () => {
    setStatus("loading");
    setError(null);
    try {
      await authLogout();
    } catch {
      // best-effort; still clear local state
    } finally {
      setUser(null);
      setStatus("unauthenticated");
    }
  }, []);

  const value = React.useMemo<AuthContextValue>(
    () => ({ user, status, error, refresh, login, signup, logout }),
    [user, status, error, refresh, login, signup, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

