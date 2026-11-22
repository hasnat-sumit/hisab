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
import type { LoanDirection } from "@/lib/constants";
import { today } from "@/lib/dates";
import type { LoanDTO } from "@/lib/types";
import { loanSchema } from "@/lib/validators";

type FormInput = z.input<typeof loanSchema>;
type FormOutput = z.output<typeof loanSchema>;

function LoanForm({
  direction,
  loan,
  people,
  onDone,
}: {
  direction: LoanDirection;
  loan?: LoanDTO;
  people: string[];
  onDone: () => void;
}) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(loanSchema),
    defaultValues: {
      direction,
      person: loan?.person ?? "",
      amount: loan ? String(loan.amount) : "",
      date: loan?.date ?? today(),
      note: loan?.note ?? "",
    },
  });
  const lent = direction === "lent";

  async function onSubmit(values: FormOutput) {
    try {
      await apiFetch(loan ? `/api/loans/${loan.id}` : "/api/loans", {
        method: loan ? "PATCH" : "POST",
        body: values,
      });
      toast.success(loan ? "Loan updated" : lent ? "Money lent added" : "Borrowed money added");
      onDone();
      router.refresh();
    } catch (error) {
      showFormError(error, setError);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4" noValidate>
      <FormField
        id="loan-person"
        label={lent ? "Lent to" : "Borrowed from"}
        error={errors.person?.message}
      >
        <Input
          id="loan-person"
          list="loan-people"
          autoComplete="off"
          maxLength={60}
          placeholder="Name"
          aria-invalid={Boolean(errors.person) || undefined}
          {...register("person")}
        />
        {/* Suggests people already on the list, so one person stays one name. */}
        <datalist id="loan-people">
          {people.map((person) => (
            <option key={person} value={person} />
          ))}
        </datalist>
      </FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField id="loan-amount" label="Amount (৳)" error={errors.amount?.message}>
          <Input
            id="loan-amount"
            inputMode="decimal"
            autoComplete="off"
            placeholder="0"
            aria-invalid={Boolean(errors.amount) || undefined}
            {...register("amount")}
          />
        </FormField>
        <FormField id="loan-date" label="Date" error={errors.date?.message}>
          <Input
            id="loan-date"
            type="date"
            aria-invalid={Boolean(errors.date) || undefined}
            {...register("date")}
          />
        </FormField>
      </div>
      <FormField id="loan-note" label="Note" error={errors.note?.message}>
        <Input
          id="loan-note"
          maxLength={200}
          placeholder="Optional"
          {...register("note")}
        />
      </FormField>
      <p className="text-xs text-muted-foreground">
        {lent
          ? "This is not an expense. It leaves your savings until it is paid back."
          : "This is not income. It counts in your savings until you pay it back."}
      </p>
      <SubmitButton pending={isSubmitting}>
        {loan ? "Save changes" : lent ? "Add money lent" : "Add money borrowed"}
      </SubmitButton>
    </form>
  );
}

export function LoanDialog({
  open,
  onOpenChange,
  direction,
  loan,
  people,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  direction: LoanDirection;
  loan?: LoanDTO;
  /** Names already used, offered as suggestions. */
  people: string[];
}) {
  const title = loan
    ? "Edit loan"
    : direction === "lent"
      ? "Lend money"
      : "Borrow money";
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <LoanForm
          direction={direction}
          loan={loan}
          people={people}
          onDone={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
