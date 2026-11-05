import { ArrowDownLeft, ArrowUpRight, Repeat } from "lucide-react";
import type { ReactNode } from "react";

import { vehicleExpenseLabel } from "@/lib/constants";
import { formatDate } from "@/lib/dates";
import { formatTaka } from "@/lib/format";
import type { TransactionDTO } from "@/lib/types";
import { cn } from "@/lib/utils";

export function TransactionRow({
  transaction,
  vehicleName,
  children,
}: {
  transaction: TransactionDTO;
  /** The linked vehicle, for an expense that belongs to one. */
  vehicleName?: string;
  /** Optional actions shown at the end of the row. */
  children?: ReactNode;
}) {
  const isIncome = transaction.type === "income";
  const Icon = isIncome ? ArrowDownLeft : ArrowUpRight;
  const details = [formatDate(transaction.date), transaction.note].filter(
    Boolean,
  );
  return (
    <li className="flex items-center gap-3 py-3">
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-full",
          isIncome
            ? "bg-accent text-income"
            : "bg-muted text-expense",
        )}
      >
        <Icon className="size-4" aria-hidden />
        <span className="sr-only">{isIncome ? "Income" : "Expense"}</span>
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 font-medium">
          <span className="truncate">{transaction.category}</span>
          {transaction.recurring && (
            <Repeat
              className="size-3.5 shrink-0 text-muted-foreground"
              aria-label="Recurring"
            />
          )}
        </p>
        {transaction.vehicleExpenseType && (
          <p className="truncate text-xs text-muted-foreground">
            {vehicleName ?? "Vehicle"} ·{" "}
            {vehicleExpenseLabel(transaction.vehicleExpenseType)}
          </p>
        )}
        <p className="truncate text-xs text-muted-foreground">
          {details.join(" · ")}
        </p>
      </div>
      {/* On phones the actions sit under the amount, leaving room for the text. */}
      <div className="flex shrink-0 flex-col items-end md:flex-row md:items-center md:gap-3">
        <p
          className={cn(
            "font-semibold tabular-nums",
            isIncome ? "text-income" : "text-expense",
          )}
        >
          {isIncome ? "+" : "-"}
          {formatTaka(transaction.amount)}
        </p>
        {children}
      </div>
    </li>
  );
}
