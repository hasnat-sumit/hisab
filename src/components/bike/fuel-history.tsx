import { Fuel } from "lucide-react";

import { FuelEntryActions } from "@/components/bike/fuel-entry-actions";
import { MileageBadge } from "@/components/bike/mileage-badge";
import { EmptyState } from "@/components/empty-state";
import { formatDate } from "@/lib/dates";
import { formatNumber, formatTaka } from "@/lib/format";
import { withMileage } from "@/lib/mileage";
import type { BikeDTO, FuelEntryDTO } from "@/lib/types";

export function FuelHistory({
  entries,
  bikes,
}: {
  entries: FuelEntryDTO[];
  bikes: BikeDTO[];
}) {
  if (entries.length === 0) {
    return (
      <EmptyState
        icon={Fuel}
        title="No fuel entries yet"
        description="Add your first fill-up. Mileage appears from the second entry onward."
      />
    );
  }

  const rows = withMileage(entries).reverse();
  return (
    <ul className="divide-y">
      {rows.map((entry) => (
        <li key={entry.id} className="flex items-center gap-3 py-3">
          <div className="min-w-0 flex-1">
            <p className="font-medium">{formatDate(entry.date)}</p>
            <p className="text-xs text-muted-foreground tabular-nums">
              {formatNumber(entry.odometer)} km · {formatTaka(entry.totalCost)}
            </p>
            <p className="text-xs text-muted-foreground tabular-nums">
              {formatNumber(entry.fuelQuantity)} L
              {entry.pricePerLiter
                ? ` at ${formatTaka(entry.pricePerLiter)}/L`
                : ""}
              {entry.fullTank ? " · Full tank" : ""}
            </p>
            {entry.note && (
              <p className="truncate text-xs text-muted-foreground">
                {entry.note}
              </p>
            )}
          </div>
          {/* On phones the actions sit under the mileage. */}
          <div className="flex shrink-0 flex-col items-end md:flex-row md:items-center md:gap-3">
            <div className="text-right">
              {entry.mileage === null ? (
                <p className="text-xs text-muted-foreground">
                  {entry.distance === null ? "First entry" : "No distance"}
                </p>
              ) : (
                <>
                  <p className="font-semibold tabular-nums">
                    {entry.mileage.toFixed(1)} km/L
                  </p>
                  <MileageBadge quality={entry.mileageQuality} />
                </>
              )}
            </div>
            <FuelEntryActions entry={entry} bikes={bikes} />
          </div>
        </li>
      ))}
    </ul>
  );
}
