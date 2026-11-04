"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { ChoiceChips } from "@/components/choice-chips";
import { FormField } from "@/components/form-field";
import { PaymentMethodField } from "@/components/payment-method-field";
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
import { formatNumber, formatTaka } from "@/lib/format";
import { resolveFuelAmounts } from "@/lib/mileage";
import type { BikeDTO, FuelEntryDTO } from "@/lib/types";
import { fuelEntrySchema } from "@/lib/validators";

type FormInput = z.input<typeof fuelEntrySchema>;
type FormOutput = z.output<typeof fuelEntrySchema>;

function parseOptional(value: unknown): number | undefined {
  if (value === undefined || String(value).trim() === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

/** Shows what will be saved, so the worked-out field is never a surprise. */
function FuelCalculation({
  totalCost,
  pricePerLiter,
  fuelQuantity,
}: {
  totalCost: number | undefined;
  pricePerLiter: number | undefined;
  fuelQuantity: number | undefined;
}) {
  const resolved = resolveFuelAmounts({ totalCost, pricePerLiter, fuelQuantity });
  if (!resolved) {
    return (
      <p className="text-xs text-muted-foreground">
        Enter any two of these and the third is worked out for you.
      </p>
    );
  }
  return (
    <p
      data-testid="fuel-calculation"
      className="rounded-lg bg-muted p-3 text-sm tabular-nums"
    >
      Saves as {formatTaka(resolved.totalCost)} for{" "}
      {formatNumber(resolved.fuelQuantity)} L
      {resolved.pricePerLiter
        ? ` at ${formatTaka(resolved.pricePerLiter)}/L`
        : ""}
      {totalCost !== undefined &&
        fuelQuantity !== undefined &&
        pricePerLiter !== undefined &&
        resolved.pricePerLiter !== pricePerLiter && (
          <span className="block text-xs text-muted-foreground">
            With all three filled in, the amount and liters are kept and the
            price is worked out. Clear one to calculate it instead.
          </span>
        )}
    </p>
  );
}

function FuelForm({
  bikes,
  bikeId,
  entry,
  onDone,
}: {
  bikes: BikeDTO[];
  bikeId: string;
  entry?: FuelEntryDTO;
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
    resolver: zodResolver(fuelEntrySchema),
    defaultValues: {
      bikeId: entry?.bikeId ?? bikeId,
      date: entry?.date ?? today(),
      odometer: entry ? String(entry.odometer) : "",
      totalCost: entry ? String(entry.totalCost) : "",
      pricePerLiter: entry?.pricePerLiter ? String(entry.pricePerLiter) : "",
      fuelQuantity: entry ? String(entry.fuelQuantity) : "",
      fullTank: entry?.fullTank ?? false,
      note: entry?.note ?? "",
      paymentMethod: entry?.paymentMethod ?? "",
    },
  });
  const [totalCost, pricePerLiter, fuelQuantity] = useWatch({
    control,
    name: ["totalCost", "pricePerLiter", "fuelQuantity"],
  });

  // An archived vehicle only appears when an entry already belongs to it.
  const choices = bikes
    .filter((bike) => !bike.archived || bike.id === entry?.bikeId)
    .map((bike) => ({ value: bike.id, label: bike.name }));

  async function onSubmit(values: FormOutput) {
    try {
      await apiFetch(entry ? `/api/fuel/${entry.id}` : "/api/fuel", {
        method: entry ? "PATCH" : "POST",
        body: values,
      });
      toast.success(entry ? "Fuel entry updated" : "Fuel entry added");
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
      <FormField id="fuel-bike" label="Vehicle" error={errors.bikeId?.message}>
        <Controller
          control={control}
          name="bikeId"
          render={({ field }) => (
            <ChoiceChips
              id="fuel-bike"
              label="Vehicle"
              value={field.value}
              onChange={field.onChange}
              invalid={Boolean(errors.bikeId)}
              options={choices}
            />
          )}
        />
      </FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField id="fuel-date" label="Date" error={errors.date?.message}>
          <Input
            id="fuel-date"
            type="date"
            aria-invalid={Boolean(errors.date) || undefined}
            {...register("date")}
          />
        </FormField>
        <FormField
          id="fuel-odometer"
          label="Odometer (km)"
          error={errors.odometer?.message}
        >
          <Input
            id="fuel-odometer"
            inputMode="decimal"
            autoComplete="off"
            placeholder="0"
            aria-invalid={Boolean(errors.odometer) || undefined}
            {...register("odometer")}
          />
        </FormField>
      </div>
      <FormField
        id="fuel-cost"
        label="Total amount paid (৳)"
        error={errors.totalCost?.message}
      >
        <Input
          id="fuel-cost"
          inputMode="decimal"
          autoComplete="off"
          placeholder="0"
          aria-invalid={Boolean(errors.totalCost) || undefined}
          {...register("totalCost")}
        />
      </FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField
          id="fuel-price"
          label="Price per liter (৳)"
          error={errors.pricePerLiter?.message}
        >
          <Input
            id="fuel-price"
            inputMode="decimal"
            autoComplete="off"
            placeholder="0"
            aria-invalid={Boolean(errors.pricePerLiter) || undefined}
            {...register("pricePerLiter")}
          />
        </FormField>
        <FormField
          id="fuel-quantity"
          label="Fuel (liters)"
          error={errors.fuelQuantity?.message}
        >
          <Input
            id="fuel-quantity"
            inputMode="decimal"
            autoComplete="off"
            placeholder="0"
            aria-invalid={Boolean(errors.fuelQuantity) || undefined}
            {...register("fuelQuantity")}
          />
        </FormField>
      </div>
      <FuelCalculation
        totalCost={parseOptional(totalCost)}
        pricePerLiter={parseOptional(pricePerLiter)}
        fuelQuantity={parseOptional(fuelQuantity)}
      />
      <label className="flex min-h-10 items-start gap-3 text-sm">
        <input
          type="checkbox"
          className="mt-0.5 size-5 shrink-0 accent-primary"
          {...register("fullTank")}
        />
        <span>
          I filled the tank to full
          <span className="block text-xs text-muted-foreground">
            Two full tanks in a row give a reliable mileage. Anything else is
            shown as an estimate.
          </span>
        </span>
      </label>
      <FormField
        id="fuel-payment"
        label="Payment method"
        error={errors.paymentMethod?.message}
      >
        <Controller
          control={control}
          name="paymentMethod"
          render={({ field }) => (
            <PaymentMethodField
              id="fuel-payment"
              value={field.value ?? ""}
              onChange={field.onChange}
            />
          )}
        />
      </FormField>
      <FormField id="fuel-note" label="Note" error={errors.note?.message}>
        <Input
          id="fuel-note"
          maxLength={200}
          placeholder="Optional"
          {...register("note")}
        />
      </FormField>
      <SubmitButton pending={isSubmitting}>
        {entry ? "Save changes" : "Add fuel entry"}
      </SubmitButton>
    </form>
  );
}

export function FuelDialog({
  open,
  onOpenChange,
  bikes,
  bikeId = "",
  entry,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bikes: BikeDTO[];
  /** The vehicle this was opened from. Left empty, the user picks one. */
  bikeId?: string;
  entry?: FuelEntryDTO;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {entry ? "Edit fuel entry" : "Add fuel entry"}
          </DialogTitle>
        </DialogHeader>
        <FuelForm
          bikes={bikes}
          bikeId={bikeId}
          entry={entry}
          onDone={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
