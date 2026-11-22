"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { FormField } from "@/components/form-field";
import { SubmitButton } from "@/components/submit-button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { apiFetch, showFormError } from "@/lib/api-client";
import { today } from "@/lib/dates";
import { formatTaka } from "@/lib/format";
import type { LoanDTO } from "@/lib/types";
import { repaymentSchema } from "@/lib/validators";

type FormInput = z.input<typeof repaymentSchema>;
type FormOutput = z.output<typeof repaymentSchema>;

function RepaymentForm({
  loan,
  outstanding,
  onDone,
}: {
  loan: LoanDTO;
  outstanding: number;
  onDone: () => void;
}) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(repaymentSchema),
    // The whole amount left is the most common repayment, so it starts there.
    defaultValues: { amount: String(outstanding), date: today(), note: "" },
  });

  async function onSubmit(values: FormOutput) {
    try {
      await apiFetch(`/api/loans/${loan.id}/repayments`, { body: values });
      toast.success(
        values.amount >= outstanding ? "Fully repaid" : "Repayment added",
      );
      onDone();
      router.refresh();
    } catch (error) {
      showFormError(error, setError);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4" noValidate>
      <p className="text-sm text-muted-foreground">
        {formatTaka(outstanding)} of {formatTaka(loan.amount)} is left.
      </p>
      <div className="grid grid-cols-2 gap-3">
        <FormField id="repay-amount" label="Amount (৳)" error={errors.amount?.message}>
          <Input
            id="repay-amount"
            inputMode="decimal"
            autoComplete="off"
            aria-invalid={Boolean(errors.amount) || undefined}
            {...register("amount")}
          />
        </FormField>
        <FormField id="repay-date" label="Date" error={errors.date?.message}>
          <Input
            id="repay-date"
            type="date"
            aria-invalid={Boolean(errors.date) || undefined}
            {...register("date")}
          />
        </FormField>
      </div>
      <FormField id="repay-note" label="Note" error={errors.note?.message}>
        <Input id="repay-note" maxLength={200} placeholder="Optional" {...register("note")} />
      </FormField>
      <SubmitButton pending={isSubmitting}>Add repayment</SubmitButton>
    </form>
  );
}

export function RepaymentDialog({
  open,
  onOpenChange,
  loan,
  outstanding,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loan: LoanDTO;
  outstanding: number;
}) {
  const title =
    loan.direction === "lent"
      ? `Money back from ${loan.person}`
      : `You paid back ${loan.person}`;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="wrap-anywhere">{title}</DialogTitle>
        </DialogHeader>
        <RepaymentForm
          loan={loan}
          outstanding={outstanding}
          onDone={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
