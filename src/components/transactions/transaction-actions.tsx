"use client";

import { Pencil } from "lucide-react";
import { useState } from "react";

import { ConfirmDelete } from "@/components/confirm-delete";
import { TransactionDialog } from "@/components/transactions/transaction-dialog";
import { Button } from "@/components/ui/button";
import { formatTaka } from "@/lib/format";
import type { TransactionDTO } from "@/lib/types";

export function TransactionActions({
  transaction,
  usedCategories,
}: {
  transaction: TransactionDTO;
  usedCategories: string[];
}) {
  const [editing, setEditing] = useState(false);
  const noun = transaction.type === "income" ? "income" : "expense";
  return (
    <div className="flex shrink-0 max-md:-mr-2">
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={`Edit ${transaction.category} ${noun}`}
        className="text-muted-foreground"
        onClick={() => setEditing(true)}
      >
        <Pencil aria-hidden />
      </Button>
      <TransactionDialog
        open={editing}
        onOpenChange={setEditing}
        type={transaction.type}
        transaction={transaction}
        usedCategories={usedCategories}
      />
      <ConfirmDelete
        url={`/api/transactions/${transaction.id}`}
        itemLabel={`Delete ${transaction.category} ${noun}`}
        title={`Delete this ${noun}?`}
        description={`${transaction.category}, ${formatTaka(transaction.amount)}. This cannot be undone.`}
        successMessage={`${noun === "income" ? "Income" : "Expense"} deleted`}
      />
    </div>
  );
}
