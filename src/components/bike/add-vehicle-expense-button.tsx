"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { VehicleExpenseDialog } from "@/components/bike/vehicle-expense-dialog";
import { Button } from "@/components/ui/button";
import type { BikeDTO } from "@/lib/types";

export function AddVehicleExpenseButton({
  bikes,
  bikeId,
}: {
  bikes: BikeDTO[];
  bikeId?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Plus aria-hidden />
        Add Expense
      </Button>
      <VehicleExpenseDialog
        open={open}
        onOpenChange={setOpen}
        bikes={bikes}
        bikeId={bikeId}
      />
    </>
  );
}
