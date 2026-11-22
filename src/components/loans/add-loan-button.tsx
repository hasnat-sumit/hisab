"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { LoanDialog } from "@/components/loans/loan-dialog";
import { Button } from "@/components/ui/button";
import type { LoanDirection } from "@/lib/constants";

export function AddLoanButton({
  direction,
  people,
}: {
  direction: LoanDirection;
  people: string[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button className="font-semibold" onClick={() => setOpen(true)}>
        <Plus aria-hidden />
        {direction === "lent" ? "Lend Money" : "Add Borrowed Money"}
      </Button>
      <LoanDialog
        open={open}
        onOpenChange={setOpen}
        direction={direction}
        people={people}
      />
    </>
  );
}
