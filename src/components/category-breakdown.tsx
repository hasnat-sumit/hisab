import { Card } from "@/components/ui/card";
import type { TransactionType } from "@/lib/constants";
import type { Breakdown } from "@/lib/finance";
import { formatTaka } from "@/lib/format";
import { cn } from "@/lib/utils";

/** A month's total, with what made it up, category by category. */
export function CategoryBreakdown({
  type,
  breakdown,
  periodLabel,
}: {
  type: TransactionType;
  breakdown: Breakdown;
  periodLabel: string;
}) {
  const isIncome = type === "income";
  return (
    <Card className="gap-3 p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
        <h2 className="font-semibold">
          {isIncome ? "Total Income" : "Total Expenses"}
        </h2>
        <p
          className={cn(
            "text-lg font-semibold wrap-anywhere",
            isIncome ? "text-income" : "text-expense",
          )}
        >
          {formatTaka(breakdown.total)}
        </p>
      </div>
      {breakdown.rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nothing recorded for {periodLabel}.
        </p>
      ) : (
        <ul className="grid gap-2.5">
          {breakdown.rows.map(({ category, amount }) => (
            <li key={category} className="grid gap-1">
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="min-w-0 truncate">{category}</span>
                <span className="shrink-0 font-medium tabular-nums">
                  {formatTaka(amount)}
                </span>
              </div>
              <div aria-hidden className="h-1 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full rounded-full",
                    isIncome ? "bg-income" : "bg-expense",
                  )}
                  style={{
                    width: `${breakdown.total > 0 ? (amount / breakdown.total) * 100 : 0}%`,
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
