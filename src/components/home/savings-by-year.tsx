"use client";

import { useState } from "react";

import { SimpleSelect } from "@/components/simple-select";
import { Card } from "@/components/ui/card";
import { formatMonth } from "@/lib/dates";
import {
  monthlySeries,
  periodSummary,
  yearsWithRecords,
  type FinanceRow,
} from "@/lib/finance";
import { formatTaka } from "@/lib/format";
import { cn } from "@/lib/utils";

export function SavingsByYear({
  rows,
  initialYear,
}: {
  rows: FinanceRow[];
  initialYear: string;
}) {
  const years = yearsWithRecords(rows);
  const options = [...new Set([...years, initialYear])].sort().reverse();
  const [year, setYear] = useState(initialYear);

  const summary = periodSummary(rows, year);
  const months = monthlySeries(rows, year);
  return (
    <Card className="gap-3 p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-semibold">Savings by year</h2>
        <SimpleSelect
          label="Savings year"
          value={year}
          onChange={setYear}
          options={options.map((value) => ({ value, label: value }))}
          className="w-28!"
        />
      </div>
      <dl className="grid grid-cols-3 gap-2 text-sm">
        <div className="min-w-0">
          <dt className="text-xs text-muted-foreground">Income</dt>
          <dd className="font-semibold text-income wrap-anywhere">
            {formatTaka(summary.income)}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-xs text-muted-foreground">Expenses</dt>
          <dd className="font-semibold text-expense wrap-anywhere">
            {formatTaka(summary.expenses)}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-xs text-muted-foreground">Saved</dt>
          <dd
            data-testid="year-savings"
            className={cn(
              "font-semibold wrap-anywhere",
              summary.savings < 0 ? "text-expense" : "text-accent-foreground",
            )}
          >
            {formatTaka(summary.savings)}
          </dd>
        </div>
      </dl>
      <details>
        <summary className="flex min-h-10 cursor-pointer items-center text-sm font-medium text-primary">
          Month by month
        </summary>
        <ul className="divide-y text-sm">
          {months.map((point) => (
            <li
              key={point.key}
              className="flex items-baseline justify-between gap-3 py-2"
            >
              <span className="text-muted-foreground">
                {formatMonth(point.key)}
              </span>
              <span
                className={cn(
                  "font-medium tabular-nums",
                  point.savings < 0 && "text-expense",
                )}
              >
                {formatTaka(point.savings)}
              </span>
            </li>
          ))}
        </ul>
      </details>
    </Card>
  );
}
