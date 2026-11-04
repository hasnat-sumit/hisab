import { Card } from "@/components/ui/card";
import type { MonthSummary } from "@/lib/finance";
import { formatTaka } from "@/lib/format";
import { cn } from "@/lib/utils";

function SummaryCard({
  label,
  amount,
  className,
  amountClassName,
}: {
  label: string;
  amount: number;
  className?: string;
  amountClassName?: string;
}) {
  return (
    <Card className={cn("gap-1 p-4", className)}>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p
        className={cn(
          // Wraps rather than cutting digits off a large amount.
          "text-xl font-semibold tracking-tight tabular-nums wrap-anywhere sm:text-2xl",
          amountClassName,
        )}
      >
        {formatTaka(amount)}
      </p>
    </Card>
  );
}

export function SummaryCards({ summary }: { summary: MonthSummary }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      <SummaryCard label="Total Income" amount={summary.income} />
      <SummaryCard label="Total Expenses" amount={summary.expenses} />
      <SummaryCard
        label="Total Savings"
        amount={summary.savings}
        className="col-span-2 bg-accent ring-primary/15 sm:col-span-1"
        amountClassName={
          summary.savings < 0 ? "text-destructive" : "text-accent-foreground"
        }
      />
    </div>
  );
}
