import type { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "./session";

export function setSessionCookie(
  res: NextResponse,
  value: string,
  options?: { rememberMe?: boolean }
) {
  const rememberMe = options?.rememberMe ?? false;
  res.cookies.set(SESSION_COOKIE_NAME, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 8, // 30d vs 8h
  });
}

export function clearSessionCookie(res: NextResponse) {
  res.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

