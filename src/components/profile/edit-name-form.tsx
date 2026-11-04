"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { FormField } from "@/components/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { profileSchema } from "@/lib/validators";

type FormValues = z.infer<typeof profileSchema>;

export function EditNameForm({ name, email }: { name: string; email: string }) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(profileSchema),
    values: { name },
  });

  async function onSubmit(values: FormValues) {
    const { error } = await authClient.updateUser({ name: values.name });
    if (error) {
      toast.error(error.message ?? "Could not save your name.");
      return;
    }
    toast.success("Name updated");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3" noValidate>
      <FormField id="profile-name" label="Name" error={errors.name?.message}>
        <Input
          id="profile-name"
          autoComplete="name"
          aria-invalid={Boolean(errors.name) || undefined}
          {...register("name")}
        />
      </FormField>
      <FormField id="profile-email" label="Email">
        <Input id="profile-email" value={email} readOnly disabled />
      </FormField>
      {isDirty && (
        <Button type="submit" disabled={isSubmitting} className="justify-self-start">
          Save name
        </Button>
      )}
    </form>
  );
}
