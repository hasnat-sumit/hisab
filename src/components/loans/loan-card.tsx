"use client";

import { Ban, HandCoins, Pencil, Undo2 } from "lucide-react";
import { useState } from "react";

import { ConfirmAction } from "@/components/confirm-action";
import { ConfirmDelete } from "@/components/confirm-delete";
import { LoanDialog } from "@/components/loans/loan-dialog";
import { RepaymentDialog } from "@/components/loans/repayment-dialog";
import { Button } from "@/components/ui/button";
import { formatDate, today } from "@/lib/dates";
import { formatTaka } from "@/lib/format";
import type { LoanProgress } from "@/lib/loans";
import type { LoanDTO } from "@/lib/types";
import { cn } from "@/lib/utils";

const STATE_LABELS: Record<LoanProgress["state"], string> = {
  open: "Open",
  settled: "Paid back",
  "written-off": "Written off",
};

export function LoanCard({
  loan,
  progress,
  people,
}: {
  loan: LoanDTO;
  progress: LoanProgress;
  people: string[];
}) {
  const [editing, setEditing] = useState(false);
  const [repaying, setRepaying] = useState(false);
  const lent = loan.direction === "lent";
  const { repaid, writtenOff, outstanding, state } = progress;
  const percent = Math.min(100, Math.round((repaid / loan.amount) * 100));
  const writtenOffPercent = Math.min(100 - percent, Math.round((writtenOff / loan.amount) * 100));
  const locked = state === "written-off";

  return (
    <li className="grid gap-2 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium wrap-anywhere">{loan.person}</p>
          <p className="text-xs text-muted-foreground wrap-anywhere">
            {[formatDate(loan.date), loan.note].filter(Boolean).join(" · ")}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-semibold tabular-nums">{formatTaka(loan.amount)}</p>
          <span
            className={cn(
              "inline-block rounded-full px-2 py-0.5 text-xs font-medium",
              state === "open" && "bg-muted text-foreground",
              state === "settled" && "bg-accent text-accent-foreground",
              state === "written-off" && "bg-destructive/10 text-destructive",
            )}
          >
            {STATE_LABELS[state]}
          </span>
        </div>
      </div>

      <div
        className="flex h-2 overflow-hidden rounded-full bg-muted"
        role="img"
        aria-label={`${percent}% ${lent ? "returned" : "repaid"}`}
      >
        <div className="bg-primary" style={{ width: `${percent}%` }} />
        <div className="bg-destructive/60" style={{ width: `${writtenOffPercent}%` }} />
      </div>
      <p className="text-xs text-muted-foreground tabular-nums">
        {formatTaka(repaid)} {lent ? "returned" : "repaid"}
        {outstanding > 0 && ` · ${formatTaka(outstanding)} left`}
        {loan.writeOff &&
          ` · ${formatTaka(writtenOff)} written off on ${formatDate(loan.writeOff.date)}`}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        {state === "open" && (
          <Button variant="outline" size="sm" onClick={() => setRepaying(true)}>
            <HandCoins aria-hidden />
            Add repayment
          </Button>
        )}
        {lent && state === "open" && (
          <ConfirmAction
            label="Write off"
            icon={<Ban aria-hidden />}
            title={`Write off ${formatTaka(outstanding)}?`}
            description={`Use this if ${loan.person} will not pay it back. The ${formatTaka(outstanding)} left becomes an expense today, under "Written-off loan". You can undo this later.`}
            confirmLabel="Write off"
            url={`/api/loans/${loan.id}/write-off`}
            body={{ date: today() }}
            successMessage="Loan written off"
            destructive
          />
        )}
        {locked && (
          <ConfirmAction
            label="Undo write-off"
            icon={<Undo2 aria-hidden />}
            title="Undo the write-off?"
            description={`The ${formatTaka(writtenOff)} expense is removed, and the amount counts as lent out again.`}
            confirmLabel="Undo write-off"
            url={`/api/loans/${loan.id}/write-off`}
            method="DELETE"
            successMessage="Write-off undone"
          />
        )}
        <div className="ml-auto flex">
          {!locked && (
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Edit loan with ${loan.person}`}
              className="text-muted-foreground"
              onClick={() => setEditing(true)}
            >
              <Pencil aria-hidden />
            </Button>
          )}
          <ConfirmDelete
            url={`/api/loans/${loan.id}`}
            itemLabel={`Delete loan with ${loan.person}`}
            title="Delete this loan?"
            description={`${loan.person}, ${formatTaka(loan.amount)}, with all its repayments${loan.writeOff ? " and its write-off expense" : ""}. This cannot be undone.`}
            successMessage="Loan deleted"
          />
        </div>
      </div>

      {loan.repayments.length > 0 && (
        <details className="group rounded-lg bg-muted/50 px-3">
          <summary className="flex min-h-10 cursor-pointer items-center text-xs font-medium text-muted-foreground">
            {loan.repayments.length}{" "}
            {loan.repayments.length === 1 ? "repayment" : "repayments"}
          </summary>
          <ul className="divide-y pb-1">
            {loan.repayments.map((repayment) => (
              <li key={repayment.id} className="flex items-center gap-3 py-1.5 text-sm">
                <span className="min-w-0 flex-1 wrap-anywhere">
                  {formatDate(repayment.date)}
                  {repayment.note && (
                    <span className="text-muted-foreground"> · {repayment.note}</span>
                  )}
                </span>
                <span className="shrink-0 font-medium tabular-nums">
                  {formatTaka(repayment.amount)}
                </span>
                {!locked && (
                  <ConfirmDelete
                    url={`/api/loans/${loan.id}/repayments/${repayment.id}`}
                    itemLabel={`Delete repayment of ${formatTaka(repayment.amount)}`}
                    title="Delete this repayment?"
                    description={`${formatTaka(repayment.amount)} on ${formatDate(repayment.date)}. It will count as unpaid again.`}
                    successMessage="Repayment deleted"
                  />
                )}
              </li>
            ))}
          </ul>
        </details>
      )}

      <LoanDialog
        open={editing}
        onOpenChange={setEditing}
        direction={loan.direction}
        loan={loan}
        people={people}
      />
      {state === "open" && (
        <RepaymentDialog
          open={repaying}
          onOpenChange={setRepaying}
          loan={loan}
          outstanding={outstanding}
        />
      )}
    </li>
  );
}
