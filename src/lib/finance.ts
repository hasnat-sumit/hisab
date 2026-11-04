export type MonthSummary = {
  income: number;
  expenses: number;
  savings: number;
};

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export function buildSummary(income: number, expenses: number): MonthSummary {
  return {
    income: roundMoney(income),
    expenses: roundMoney(expenses),
    savings: roundMoney(income - expenses),
  };
}
