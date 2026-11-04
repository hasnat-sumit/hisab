import type { TransactionType } from "./constants";

export type MonthSummary = {
  income: number;
  expenses: number;
  savings: number;
};

/** Totals per month, type and category: everything the summaries are built from. */
export type FinanceRow = {
  month: string;
  type: TransactionType;
  category: string;
  total: number;
};

export type CategoryTotal = { category: string; amount: number };
export type Breakdown = { total: number; rows: CategoryTotal[] };
export type PeriodSummary = MonthSummary & { key: string };

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export function buildSummary(income: number, expenses: number): MonthSummary {
  return {
    income: roundMoney(income),
    expenses: roundMoney(expenses),
    savings: roundMoney(income - expenses),
  };
}

function summarize(rows: FinanceRow[]): MonthSummary {
  let income = 0;
  let expenses = 0;
  for (const row of rows) {
    if (row.type === "income") income += row.total;
    else expenses += row.total;
  }
  return buildSummary(income, expenses);
}

/** `period` is a month ("2026-11"), a year ("2026") or empty for all time. */
export function periodSummary(rows: FinanceRow[], period = ""): MonthSummary {
  return summarize(rows.filter((row) => row.month.startsWith(period)));
}

/** All income minus all expenses, whichever month is being viewed. */
export function totalSavings(rows: FinanceRow[]): number {
  return summarize(rows).savings;
}

export function categoryBreakdown(
  rows: FinanceRow[],
  period: string,
  type: TransactionType,
): Breakdown {
  const totals = new Map<string, number>();
  for (const row of rows) {
    if (row.type !== type || !row.month.startsWith(period)) continue;
    totals.set(row.category, (totals.get(row.category) ?? 0) + row.total);
  }
  const categories = [...totals.entries()]
    .map(([category, amount]) => ({ category, amount: roundMoney(amount) }))
    .sort((a, b) => b.amount - a.amount || a.category.localeCompare(b.category));
  return {
    // Added from the rounded rows, so the rows always add up to the total shown.
    total: roundMoney(categories.reduce((sum, c) => sum + c.amount, 0)),
    rows: categories,
  };
}

/** Adds what is being typed in a form, without counting an edited entry twice. */
export function previewBreakdown(
  breakdown: Breakdown,
  pending: {
    category?: string;
    amount?: number;
    /** The saved values of the entry being edited, if it is in this month. */
    original?: CategoryTotal;
  },
): Breakdown {
  const totals = new Map(breakdown.rows.map((r) => [r.category, r.amount]));
  const { category, amount, original } = pending;
  if (original && totals.has(original.category)) {
    const left = (totals.get(original.category) ?? 0) - original.amount;
    if (left > 0.004) totals.set(original.category, left);
    else totals.delete(original.category);
  }
  if (category && amount && amount > 0) {
    totals.set(category, (totals.get(category) ?? 0) + amount);
  }
  const rows = [...totals.entries()]
    .map(([name, value]) => ({ category: name, amount: roundMoney(value) }))
    .sort((a, b) => b.amount - a.amount || a.category.localeCompare(b.category));
  return {
    total: roundMoney(rows.reduce((sum, r) => sum + r.amount, 0)),
    rows,
  };
}

/** Every month of a year in order, with empty months as zeros. */
export function monthlySeries(rows: FinanceRow[], year: string): PeriodSummary[] {
  return Array.from({ length: 12 }, (_, index) => {
    const key = `${year}-${String(index + 1).padStart(2, "0")}`;
    return { key, ...periodSummary(rows, key) };
  });
}

export function yearsWithRecords(rows: FinanceRow[]): string[] {
  const years = new Set(rows.map((row) => row.month.slice(0, 4)));
  return [...years].sort();
}

export function yearlySeries(rows: FinanceRow[]): PeriodSummary[] {
  return yearsWithRecords(rows).map((key) => ({
    key,
    ...periodSummary(rows, key),
  }));
}

/** Savings accumulated up to the end of each period in `series`. */
export function runningSavings(
  rows: FinanceRow[],
  series: PeriodSummary[],
): (PeriodSummary & { running: number })[] {
  const first = series[0]?.key ?? "";
  // Keys of a series are all the same length, and sort by date.
  let running = summarize(
    rows.filter((row) => row.month.slice(0, first.length) < first),
  ).savings;
  return series.map((point) => {
    running = roundMoney(running + point.savings);
    return { ...point, running };
  });
}

export function usedCategories(
  rows: FinanceRow[],
  type: TransactionType,
): string[] {
  return [
    ...new Set(rows.filter((r) => r.type === type).map((r) => r.category)),
  ];
}
