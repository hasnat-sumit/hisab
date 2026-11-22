"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api-client";

/** A labelled button that asks for confirmation, then calls the API. */
export function ConfirmAction({
  label,
  icon,
  title,
  description,
  confirmLabel,
  url,
  method = "POST",
  body,
  successMessage,
  destructive = false,
}: {
  label: string;
  icon?: ReactNode;
  title: string;
  description: string;
  confirmLabel: string;
  url: string;
  method?: "POST" | "DELETE";
  body?: unknown;
  successMessage: string;
  destructive?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [working, setWorking] = useState(false);

  async function confirm() {
    setWorking(true);
    try {
      await apiFetch(url, { method, body });
      toast.success(successMessage);
      setOpen(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setWorking(false);
    }
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        {icon}
        {label}
      </Button>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>{description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant={destructive ? "destructive" : "default"}
              disabled={working}
              onClick={confirm}
            >
              {working && <Loader2 className="animate-spin" aria-hidden />}
              {confirmLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
