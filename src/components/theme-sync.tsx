"use client";

import { useEffect } from "react";

import type { ThemePreference } from "@/lib/constants";
import { applyTheme } from "@/lib/theme";

/** Brings this device in line with the theme saved on the user's account. */
export function ThemeSync({ theme }: { theme: ThemePreference }) {
  useEffect(() => {
    applyTheme(theme);
    if (theme !== "system") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const follow = () => applyTheme("system");
    media.addEventListener("change", follow);
    return () => media.removeEventListener("change", follow);
  }, [theme]);

  return null;
}
