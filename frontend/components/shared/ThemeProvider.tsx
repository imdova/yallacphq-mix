"use client";

import * as React from "react";

const THEME_KEY = "yalla-theme";
type Theme = "light" | "dark" | "system";

function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "system";
  const stored = localStorage.getItem(THEME_KEY) as Theme | null;
  return stored === "light" || stored === "dark" || stored === "system" ? stored : "system";
}

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  const resolved = theme === "system" ? getSystemTheme() : theme;
  root.classList.remove("light", "dark");
  root.classList.add(resolved);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    applyTheme(getStoredTheme());
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyTheme(getStoredTheme());
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, []);
  return <>{children}</>;
}
