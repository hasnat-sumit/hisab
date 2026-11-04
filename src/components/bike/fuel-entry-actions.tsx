"use client";

import { Pencil } from "lucide-react";
import { useState } from "react";

import { FuelDialog } from "@/components/bike/fuel-dialog";
import { ConfirmDelete } from "@/components/confirm-delete";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/dates";
import type { BikeDTO, FuelEntryDTO } from "@/lib/types";

export function FuelEntryActions({
  entry,
  bikes,
}: {
  entry: FuelEntryDTO;
  bikes: BikeDTO[];
}) {
  const [editing, setEditing] = useState(false);
  const date = formatDate(entry.date);
  return (
    <div className="flex shrink-0 max-md:-mr-2">
      <Button
        variant="ghost"
        size="icon-sm"
        className="text-muted-foreground"
        aria-label={`Edit fuel entry from ${date}`}
        onClick={() => setEditing(true)}
      >
        <Pencil aria-hidden />
      </Button>
      <FuelDialog
        open={editing}
        onOpenChange={setEditing}
        bikes={bikes}
        bikeId={entry.bikeId}
        entry={entry}
      />
      <ConfirmDelete
        url={`/api/fuel/${entry.id}`}
        itemLabel={`Delete fuel entry from ${date}`}
        title="Delete this fuel entry?"
        description={`The entry from ${date} will be removed and mileage recalculated. This cannot be undone.`}
        successMessage="Fuel entry deleted"
      />
    </div>
  );
}
