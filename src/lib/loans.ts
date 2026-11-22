import type { LoanDirection } from "./constants";
import { roundMoney } from "./finance";
import type { LoanDTO } from "./types";

export type LoanState = "open" | "settled" | "written-off";

export type LoanProgress = {
  repaid: number;
  writtenOff: number;
  /** Still to come back (money lent) or still to pay (money borrowed). */
  outstanding: number;
  state: LoanState;
};

export function loanProgress(loan: LoanDTO): LoanProgress {
  const repaid = roundMoney(
    loan.repayments.reduce((sum, repayment) => sum + repayment.amount, 0),
  );
  const writtenOff = loan.writeOff?.amount ?? 0;
  const outstanding = Math.max(0, roundMoney(loan.amount - repaid - writtenOff));
  const state: LoanState = loan.writeOff
    ? "written-off"
    : outstanding === 0
      ? "settled"
      : "open";
  return { repaid, writtenOff, outstanding, state };
}

export type LoanTotals = {
  amount: number;
  repaid: number;
  writtenOff: number;
  outstanding: number;
  /** People with something still outstanding. */
  openPeople: number;
};

export function loanTotals(loans: LoanDTO[], direction: LoanDirection): LoanTotals {
  const totals = { amount: 0, repaid: 0, writtenOff: 0, outstanding: 0 };
  const open = new Set<string>();
  for (const loan of loans) {
    if (loan.direction !== direction) continue;
    const progress = loanProgress(loan);
    totals.amount += loan.amount;
    totals.repaid += progress.repaid;
    totals.writtenOff += progress.writtenOff;
    totals.outstanding += progress.outstanding;
    if (progress.outstanding > 0) open.add(personKey(loan.person));
  }
  return {
    amount: roundMoney(totals.amount),
    repaid: roundMoney(totals.repaid),
    writtenOff: roundMoney(totals.writtenOff),
    outstanding: roundMoney(totals.outstanding),
    openPeople: open.size,
  };
}

/** "Rahim" and "rahim " are the same person. */
export function personKey(person: string): string {
  return person.trim().toLowerCase();
}

export type PersonSummary = LoanTotals & {
  key: string;
  person: string;
  loans: number;
};

/** One row per person, the most still outstanding first. */
export function peopleSummary(
  loans: LoanDTO[],
  direction: LoanDirection,
): PersonSummary[] {
  const groups = new Map<string, LoanDTO[]>();
  for (const loan of loans) {
    if (loan.direction !== direction) continue;
    const key = personKey(loan.person);
    groups.set(key, [...(groups.get(key) ?? []), loan]);
  }
  return [...groups.entries()]
    .map(([key, own]) => ({
      ...loanTotals(own, direction),
      key,
      // Loans come newest first, so this is the latest spelling.
      person: own[0].person,
      loans: own.length,
    }))
    .sort(
      (a, b) => b.outstanding - a.outstanding || a.person.localeCompare(b.person),
    );
}

/**
 * How loans change the money in hand. Money lent and not back yet is not in
 * hand, and borrowed money not paid back yet is. A written-off amount is
 * already counted as an expense, so it is not taken off a second time.
 */
export function loanCashEffect(loans: LoanDTO[]): number {
  return roundMoney(
    loanTotals(loans, "borrowed").outstanding -
      loanTotals(loans, "lent").outstanding,
  );
}
