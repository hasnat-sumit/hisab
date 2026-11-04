"use client";

import { Bike as BikeIcon, Loader2, Pencil, Star } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { BikeDialog } from "@/components/bike/bike-dialog";
import { ConfirmDelete } from "@/components/confirm-delete";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { apiFetch } from "@/lib/api-client";
import { formatDate } from "@/lib/dates";
import type { BikeDTO } from "@/lib/types";
import { cn } from "@/lib/utils";

export function BikeCard({
  bike,
  selected,
}: {
  bike: BikeDTO;
  selected: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [savingDefault, setSavingDefault] = useState(false);
  const details = [bike.brand, bike.model].filter(Boolean).join(" ");

  async function makeDefault() {
    setSavingDefault(true);
    try {
      await apiFetch(`/api/bikes/${bike.id}/default`);
      toast.success(`${bike.name} is now your default bike`);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save.");
    } finally {
      setSavingDefault(false);
    }
  }

  return (
    <Card className={cn("gap-3 p-4", selected && "ring-2 ring-primary")}>
      <Link
        href={`/bike?bike=${bike.id}`}
        scroll={false}
        aria-current={selected ? "true" : undefined}
        className="flex items-start gap-3 rounded-lg"
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
          <BikeIcon className="size-5" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="truncate font-semibold">{bike.name}</span>
            {bike.isDefault && <Badge variant="secondary">Default</Badge>}
          </span>
          {details && (
            <span className="block truncate text-muted-foreground">
              {details}
            </span>
          )}
          {bike.registrationNumber && (
            <span className="block truncate text-xs text-muted-foreground">
              {bike.registrationNumber}
            </span>
          )}
          {bike.purchaseDate && (
            <span className="block text-xs text-muted-foreground">
              Bought {formatDate(bike.purchaseDate)}
            </span>
          )}
        </span>
      </Link>
      <div className="flex items-center justify-end gap-1 border-t pt-2">
        {!bike.isDefault && (
          <Button
            variant="ghost"
            size="sm"
            className="mr-auto text-muted-foreground"
            disabled={savingDefault}
            onClick={makeDefault}
          >
            {savingDefault ? (
              <Loader2 className="animate-spin" aria-hidden />
            ) : (
              <Star aria-hidden />
            )}
            Set default
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground"
          aria-label={`Edit ${bike.name}`}
          onClick={() => setEditing(true)}
        >
          <Pencil aria-hidden />
        </Button>
        <BikeDialog open={editing} onOpenChange={setEditing} bike={bike} />
        <ConfirmDelete
          url={`/api/bikes/${bike.id}`}
          itemLabel={`Delete ${bike.name}`}
          title={`Delete ${bike.name}?`}
          description="All of this bike's fuel history will be deleted too. Your documents are kept. This cannot be undone."
          successMessage="Bike deleted"
        />
      </div>
    </Card>
  );
}
