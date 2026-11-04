"use client";

import { Archive, ArchiveRestore, Loader2, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { BikeDialog } from "@/components/bike/bike-dialog";
import { ConfirmDelete } from "@/components/confirm-delete";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api-client";
import type { BikeDTO } from "@/lib/types";

export function ArchiveButton({ bike }: { bike: BikeDTO }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function toggle() {
    setSaving(true);
    try {
      await apiFetch(`/api/bikes/${bike.id}/archive`, {
        body: { archived: !bike.archived },
      });
      toast.success(
        bike.archived ? `${bike.name} restored` : `${bike.name} archived`,
      );
      router.push("/bike", { scroll: false });
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save.");
    } finally {
      setSaving(false);
    }
  }

  const Icon = bike.archived ? ArchiveRestore : Archive;
  return (
    <Button variant="ghost" size="sm" disabled={saving} onClick={toggle}>
      {saving ? (
        <Loader2 className="animate-spin" aria-hidden />
      ) : (
        <Icon aria-hidden />
      )}
      {bike.archived ? "Restore" : "Archive"}
    </Button>
  );
}

/**
 * A vehicle with records can only be archived, so its history stays in the
 * expense totals. One with no records can be deleted outright.
 */
export function VehicleActions({
  bike,
  recordCount,
}: {
  bike: BikeDTO;
  recordCount: number;
}) {
  const [editing, setEditing] = useState(false);
  return (
    <div className="flex items-center gap-1 text-muted-foreground">
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={`Edit ${bike.name}`}
        onClick={() => setEditing(true)}
      >
        <Pencil aria-hidden />
      </Button>
      <BikeDialog open={editing} onOpenChange={setEditing} bike={bike} />
      {recordCount > 0 ? (
        <ArchiveButton bike={bike} />
      ) : (
        <ConfirmDelete
          url={`/api/bikes/${bike.id}`}
          itemLabel={`Delete ${bike.name}`}
          title={`Delete ${bike.name}?`}
          description="It has no expense records. Any linked documents are kept. This cannot be undone."
          successMessage="Vehicle deleted"
          afterDeleteHref="/bike"
        />
      )}
    </div>
  );
}
