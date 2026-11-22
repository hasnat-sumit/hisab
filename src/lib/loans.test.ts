import assert from "node:assert/strict";
import { test } from "node:test";

import { loanCashEffect, loanProgress, loanTotals, peopleSummary } from "./loans";
import type { LoanDTO } from "./types";
import { loanSchema, repaymentSchema, transactionSchema } from "./validators";

let next = 0;
const loan = (
  direction: LoanDTO["direction"],
  person: string,
  amount: number,
  repaid: number[] = [],
  writeOff?: number,
): LoanDTO => ({
  id: String(++next),
  direction,
  person,
  amount,
  date: "2026-01-01",
  repayments: repaid.map((value, i) => ({ id: `r${i}`, amount: value, date: "2026-02-01" })),
  writeOff: writeOff === undefined ? undefined : { date: "2026-03-01", amount: writeOff },
});

test("a loan's progress follows its repayments", () => {
  assert.deepEqual(loanProgress(loan("lent", "Rahim", 30000)), {
    repaid: 0,
    writtenOff: 0,
    outstanding: 30000,
    state: "open",
  });
  assert.equal(loanProgress(loan("lent", "Rahim", 30000, [10000, 5000])).outstanding, 15000);
  assert.equal(loanProgress(loan("lent", "Rahim", 30000, [10000, 20000])).state, "settled");
  // Paise must not leave a loan looking open.
  assert.equal(loanProgress(loan("lent", "Rahim", 0.3, [0.1, 0.2])).state, "settled");
});

test("a written-off loan has nothing outstanding", () => {
  const progress = loanProgress(loan("lent", "Karim", 30000, [10000], 20000));
  assert.equal(progress.state, "written-off");
  assert.equal(progress.outstanding, 0);
  assert.equal(progress.writtenOff, 20000);
});

test("the plan's example: savings is the money in hand", () => {
  // Income 100k, expenses 40k, 30k lent: 30k is left in hand.
  const income = 100000;
  const expenses = 40000;
  const loans = [loan("lent", "Rahim", 30000)];
  assert.equal(income - expenses + loanCashEffect(loans), 30000);
  // 10k comes back, so 40k is in hand. Income and expenses do not change.
  loans[0] = loan("lent", "Rahim", 30000, [10000]);
  assert.equal(income - expenses + loanCashEffect(loans), 40000);
});

test("borrowed money counts in hand until it is paid back", () => {
  assert.equal(loanCashEffect([loan("borrowed", "Bank", 20000)]), 20000);
  assert.equal(loanCashEffect([loan("borrowed", "Bank", 20000, [5000])]), 15000);
  assert.equal(
    loanCashEffect([loan("borrowed", "Bank", 20000), loan("lent", "Rahim", 30000)]),
    -10000,
  );
});

test("a write-off is not taken off savings twice", () => {
  // The written-off 20k is an expense now, so the loan no longer takes it off.
  assert.equal(loanCashEffect([loan("lent", "Karim", 30000, [10000], 20000)]), 0);
});

test("totals and people are split by direction and grouped by name", () => {
  const loans = [
    loan("lent", "Rahim", 10000, [4000]),
    loan("lent", "rahim ", 5000),
    loan("lent", "Karim", 2000, [2000]),
    loan("borrowed", "Rahim", 7000),
  ];
  assert.deepEqual(loanTotals(loans, "lent"), {
    amount: 17000,
    repaid: 6000,
    writtenOff: 0,
    outstanding: 11000,
    openPeople: 1,
  });
  const people = peopleSummary(loans, "lent");
  assert.deepEqual(
    people.map((p) => [p.person, p.loans, p.outstanding]),
    [
      ["Rahim", 2, 11000],
      ["Karim", 1, 0],
    ],
  );
  assert.equal(peopleSummary(loans, "borrowed")[0].outstanding, 7000);
});

test("loan and repayment validation", () => {
  const entry = { direction: "lent", person: " Rahim ", amount: "30000", date: "2026-01-01" };
  assert.equal(loanSchema.parse(entry).person, "Rahim");
  assert.equal(loanSchema.safeParse({ ...entry, person: "" }).success, false);
  assert.equal(loanSchema.safeParse({ ...entry, amount: "0" }).success, false);
  assert.equal(loanSchema.safeParse({ ...entry, direction: "gift" }).success, false);
  assert.equal(repaymentSchema.safeParse({ amount: "500", date: "2026-02-30" }).success, false);
});

test("the write-off category is kept for the Loans page", () => {
  const entry = { type: "expense", date: "2026-11-03", amount: "10" };
  assert.equal(
    transactionSchema.safeParse({ ...entry, category: "written-off loan" }).success,
    false,
  );
});
