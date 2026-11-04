"use client";

import { Fuel } from "lucide-react";
import { useState } from "react";

import { FuelDialog } from "@/components/bike/fuel-dialog";
import { Button } from "@/components/ui/button";
import type { BikeDTO } from "@/lib/types";

export function AddFuelButton({
  bikes,
  bikeId,
  variant = "default",
}: {
  bikes: BikeDTO[];
  bikeId: string;
  variant?: "default" | "outline";
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant={variant} onClick={() => setOpen(true)}>
        <Fuel aria-hidden />
        Add Fuel Entry
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
