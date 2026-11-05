"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { FormField } from "@/components/form-field";
import { SubmitButton } from "@/components/submit-button";
import { CategoryField } from "@/components/transactions/category-field";
import { MonthPreview } from "@/components/transactions/month-preview";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { apiFetch, showFormError } from "@/lib/api-client";
import type { TransactionType } from "@/lib/constants";
import { today } from "@/lib/dates";
import type { TransactionDTO } from "@/lib/types";
import { transactionSchema } from "@/lib/validators";

type FormInput = z.input<typeof transactionSchema>;
type FormOutput = z.output<typeof transactionSchema>;

function TransactionForm({
  type,
  transaction,
  categories,
  onDone,
}: {
  type: TransactionType;
  transaction?: TransactionDTO;
  categories: string[];
  onDone: () => void;
}) {
  const router = useRouter();
  const [showNote, setShowNote] = useState(Boolean(transaction?.note));
  const {
    register,
    control,
    handleSubmit,
    setError,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type,
      date: transaction?.date ?? today(),
      category: transaction?.category ?? "",
      amount: transaction ? String(transaction.amount) : "",
      note: transaction?.note ?? "",
      recurring: transaction?.recurring ?? false,
    },
  });
  const [date, category, amount] = useWatch({
    control,
    name: ["date", "category", "amount"],
  });
  const month = date.slice(0, 7);
  const typedAmount = Number(amount);

  async function onSubmit(values: FormOutput) {
    try {
      await apiFetch(
        transaction ? `/api/transactions/${transaction.id}` : "/api/transactions",
        { method: transaction ? "PATCH" : "POST", body: values },
      );
      const noun = type === "income" ? "Income" : "Expense";
      toast.success(`${noun} ${transaction ? "updated" : "added"}`);
      onDone();
      router.refresh();
    } catch (error) {
      showFormError(error, setError);
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid grid-cols-1 gap-4"
      noValidate
    >
      <FormField id="tx-date" label="Date" error={errors.date?.message}>
        <Input
          id="tx-date"
          type="date"
          aria-invalid={Boolean(errors.date) || undefined}
          {...register("date")}
        />
      </FormField>

      <FormField
        id="tx-category"
        label="Category"
        error={errors.category?.message}
      >
        <Controller
          control={control}
          name="category"
          render={({ field }) => (
            <CategoryField
              id="tx-category"
              type={type}
              categories={categories}
              value={field.value}
              onChange={field.onChange}
              // After the dropdown has closed and given focus back.
              onPicked={() => setTimeout(() => setFocus("amount"), 50)}
              invalid={Boolean(errors.category)}
            />
          )}
        />
      </FormField>

      <FormField id="tx-amount" label="Amount (৳)" error={errors.amount?.message}>
        <Input
          id="tx-amount"
          inputMode="decimal"
          autoComplete="off"
          placeholder="0"
          aria-invalid={Boolean(errors.amount) || undefined}
          {...register("amount")}
        />
      </FormField>

      {showNote ? (
        <FormField id="tx-note" label="Note" error={errors.note?.message}>
          <Input
            id="tx-note"
            maxLength={200}
            placeholder="Optional"
            aria-invalid={Boolean(errors.note) || undefined}
            {...register("note")}
          />
        </FormField>
      ) : (
        <button
          type="button"
          onClick={() => setShowNote(true)}
          className="-my-2 min-h-10 justify-self-start text-xs text-muted-foreground underline underline-offset-3 hover:text-foreground md:my-0 md:min-h-0"
        >
          Add a note
        </button>
      )}

      {/* {type === "expense" && (
        <label className="flex min-h-10 items-center gap-3 text-sm">
          <input
            type="checkbox"
            className="size-5 accent-primary"
            {...register("recurring")}
          />
          This is a recurring expense
        </label>
      )} */}

      {/* <MonthPreview
        month={month}
        type={type}
        category={category}
        amount={Number.isFinite(typedAmount) ? typedAmount : undefined}
        original={
          transaction?.date.startsWith(month)
            ? { category: transaction.category, amount: transaction.amount }
            : undefined
        }
      /> */}

      <SubmitButton pending={isSubmitting}>
        {transaction
          ? "Save changes"
          : type === "income"
            ? "Add income"
            : "Add expense"}
      </SubmitButton>
    </form>
  );
}

export function TransactionDialog({
  open,
  onOpenChange,
  type,
  transaction,
  categories,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: TransactionType;
  transaction?: TransactionDTO;
  categories: string[];
}) {
  const noun = type === "income" ? "income" : "expense";
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {transaction ? `Edit ${noun}` : `Add ${noun}`}
          </DialogTitle>
        </DialogHeader>
        <TransactionForm
          type={type}
          transaction={transaction}
          categories={categories}
          onDone={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
