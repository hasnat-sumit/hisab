import assert from "node:assert/strict";
import { test } from "node:test";

import { vehicleExpenseLabel, vehicleExpenseTypeOptions } from "./constants";
import {
  categoryBreakdown,
  monthlySeries,
  periodSummary,
  previewBreakdown,
  runningSavings,
  totalSavings,
  yearlySeries,
  yearsWithRecords,
} from "./finance";
import { formatCompactTaka } from "./format";
import type { VehicleExpenseDTO } from "./types";
import {
  changeEmailSchema,
  transactionSchema,
  vehicleExpenseSchema,
} from "./validators";
import { vehicleTotals } from "./vehicles";

const row = (
  month: string,
  type: "income" | "expense",
  category: string,
  total: number,
) => ({ month, type, category, total });

const rows = [
  row("2025-12", "income", "Salary", 100000),
  row("2025-12", "expense", "Rent", 30000),
  row("2026-01", "income", "Salary", 120000),
  row("2026-01", "income", "Business", 50000),
  row("2026-01", "income", "Loan received", 10000),
  row("2026-01", "expense", "Food", 10000),
  row("2026-01", "expense", "Shopping", 25000),
  row("2026-01", "expense", "Rent", 5000),
  row("2026-03", "expense", "Food", 2000.1),
];

test("a month's category totals add up to its total", () => {
  const breakdown = categoryBreakdown(rows, "2026-01", "expense");
  assert.equal(breakdown.total, 40000);
  assert.deepEqual(
    breakdown.rows.map((r) => r.category),
    ["Shopping", "Food", "Rent"],
  );
  assert.equal(
    breakdown.rows.reduce((sum, r) => sum + r.amount, 0),
    periodSummary(rows, "2026-01").expenses,
  );
});

test("income is broken down by source", () => {
  const breakdown = categoryBreakdown(rows, "2026-01", "income");
  assert.equal(breakdown.total, 180000);
  assert.equal(breakdown.rows[0].category, "Salary");
});

test("total savings cover every month, whichever is viewed", () => {
  // 100000 − 30000 + 180000 − 40000 − 2000.1
  assert.equal(totalSavings(rows), 207999.9);
});

test("total savings can be negative, and empty is zero", () => {
  assert.equal(totalSavings([row("2026-01", "expense", "Food", 50)]), -50);
  assert.equal(totalSavings([]), 0);
});

test("a yearly summary only covers that year", () => {
  assert.deepEqual(periodSummary(rows, "2025"), {
    income: 100000,
    expenses: 30000,
    savings: 70000,
  });
});

test("the monthly series has 12 months, with zeros for empty ones", () => {
  const months = monthlySeries(rows, "2026");
  assert.equal(months.length, 12);
  assert.deepEqual(months[1], {
    key: "2026-02",
    income: 0,
    expenses: 0,
    savings: 0,
  });
  assert.equal(months[2].savings, -2000.1);
});

test("the months of a year add up to the year", () => {
  const sum = monthlySeries(rows, "2026").reduce((s, m) => s + m.savings, 0);
  assert.equal(
    Math.round(sum * 100) / 100,
    periodSummary(rows, "2026").savings,
  );
});

test("running savings start from earlier years", () => {
  const running = runningSavings(rows, monthlySeries(rows, "2026"));
  assert.equal(running[0].running, 210000);
  assert.equal(running[11].running, totalSavings(rows));
});

test("yearly series and years with records", () => {
  assert.deepEqual(yearsWithRecords(rows), ["2025", "2026"]);
  assert.deepEqual(
    yearlySeries(rows).map((y) => y.key),
    ["2025", "2026"],
  );
});

test("the live preview adds what is typed to the right category", () => {
  const base = categoryBreakdown(rows, "2026-01", "expense");
  const preview = previewBreakdown(base, { category: "Food", amount: 500 });
  assert.equal(preview.total, 40500);
  assert.equal(preview.rows.find((r) => r.category === "Food")?.amount, 10500);
  const brandNew = previewBreakdown(base, { category: "Gifts", amount: 100 });
  assert.equal(brandNew.rows.find((r) => r.category === "Gifts")?.amount, 100);
});

test("the live preview does not count an edited entry twice", () => {
  const base = categoryBreakdown(rows, "2026-01", "expense");
  const same = previewBreakdown(base, {
    category: "Rent",
    amount: 5000,
    original: { category: "Rent", amount: 5000 },
  });
  assert.equal(same.total, base.total);
  const moved = previewBreakdown(base, {
    category: "Food",
    amount: 5000,
    original: { category: "Rent", amount: 5000 },
  });
  assert.equal(moved.total, base.total);
  assert.equal(
    moved.rows.some((r) => r.category === "Rent"),
    false,
  );
});

test("vehicle totals split by vehicle, type and period", () => {
  const records = [
    { id: "1", bikeId: "a", date: "2026-01-05", expenseType: "fuel", amount: 2000 },
    { id: "2", bikeId: "a", date: "2026-01-09", expenseType: "servicing", amount: 2000 },
    { id: "3", bikeId: "a", date: "2026-02-01", expenseType: "parts", amount: 1000 },
    { id: "4", bikeId: "b", date: "2026-01-02", expenseType: "fuel", amount: 1000 },
  ] satisfies VehicleExpenseDTO[];
  assert.deepEqual(vehicleTotals(records, "2026-01", "a"), {
    total: 4000,
    byType: { fuel: 2000, servicing: 2000 },
  });
  assert.equal(vehicleTotals(records, "2026-01").total, 5000);
  assert.equal(vehicleTotals(records, "2026").total, 6000);
});

test("the Vehicle category is kept for linked vehicle expenses", () => {
  const entry = { type: "expense", date: "2026-11-03", amount: "10" };
  assert.equal(
    transactionSchema.safeParse({ ...entry, category: "vehicle" }).success,
    false,
  );
  assert.equal(
    transactionSchema.safeParse({ ...entry, category: "Food" }).success,
    true,
  );
});

test("vehicle expenses need a vehicle and a type other than fuel", () => {
  const entry = { bikeId: "a".repeat(24), date: "2026-11-03", amount: "10" };
  const parse = (extra: object) =>
    vehicleExpenseSchema.safeParse({ ...entry, ...extra }).success;
  assert.equal(parse({ expenseType: "parts" }), true);
  assert.equal(parse({ expenseType: "fuel" }), false);
  assert.equal(parse({ bikeId: "", expenseType: "parts" }), false);
  assert.equal(parse({ expenseType: " FUEL " }), false);
  assert.equal(parse({ expenseType: "" }), false);
  assert.equal(parse({ expenseType: "x".repeat(41) }), false);
  assert.equal(parse({ expenseType: "Car wash" }), true);
});

test("changing email needs matching addresses and the current password", () => {
  const form = {
    newEmail: " New@Example.com ",
    confirmEmail: "new@example.COM",
    currentPassword: "secret",
  };
  assert.equal(changeEmailSchema.parse(form).newEmail, "new@example.com");
  const fails = (extra: object) =>
    !changeEmailSchema.safeParse({ ...form, ...extra }).success;
  assert.equal(fails({ confirmEmail: "other@example.com" }), true);
  assert.equal(fails({ newEmail: "not-an-email", confirmEmail: "not-an-email" }), true);
  assert.equal(fails({ currentPassword: "" }), true);
});

test("a typed vehicle expense type matches a built-in one by name", () => {
  const typed = (expenseType: string) =>
    vehicleExpenseSchema.parse({
      bikeId: "a".repeat(24),
      date: "2026-11-03",
      amount: "10",
      expenseType,
    }).expenseType;
  assert.equal(typed("safety equipment"), "safety");
  assert.equal(typed("PARTS"), "parts");
  assert.equal(typed(" Car wash "), "Car wash");
});

test("vehicle expense type choices", () => {
  const values = (used: string[], hidden: string[] = []) =>
    vehicleExpenseTypeOptions(used, hidden).map((t) => t.value);
  // Fuel stays out, and custom types come just before Other.
  assert.equal(values(["fuel"]).includes("fuel"), false);
  assert.deepEqual(values(["Wash"]).slice(-2), ["Wash", "other"]);
  // Deleted built-in types leave the list.
  const trimmed = values(["Wash"], ["parts", "other"]);
  assert.equal(trimmed.includes("parts"), false);
  assert.equal(trimmed.at(-1), "Wash");
  assert.equal(vehicleExpenseLabel("safety"), "Safety equipment");
  assert.equal(vehicleExpenseLabel("Wash"), "Wash");
});

test("short chart amounts use lakh and crore", () => {
  assert.equal(formatCompactTaka(500), "500");
  assert.equal(formatCompactTaka(50000), "50K");
  assert.equal(formatCompactTaka(150000), "1.5L");
  assert.equal(formatCompactTaka(25000000), "2.5Cr");
  assert.equal(formatCompactTaka(-150000), "-1.5L");
});
