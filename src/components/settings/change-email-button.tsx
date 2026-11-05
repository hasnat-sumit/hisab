"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Mail } from "lucide-react";
import { useRouter } from "next/navigation";
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
import { apiFetch, showFormError } from "@/lib/api-client";
import { authClient } from "@/lib/auth-client";
import { changeEmailSchema } from "@/lib/validators";

type FormInput = z.input<typeof changeEmailSchema>;
type FormOutput = z.output<typeof changeEmailSchema>;

function ChangeEmailForm({ onDone }: { onDone: () => void }) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(changeEmailSchema),
    defaultValues: { newEmail: "", confirmEmail: "", currentPassword: "" },
  });

  async function onSubmit(values: FormOutput) {
    try {
      await apiFetch("/api/account/email", { body: values });
    } catch (error) {
      showFormError(error, setError);
      return;
    }
    // Replaces the session cookie's saved copy, which still has the old email.
    await authClient.getSession({ query: { disableCookieCache: true } });
    toast.success(`Email changed. Log in with ${values.newEmail} from now on.`);
    onDone();
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4" noValidate>
      <FormField
        id="new-email"
        label="New email"
        error={errors.newEmail?.message}
      >
        <Input
          id="new-email"
          type="email"
          autoComplete="email"
          aria-invalid={Boolean(errors.newEmail) || undefined}
          {...register("newEmail")}
        />
      </FormField>
      <FormField
        id="confirm-email"
        label="Type the new email again"
        error={errors.confirmEmail?.message}
      >
        <Input
          id="confirm-email"
          type="email"
          autoComplete="off"
          aria-invalid={Boolean(errors.confirmEmail) || undefined}
          {...register("confirmEmail")}
        />
      </FormField>
      <FormField
        id="email-current-password"
        label="Current password"
        error={errors.currentPassword?.message}
      >
        <Input
          id="email-current-password"
          type="password"
          autoComplete="current-password"
          aria-invalid={Boolean(errors.currentPassword) || undefined}
          {...register("currentPassword")}
        />
      </FormField>
      <p className="text-xs text-muted-foreground">
        You will log in with the new email from now on, so check it is spelled
        correctly.
      </p>
      <SubmitButton pending={isSubmitting}>Change email</SubmitButton>
    </form>
  );
}

export function ChangeEmailButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Mail aria-hidden />
        Change email
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change email</DialogTitle>
          </DialogHeader>
          <ChangeEmailForm onDone={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
