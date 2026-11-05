import assert from "node:assert/strict";
import { test } from "node:test";

import { categoryOptions, isCustomCategory } from "./constants";
import {
  currentMonth,
  formatMonth,
  formatShortMonth,
  isValidISODate,
  monthRange,
  resolveMonth,
  shiftMonth,
  today,
} from "./dates";
import { detectFileType, hasAllowedExtension } from "./document-files";
import { buildSummary } from "./finance";
import { formatTaka } from "./format";
import { fuelEntrySchema, transactionSchema } from "./validators";

test("savings are income minus expenses", () => {
  assert.deepEqual(buildSummary(50000, 32500.5), {
    income: 50000,
    expenses: 32500.5,
    savings: 17499.5,
  });
});

test("savings can be negative and avoid float noise", () => {
  assert.equal(buildSummary(100, 250).savings, -150);
  assert.equal(buildSummary(0.3, 0.1).savings, 0.2);
});

test("taka formatting uses lakh grouping", () => {
  assert.equal(formatTaka(125000), "৳1,25,000");
  assert.equal(formatTaka(99.5), "৳99.5");
  assert.equal(formatTaka(-500), "-৳500");
});

test("month range covers the whole month, including year end", () => {
  const { start, end } = monthRange("2026-12");
  assert.equal(start.toISOString(), "2026-12-01T00:00:00.000Z");
  assert.equal(end.toISOString(), "2027-01-01T00:00:00.000Z");
});

test("shifting months crosses years", () => {
  assert.equal(shiftMonth("2026-01", -1), "2025-12");
  assert.equal(shiftMonth("2026-12", 1), "2027-01");
  assert.equal(formatMonth("2026-11"), "November 2026");
  assert.equal(formatShortMonth("2026-11"), "Nov 2026");
});

test("today uses Bangladesh time, not UTC", () => {
  // 20:00 UTC on 31 Jan is already 1 Feb in Dhaka (UTC+6).
  const now = new Date("2026-01-31T20:00:00.000Z");
  assert.equal(today(now), "2026-02-01");
  assert.equal(currentMonth(now), "2026-02");
});

test("invalid months and dates are rejected", () => {
  assert.equal(resolveMonth("2026-11"), "2026-11");
  assert.equal(resolveMonth("2026-13"), currentMonth());
  assert.equal(resolveMonth(["2026-11"]), currentMonth());
  assert.equal(isValidISODate("2026-02-30"), false);
  assert.equal(isValidISODate("2026-02-28"), true);
});

test("custom categories appear before Other", () => {
  const options = categoryOptions("income", ["Rent", "Salary"]);
  assert.deepEqual(options.slice(-2), ["Rent", "Other"]);
  assert.equal(options.filter((c) => c === "Salary").length, 1);
});

test("deleted built-in categories leave the list", () => {
  const options = categoryOptions("expense", ["Gym"], ["Food", "Other"]);
  assert.equal(options.includes("Food"), false);
  assert.equal(options.includes("Other"), false);
  assert.equal(options.at(-1), "Gym");
  assert.equal(options.includes("Rent"), true);
});

test("custom categories are told apart from built-in ones", () => {
  assert.equal(isCustomCategory("expense", "Gym"), true);
  // A default for income is still the user's own when used on an expense.
  assert.equal(isCustomCategory("expense", "Salary"), true);
  assert.equal(isCustomCategory("expense", "Food"), false);
  assert.equal(isCustomCategory("income", "Salary"), false);
  assert.equal(isCustomCategory("expense", "Other"), false);
  assert.equal(isCustomCategory("income", "Other"), false);
  assert.equal(isCustomCategory("expense", "Vehicle"), false);
});

test("transaction validation", () => {
  const valid = {
    type: "expense",
    date: "2026-11-03",
    category: "Food",
    amount: "120.555",
    note: "  ",
  };
  const parsed = transactionSchema.parse(valid);
  assert.equal(parsed.amount, 120.56);
  assert.equal(parsed.note, undefined);

  for (const amount of ["", "0", "-5", "abc"]) {
    assert.equal(transactionSchema.safeParse({ ...valid, amount }).success, false);
  }
  const empty = transactionSchema.safeParse({ ...valid, amount: " " });
  assert.equal(empty.error?.issues[0].message, "Enter an amount.");
  const text = transactionSchema.safeParse({ ...valid, amount: "abc" });
  assert.equal(text.error?.issues[0].message, "Enter a valid number.");
  assert.equal(transactionSchema.safeParse({ ...valid, category: " " }).success, false);
  assert.equal(transactionSchema.safeParse({ ...valid, type: "savings" }).success, false);
  assert.equal(transactionSchema.safeParse({ ...valid, date: "nope" }).success, false);
});

test("fuel validation", () => {
  const valid = {
    bikeId: "a".repeat(24),
    date: "2026-11-03",
    odometer: "1000",
    fuelQuantity: "5.5",
    totalCost: "0",
  };
  assert.equal(fuelEntrySchema.safeParse(valid).success, true);
  assert.equal(fuelEntrySchema.safeParse({ ...valid, odometer: "-1" }).success, false);
  assert.equal(fuelEntrySchema.safeParse({ ...valid, fuelQuantity: "0" }).success, false);
  assert.equal(fuelEntrySchema.safeParse({ ...valid, totalCost: "-1" }).success, false);
  assert.equal(fuelEntrySchema.safeParse({ ...valid, totalCost: "" }).success, false);
  assert.equal(fuelEntrySchema.safeParse({ ...valid, bikeId: { $ne: null } }).success, false);
});

test("file types are detected from content, not the name", () => {
  const pdf = new TextEncoder().encode("%PDF-1.7");
  const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const jpg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0]);
  assert.equal(detectFileType(pdf)?.mimeType, "application/pdf");
  assert.equal(detectFileType(png)?.mimeType, "image/png");
  assert.equal(detectFileType(jpg)?.mimeType, "image/jpeg");
  assert.equal(detectFileType(new TextEncoder().encode("<html>")), null);
  assert.equal(hasAllowedExtension("licence.PDF"), true);
  assert.equal(hasAllowedExtension("evil.html"), false);
});
