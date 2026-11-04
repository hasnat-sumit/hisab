"use client";

import { useEffect, useState } from "react";

import type { TransactionType } from "@/lib/constants";
import { formatMonth, isValidMonth } from "@/lib/dates";
import {
  previewBreakdown,
  type Breakdown,
  type CategoryTotal,
} from "@/lib/finance";
import { formatTaka } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * The month's totals as they will be once this entry is saved, updating while
 * the user types. Works from the saved totals plus what is in the form.
 */
export function MonthPreview({
  month,
  type,
  category,
  amount,
  original,
}: {
  month: string;
  type: TransactionType;
  category: string;
  amount: number | undefined;
  /** The saved values of the entry being edited, if it is in this month. */
  original?: CategoryTotal;
}) {
  const key = `${month}/${type}`;
  const [loaded, setLoaded] = useState<{
    key: string;
    breakdown: Breakdown;
  } | null>(null);

  useEffect(() => {
    if (!isValidMonth(month)) return;
    const controller = new AbortController();
    fetch(`/api/transactions/summary?month=${month}&type=${type}`, {
      signal: controller.signal,
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((breakdown: Breakdown | null) => {
        if (breakdown) setLoaded({ key: `${month}/${type}`, breakdown });
      })
      // The preview is a convenience, so a failure just leaves it hidden.
      .catch(() => {});
    return () => controller.abort();
  }, [month, type]);

  if (loaded?.key !== key) return null;
  const preview = previewBreakdown(loaded.breakdown, {
    category: category.trim(),
    amount,
    original,
  });
  const isIncome = type === "income";

  return (
    <div
      aria-live="polite"
      data-testid="month-preview"
      className="grid grid-cols-1 gap-1.5 rounded-lg bg-muted p-3 text-sm"
    >
      <div className="flex items-baseline justify-between gap-3 font-medium">
        <span className="min-w-0 truncate">
          {isIncome ? "Income" : "Expenses"}, {formatMonth(month)}
        </span>
        <span
          className={cn(
            "shrink-0 tabular-nums",
            isIncome ? "text-income" : "text-expense",
          )}
        >
          {formatTaka(preview.total)}
        </span>
      </div>
      {preview.rows.map((row) => (
        <div
          key={row.category}
          className={cn(
            "flex items-baseline justify-between gap-3 text-xs text-muted-foreground",
            row.category === category.trim() && "font-medium text-foreground",
          )}
        >
          <span className="min-w-0 truncate">{row.category}</span>
          <span className="shrink-0 tabular-nums">
            {formatTaka(row.amount)}
          </span>
        </div>
      ))}
    </div>
  );
}
