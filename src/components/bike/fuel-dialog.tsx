"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { FormField } from "@/components/form-field";
import { SimpleSelect } from "@/components/simple-select";
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
import type { BikeDTO, FuelEntryDTO } from "@/lib/types";
import { fuelEntrySchema } from "@/lib/validators";

type FormInput = z.input<typeof fuelEntrySchema>;
type FormOutput = z.output<typeof fuelEntrySchema>;

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
      fuelQuantity: entry ? String(entry.fuelQuantity) : "",
      totalCost: entry ? String(entry.totalCost) : "",
    },
  });

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
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4" noValidate>
      {bikes.length > 1 && (
        <FormField id="fuel-bike" label="Bike" error={errors.bikeId?.message}>
          <Controller
            control={control}
            name="bikeId"
            render={({ field }) => (
              <SimpleSelect
                id="fuel-bike"
                value={field.value}
                onChange={field.onChange}
                invalid={Boolean(errors.bikeId)}
                options={bikes.map((bike) => ({
                  value: bike.id,
                  label: bike.name,
                }))}
              />
            )}
          />
        </FormField>
      )}
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
        label="Odometer reading (km)"
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
      <div className="grid grid-cols-2 gap-3">
        <FormField
          id="fuel-quantity"
          label="Fuel (litres)"
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
        <FormField
          id="fuel-cost"
          label="Total cost (৳)"
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
      </div>
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
  bikeId,
  entry,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bikes: BikeDTO[];
  /** The bike chosen when the form opens. */
  bikeId: string;
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
