"use client";

import { useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { SimpleSelect } from "@/components/simple-select";
import { Card } from "@/components/ui/card";
import { formatMonth } from "@/lib/dates";
import {
  categoryBreakdown,
  monthlySeries,
  yearlySeries,
  yearsWithRecords,
  type FinanceRow,
} from "@/lib/finance";
import { formatTaka } from "@/lib/format";
import { cn } from "@/lib/utils";

// Six named slots at most, then "Other", so colors stay easy to tell apart.
const CATEGORY_SLOTS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
];
const OTHER = "All others";
const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

type TooltipEntry = { dataKey?: unknown; name?: unknown; value?: unknown; color?: string };

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: readonly TooltipEntry[];
  label?: unknown;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="grid gap-1 rounded-lg bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md ring-1 ring-foreground/10">
      {label !== undefined && <p className="font-medium">{String(label)}</p>}
      {payload.map((entry) => (
        <p
          key={String(entry.dataKey ?? entry.name)}
          className="flex items-center justify-between gap-4"
        >
          <span className="flex items-center gap-1.5">
            <span
              aria-hidden
              className="size-2 rounded-full"
              style={{ background: entry.color }}
            />
            {String(entry.name)}
          </span>
          <span className="font-medium tabular-nums">
            {formatTaka(Number(entry.value))}
          </span>
        </p>
      ))}
    </div>
  );
}

export function Analytics({
  rows,
  initialMonth,
}: {
  rows: FinanceRow[];
  /** The month to open on, as "YYYY-MM". */
  initialMonth: string;
}) {
  const initialYear = initialMonth.slice(0, 4);
  const years = yearsWithRecords(rows);
  const yearOptions = [...new Set([...years, initialYear])].sort().reverse();
  const [view, setView] = useState<"monthly" | "yearly">("monthly");
  const [year, setYear] = useState(initialYear);
  const [monthNumber, setMonthNumber] = useState(initialMonth.slice(5));

  if (rows.length === 0) {
    return (
      <Card className="gap-1 p-4">
        <h2 className="font-semibold">Financial analytics</h2>
        <p className="text-sm text-muted-foreground">
          Your charts appear here once you add income or expenses.
        </p>
      </Card>
    );
  }

  const series = view === "monthly" ? monthlySeries(rows, year) : yearlySeries(rows);
  const data = series.map((point) => ({
    ...point,
    label:
      view === "monthly" ? MONTH_LABELS[Number(point.key.slice(5)) - 1] : point.key,
  }));
  const period = view === "monthly" ? `${year}-${monthNumber}` : year;
  const periodName = view === "monthly" ? formatMonth(period) : year;

  // Colors follow the category, by its all-time rank, so they never reshuffle.
  const ranked = categoryBreakdown(rows, "", "expense").rows.map((r) => r.category);
  const named = ranked.slice(0, CATEGORY_SLOTS.length);
  const colorOf = (category: string) =>
    category === OTHER
      ? "var(--chart-other)"
      : CATEGORY_SLOTS[named.indexOf(category)];

  const breakdown = categoryBreakdown(rows, period, "expense");
  const shown = breakdown.rows.filter((row) => named.includes(row.category));
  const rest = breakdown.rows
    .filter((row) => !named.includes(row.category))
    .reduce((sum, row) => sum + row.amount, 0);
  const slices = rest > 0 ? [...shown, { category: OTHER, amount: rest }] : shown;

  return (
    <Card className="gap-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-semibold">Financial analytics</h2>
        <div className="flex flex-wrap items-center gap-2">
          <div
            role="group"
            aria-label="Spending period"
            className="grid grid-cols-2 gap-1 rounded-xl bg-muted p-1"
          >
            {(["monthly", "yearly"] as const).map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={view === option}
                onClick={() => setView(option)}
                className={cn(
                  "h-10 rounded-lg px-3 text-sm font-medium md:h-9",
                  view === option
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground",
                )}
              >
                {option === "monthly" ? "Monthly" : "Yearly"}
              </button>
            ))}
          </div>
          {view === "monthly" && (
            <SimpleSelect
              label="Month"
              value={monthNumber}
              onChange={setMonthNumber}
              options={MONTH_LABELS.map((label, index) => ({
                value: String(index + 1).padStart(2, "0"),
                label,
              }))}
              className="w-24!"
            />
          )}
          <SimpleSelect
            label="Year"
            value={year}
            onChange={setYear}
            options={yearOptions.map((value) => ({ value, label: value }))}
            className="w-24!"
          />
        </div>
      </div>

      <section className="grid min-w-0 gap-2 rounded-lg border p-3">
        <h3 className="text-sm font-medium">Spending by category, {periodName}</h3>
        {slices.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            No expenses in this period.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 sm:items-center">
            <ResponsiveContainer width="100%" height={180} minWidth={0}>
              <PieChart>
                <Pie
                  data={slices}
                  dataKey="amount"
                  nameKey="category"
                  innerRadius="62%"
                  outerRadius="92%"
                  paddingAngle={slices.length > 1 ? 2 : 0}
                  stroke="none"
                  isAnimationActive={false}
                >
                  {slices.map((slice) => (
                    <Cell key={slice.category} fill={colorOf(slice.category)} />
                  ))}
                </Pie>
                <Tooltip content={ChartTooltip} />
              </PieChart>
            </ResponsiveContainer>
            <ul className="grid gap-1 text-xs">
              {slices.map((slice) => (
                <li
                  key={slice.category}
                  className="flex items-center justify-between gap-3"
                >
                  <span className="flex min-w-0 items-center gap-1.5">
                    <span
                      aria-hidden
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ background: colorOf(slice.category) }}
                    />
                    <span className="truncate">{slice.category}</span>
                  </span>
                  <span className="shrink-0 font-medium tabular-nums">
                    {formatTaka(slice.amount)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <details>
        <summary className="flex min-h-10 cursor-pointer items-center text-sm font-medium text-primary">
          View as a table
        </summary>
        <div className="overflow-x-auto">
          <table className="w-full text-sm tabular-nums">
            <thead className="text-left text-xs text-muted-foreground">
              <tr>
                <th className="py-1 pr-2 font-medium">Period</th>
                <th className="py-1 pr-2 text-right font-medium">Income</th>
                <th className="py-1 pr-2 text-right font-medium">Expenses</th>
                <th className="py-1 text-right font-medium">Savings</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.map((point) => (
                <tr key={point.key}>
                  <td className="py-1.5 pr-2">{point.label}</td>
                  <td className="py-1.5 pr-2 text-right">{formatTaka(point.income)}</td>
                  <td className="py-1.5 pr-2 text-right">{formatTaka(point.expenses)}</td>
                  <td className="py-1.5 text-right">{formatTaka(point.savings)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </Card>
  );
}
