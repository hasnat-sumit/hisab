"use client";

import { Fuel } from "lucide-react";
import { useState } from "react";

import { FuelDialog } from "@/components/bike/fuel-dialog";
import { Button } from "@/components/ui/button";
import type { BikeDTO } from "@/lib/types";

export function AddFuelButton({
  bikes,
  bikeId,
  vehicleName,
  variant = "default",
}: {
  bikes: BikeDTO[];
  bikeId?: string;
  /** Tells apart the buttons on a page with several vehicles. */
  vehicleName?: string;
  variant?: "default" | "outline";
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        variant={variant}
        aria-label={vehicleName ? `Add fuel for ${vehicleName}` : undefined}
        onClick={() => setOpen(true)}
      >
        <Fuel aria-hidden />
        Add Fuel
      </Button>
      <FuelDialog
        open={open}
        onOpenChange={setOpen}
        bikes={bikes}
        bikeId={bikeId}
      />
    </>
  );
}
