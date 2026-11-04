"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { FormField } from "@/components/form-field";
import { SubmitButton } from "@/components/submit-button";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { changePasswordSchema } from "@/lib/validators";

type FormValues = z.infer<typeof changePasswordSchema>;

function ChangePasswordForm({ onDone }: { onDone: () => void }) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "" },
  });

  async function onSubmit(values: FormValues) {
    const { error } = await authClient.changePassword({
      ...values,
      revokeOtherSessions: true,
    });
    if (error) {
      if (error.code === "INVALID_PASSWORD") {
        setError("currentPassword", {
          message: "That is not your current password.",
        });
      } else {
        toast.error(error.message ?? "Could not change your password.");
      }
      return;
    }
    toast.success("Password changed");
    onDone();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4" noValidate>
      <FormField
        id="current-password"
        label="Current password"
        error={errors.currentPassword?.message}
      >
        <Input
          id="current-password"
          type="password"
          autoComplete="current-password"
          aria-invalid={Boolean(errors.currentPassword) || undefined}
          {...register("currentPassword")}
        />
      </FormField>
      <FormField
        id="new-password"
        label="New password"
        error={errors.newPassword?.message}
      >
        <Input
          id="new-password"
          type="password"
          autoComplete="new-password"
          aria-invalid={Boolean(errors.newPassword) || undefined}
          {...register("newPassword")}
        />
      </FormField>
      <SubmitButton pending={isSubmitting}>Change password</SubmitButton>
    </form>
  );
}

export function ChangePasswordButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <KeyRound aria-hidden />
        Change password
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change password</DialogTitle>
          </DialogHeader>
          <ChangePasswordForm onDone={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
