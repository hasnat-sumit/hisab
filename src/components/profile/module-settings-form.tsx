"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { apiFetch } from "@/lib/api-client";
import type { ModuleKey, ModuleSettings } from "@/lib/constants";

const MODULES: { key: ModuleKey; label: string; description: string }[] = [
  {
    key: "finance",
    label: "Finance",
    description: "Income, expenses and savings.",
  },
  {
    key: "vehicles",
    label: "Vehicles",
    description: "Bikes and cars, fuel, mileage and documents.",
  },
  {
    key: "analytics",
    label: "Financial analytics",
    description: "Charts on your home page. Needs Finance.",
  },
];

export function ModuleSettingsForm({ modules }: { modules: ModuleSettings }) {
  const router = useRouter();
  const [current, setCurrent] = useState(modules);
  const [saving, setSaving] = useState(false);

  async function toggle(key: ModuleKey, enabled: boolean) {
    const next = { ...current, [key]: enabled };
    setCurrent(next);
    setSaving(true);
    try {
      await apiFetch("/api/settings", {
        method: "PATCH",
        body: { modules: next },
      });
      router.refresh();
    } catch (error) {
      setCurrent(current);
      toast.error(error instanceof Error ? error.message : "Could not save.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ul className="divide-y">
      {MODULES.map(({ key, label, description }) => {
        const unavailable = key === "analytics" && !current.finance;
        return (
          <li key={key}>
            <label className="flex min-h-14 items-center justify-between gap-4 py-2">
              <span className="min-w-0">
                <span className="block text-sm font-medium">{label}</span>
                <span className="block text-xs text-muted-foreground">
                  {description}
                </span>
              </span>
              <input
                type="checkbox"
                role="switch"
                aria-label={label}
                className="size-5 shrink-0 accent-primary"
                checked={current[key] && !unavailable}
                disabled={saving || unavailable}
                onChange={(event) => toggle(key, event.target.checked)}
              />
            </label>
          </li>
        );
      })}
    </ul>
  );
}
