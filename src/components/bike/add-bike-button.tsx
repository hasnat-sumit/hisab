"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { BikeDialog } from "@/components/bike/bike-dialog";
import { Button } from "@/components/ui/button";

export function AddBikeButton({
  variant = "outline",
}: {
  variant?: "default" | "outline";
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant={variant} onClick={() => setOpen(true)}>
        <Plus aria-hidden />
        Add Bike
      </Button>
      <BikeDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
