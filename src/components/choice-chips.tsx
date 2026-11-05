"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type ChipOption = {
  value: string;
  label: string;
  /** Shown right after the chip, such as a delete button. */
  trailing?: ReactNode;
};

/** Shows every option at once, so nothing is chosen for the user. */
export function ChoiceChips({
  id,
  label,
  options,
  value,
  onChange,
  invalid,
}: {
  id?: string;
  label: string;
  options: readonly ChipOption[];
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
}) {
  return (
    <div
      id={id}
      role="group"
      aria-label={label}
      className={cn(
        "flex flex-wrap gap-2 rounded-lg",
        invalid && "ring-3 ring-destructive/20",
      )}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <div key={option.value} className="flex max-w-full items-center">
            <button
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(option.value)}
              className={cn(
                // Long custom names wrap, so they can never widen the form.
                "min-h-10 max-w-full rounded-full border px-3.5 py-1 text-sm font-medium wrap-anywhere transition-colors outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/50 md:min-h-9",
                selected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "bg-card text-foreground hover:bg-muted",
              )}
            >
              {option.label}
            </button>
            {option.trailing}
          </div>
        );
      })}
    </div>
  );
}
