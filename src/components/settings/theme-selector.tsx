"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { apiFetch } from "@/lib/api-client";
import type { ThemePreference } from "@/lib/constants";
import { applyTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

export function ThemeSelector({ theme }: { theme: ThemePreference }) {
  const router = useRouter();
  const [selected, setSelected] = useState(theme);

  async function choose(next: ThemePreference) {
    const previous = selected;
    setSelected(next);
    applyTheme(next);
    try {
      await apiFetch("/api/settings", { method: "PATCH", body: { theme: next } });
      router.refresh();
    } catch (error) {
      setSelected(previous);
      applyTheme(previous);
      toast.error(error instanceof Error ? error.message : "Could not save.");
    }
  }

  return (
    <div
      role="group"
      aria-label="Theme"
      className="grid grid-cols-3 gap-1 rounded-xl bg-muted p-1"
    >
      {OPTIONS.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          aria-pressed={selected === value}
          onClick={() => choose(value)}
          className={cn(
            "flex h-10 items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors",
            selected === value
              ? "bg-card text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Icon className="size-4" aria-hidden />
          {label}
        </button>
      ))}
    </div>
  );
}
