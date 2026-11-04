"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { ChoiceChips } from "@/components/choice-chips";
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
import { VEHICLE_TYPES } from "@/lib/constants";
import type { BikeDTO } from "@/lib/types";
import { bikeSchema } from "@/lib/validators";

type FormInput = z.input<typeof bikeSchema>;
type FormOutput = z.output<typeof bikeSchema>;

function BikeForm({ bike, onDone }: { bike?: BikeDTO; onDone: () => void }) {
  const router = useRouter();
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(bikeSchema),
    defaultValues: {
      name: bike?.name ?? "",
      vehicleType: bike?.vehicleType ?? "bike",
      brand: bike?.brand ?? "",
      model: bike?.model ?? "",
      registrationNumber: bike?.registrationNumber ?? "",
      purchaseDate: bike?.purchaseDate ?? "",
    },
  });

  async function onSubmit(values: FormOutput) {
    try {
      await apiFetch(bike ? `/api/bikes/${bike.id}` : "/api/bikes", {
        method: bike ? "PATCH" : "POST",
        body: values,
      });
      toast.success(bike ? "Vehicle updated" : "Vehicle added");
      onDone();
      router.refresh();
    } catch (error) {
      showFormError(error, setError);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4" noValidate>
      <FormField
        id="bike-type"
        label="Vehicle type"
        error={errors.vehicleType?.message}
      >
        <Controller
          control={control}
          name="vehicleType"
          render={({ field }) => (
            <ChoiceChips
              id="bike-type"
              label="Vehicle type"
              value={field.value ?? "bike"}
              onChange={field.onChange}
              options={VEHICLE_TYPES}
            />
          )}
        />
      </FormField>
      <FormField id="bike-name" label="Vehicle name" error={errors.name?.message}>
        <Input
          id="bike-name"
          placeholder="e.g. Honda Hornet 2.0"
          aria-invalid={Boolean(errors.name) || undefined}
          {...register("name")}
        />
      </FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField id="bike-brand" label="Brand" error={errors.brand?.message}>
          <Input id="bike-brand" placeholder="Optional" {...register("brand")} />
        </FormField>
        <FormField id="bike-model" label="Model" error={errors.model?.message}>
          <Input id="bike-model" placeholder="Optional" {...register("model")} />
        </FormField>
      </div>
      <FormField
        id="bike-registration"
        label="Registration number"
        error={errors.registrationNumber?.message}
      >
        <Input
          id="bike-registration"
          placeholder="Optional"
          {...register("registrationNumber")}
        />
      </FormField>
      <FormField
        id="bike-purchase-date"
        label="Purchase date"
        error={errors.purchaseDate?.message}
      >
        <Input
          id="bike-purchase-date"
          type="date"
          {...register("purchaseDate")}
        />
      </FormField>
      <SubmitButton pending={isSubmitting}>
        {bike ? "Save changes" : "Add vehicle"}
      </SubmitButton>
    </form>
  );
}

export function BikeDialog({
  open,
  onOpenChange,
  bike,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bike?: BikeDTO;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{bike ? "Edit vehicle" : "Add a vehicle"}</DialogTitle>
        </DialogHeader>
        <BikeForm bike={bike} onDone={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
