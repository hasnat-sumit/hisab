import { Bike as BikeIcon, Car } from "lucide-react";
import Link from "next/link";

import { Card } from "@/components/ui/card";
import { formatTaka } from "@/lib/format";
import type { BikeDTO } from "@/lib/types";
import { cn } from "@/lib/utils";

export function VehicleIcon({
  type,
  className,
}: {
  type: BikeDTO["vehicleType"];
  className?: string;
}) {
  const Icon = type === "car" ? Car : BikeIcon;
  return <Icon className={className} aria-hidden />;
}

/** One vehicle to choose from. Opening it shows its dashboard. */
export function BikeCard({
  bike,
  href,
  total,
  periodLabel,
  selected,
}: {
  bike: BikeDTO;
  href: string;
  total: number;
  periodLabel: string;
  selected: boolean;
}) {
  const details = [bike.brand, bike.model].filter(Boolean).join(" ");
  return (
    <Card className={cn("p-0", selected && "ring-2 ring-primary")}>
      <Link
        href={href}
        scroll={false}
        aria-current={selected ? "true" : undefined}
        className="flex items-center gap-3 rounded-xl p-4"
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
          <VehicleIcon type={bike.vehicleType} className="size-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-semibold">{bike.name}</span>
          {details && (
            <span className="block truncate text-sm text-muted-foreground">
              {details}
            </span>
          )}
          <span className="block text-sm text-muted-foreground">
            {periodLabel}:{" "}
            <span className="font-medium text-expense tabular-nums">
              {formatTaka(total)}
            </span>
          </span>
        </span>
      </Link>
    </Card>
  );
}
