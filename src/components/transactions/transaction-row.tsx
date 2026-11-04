import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";

import { formatDate } from "@/lib/dates";
import { formatTaka } from "@/lib/format";
import type { TransactionDTO } from "@/lib/types";
import { cn } from "@/lib/utils";

export function TransactionRow({
  transaction,
  children,
}: {
  transaction: TransactionDTO;
  /** Optional actions shown at the end of the row. */
  children?: ReactNode;
}) {
  const isIncome = transaction.type === "income";
  const Icon = isIncome ? ArrowDownLeft : ArrowUpRight;
  return (
    <li className="flex items-center gap-3 py-3">
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-full",
          isIncome
            ? "bg-accent text-accent-foreground"
            : "bg-muted text-muted-foreground",
        )}
      >
        <Icon className="size-4" aria-hidden />
        <span className="sr-only">{isIncome ? "Income" : "Expense"}</span>
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{transaction.category}</p>
        <p className="truncate text-xs text-muted-foreground">
          {formatDate(transaction.date)}
          {transaction.note && ` · ${transaction.note}`}
        </p>
      </div>
      {/* On phones the actions sit under the amount, leaving room for the text. */}
      <div className="flex shrink-0 flex-col items-end md:flex-row md:items-center md:gap-3">
        <p
          className={cn(
            "font-semibold tabular-nums",
            isIncome && "text-primary",
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
