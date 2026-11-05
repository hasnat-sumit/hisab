"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
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

/** A trash button that asks for confirmation, then deletes via the API. */
export function ConfirmDelete({
  url,
  itemLabel,
  title,
  description,
  successMessage,
  afterDeleteHref,
  onDeleted,
}: {
  url: string;
  /** Names the item for screen readers, e.g. "Delete Food expense". */
  itemLabel: string;
  title: string;
  description: string;
  successMessage: string;
  /** Where to go next, when the current page was about the deleted item. */
  afterDeleteHref?: string;
  onDeleted?: () => void;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      await apiFetch(url, { method: "DELETE" });
      toast.success(successMessage);
      setOpen(false);
      onDeleted?.();
      if (afterDeleteHref) router.push(afterDeleteHref, { scroll: false });
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={itemLabel}
        className="text-muted-foreground hover:text-destructive"
        onClick={() => setOpen(true)}
      >
        <Trash2 aria-hidden />
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
              variant="destructive"
              disabled={deleting}
              onClick={handleDelete}
            >
              {deleting && <Loader2 className="animate-spin" aria-hidden />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
