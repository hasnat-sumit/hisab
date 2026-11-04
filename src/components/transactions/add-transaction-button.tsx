"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { TransactionDialog } from "@/components/transactions/transaction-dialog";
import { Button } from "@/components/ui/button";
import type { TransactionType } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function AddTransactionButton({
  type,
  usedCategories,
  floating = false,
}: {
  type: TransactionType;
  usedCategories: string[];
  /** On phones, float above the bottom navigation so it is always in reach. */
  floating?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        size="lg"
        className={cn(
          "font-semibold",
          floating &&
            "max-md:fixed max-md:right-4 max-md:bottom-[calc(5rem+env(safe-area-inset-bottom))] max-md:z-30 max-md:rounded-full max-md:shadow-lg",
        )}
        onClick={() => setOpen(true)}
      >
        <Plus aria-hidden />
        {type === "income" ? "Add Income" : "Add Expense"}
      </Button>
      <TransactionDialog
        open={open}
        onOpenChange={setOpen}
        type={type}
        usedCategories={usedCategories}
      />
    </>
  );
}
