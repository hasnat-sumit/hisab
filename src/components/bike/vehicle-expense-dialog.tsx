"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { ChoiceChips } from "@/components/choice-chips";
import { EditableChoiceChips } from "@/components/editable-choice-chips";
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
import {
  vehicleExpenseLabel,
  type VehicleExpenseTypeOption,
} from "@/lib/constants";
import { today } from "@/lib/dates";
import type { BikeDTO, VehicleExpenseDTO } from "@/lib/types";
import { vehicleExpenseSchema } from "@/lib/validators";

type FormInput = z.input<typeof vehicleExpenseSchema>;
type FormOutput = z.output<typeof vehicleExpenseSchema>;

function VehicleExpenseForm({
  bikes,
  bikeId,
  expense,
  expenseTypes,
  onDone,
}: {
  bikes: BikeDTO[];
  bikeId: string;
  expense?: VehicleExpenseDTO;
  expenseTypes: VehicleExpenseTypeOption[];
  onDone: () => void;
}) {
  const router = useRouter();
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(vehicleExpenseSchema),
    defaultValues: {
      bikeId: expense?.bikeId ?? bikeId,
      date: expense?.date ?? today(),
      expenseType: expense?.expenseType ?? "",
      amount: expense ? String(expense.amount) : "",
      note: expense?.note ?? "",
    },
  });

  const choices = bikes
    .filter((bike) => !bike.archived || bike.id === expense?.bikeId)
    .map((bike) => ({ value: bike.id, label: bike.name }));

  async function onSubmit(values: FormOutput) {
    try {
      await apiFetch(
        expense
          ? `/api/vehicle-expenses/${expense.id}`
          : "/api/vehicle-expenses",
        { method: expense ? "PATCH" : "POST", body: values },
      );
      toast.success(expense ? "Expense updated" : "Expense added");
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
      <FormField id="ve-bike" label="Vehicle" error={errors.bikeId?.message}>
        <Controller
          control={control}
          name="bikeId"
          render={({ field }) => (
            <ChoiceChips
              id="ve-bike"
              label="Vehicle"
              value={field.value}
              onChange={field.onChange}
              invalid={Boolean(errors.bikeId)}
              options={choices}
            />
          )}
        />
      </FormField>
      <FormField
        id="ve-type"
        label="Expense type"
        error={errors.expenseType?.message}
      >
        <Controller
          control={control}
          name="expenseType"
          render={({ field }) => (
            <EditableChoiceChips
              id="ve-type"
              label="Expense type"
              noun="expense type"
              nounPlural="expense types"
              value={field.value}
              onChange={field.onChange}
              invalid={Boolean(errors.expenseType)}
              // A record being edited keeps showing its type, even a deleted one.
              options={
                !field.value ||
                expenseTypes.some((type) => type.value === field.value)
                  ? expenseTypes
                  : [
                      ...expenseTypes,
                      {
                        value: field.value,
                        label: vehicleExpenseLabel(field.value),
                      },
                    ]
              }
              deleteUrl={(type) =>
                `/api/vehicle-expense-types?name=${encodeURIComponent(type)}`
              }
              deleteDescription={(type) =>
                type === "other"
                  ? "It leaves the list. Any expenses already in Other stay there, so your totals stay the same."
                  : "Any expenses of this type move to Other, so your totals stay the same."
              }
            />
          )}
        />
      </FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField id="ve-date" label="Date" error={errors.date?.message}>
          <Input
            id="ve-date"
            type="date"
            aria-invalid={Boolean(errors.date) || undefined}
            {...register("date")}
          />
        </FormField>
        <FormField id="ve-amount" label="Amount (৳)" error={errors.amount?.message}>
          <Input
            id="ve-amount"
            inputMode="decimal"
            autoComplete="off"
            placeholder="0"
            aria-invalid={Boolean(errors.amount) || undefined}
            {...register("amount")}
          />
        </FormField>
      </div>
      <FormField id="ve-note" label="Note" error={errors.note?.message}>
        <Input
          id="ve-note"
          maxLength={200}
          placeholder="Optional"
          {...register("note")}
        />
      </FormField>
      <p className="text-xs text-muted-foreground">
        This also counts in your main expenses. There is no need to add it twice.
      </p>
      <SubmitButton pending={isSubmitting}>
        {expense ? "Save changes" : "Add expense"}
      </SubmitButton>
    </form>
  );
}

export function VehicleExpenseDialog({
  open,
  onOpenChange,
  bikes,
  bikeId = "",
  expense,
  expenseTypes,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bikes: BikeDTO[];
  /** The vehicle this was opened from. Left empty, the user picks one. */
  bikeId?: string;
  expense?: VehicleExpenseDTO;
  expenseTypes: VehicleExpenseTypeOption[];
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {expense ? "Edit vehicle expense" : "Add vehicle expense"}
          </DialogTitle>
        </DialogHeader>
        <VehicleExpenseForm
          bikes={bikes}
          bikeId={bikeId}
          expense={expense}
          expenseTypes={expenseTypes}
          onDone={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
