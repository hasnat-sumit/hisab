import { Bike } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";

import { AddBikeButton } from "@/components/bike/add-bike-button";
import { AddFuelButton } from "@/components/bike/add-fuel-button";
import { BikeCard } from "@/components/bike/bike-card";
import { FuelHistory } from "@/components/bike/fuel-history";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { PageSkeleton } from "@/components/page-skeleton";
import { Card } from "@/components/ui/card";
import { getBikes, getFuelEntries } from "@/lib/data/bikes";
import { formatNumber, formatTaka } from "@/lib/format";
import { fuelStats } from "@/lib/mileage";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Bike" };

export default function BikePage({ searchParams }: PageProps<"/bike">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <BikeContent searchParams={searchParams} />
    </Suspense>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted p-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-semibold tabular-nums">{value}</dd>
    </div>
  );
}

async function BikeContent({
  searchParams,
}: {
  searchParams: PageProps<"/bike">["searchParams"];
}) {
  const user = await requireUser();
  const { bike: bikeParam } = await searchParams;
  const bikes = await getBikes(user.id);

  if (bikes.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader title="Bike" />
        <Card>
          <EmptyState
            icon={Bike}
            title="Add your first bike"
            description="Then log fuel to see your mileage and running costs."
          >
            <AddBikeButton variant="default" />
          </EmptyState>
        </Card>
      </div>
    );
  }

  const selected =
    bikes.find((bike) => bike.id === bikeParam) ??
    bikes.find((bike) => bike.isDefault) ??
    bikes[0];
  const entries = await getFuelEntries(user.id, selected.id);
  const stats = fuelStats(entries);

  return (
    <div className="space-y-6">
      <PageHeader title="Bike">
        <AddBikeButton />
      </PageHeader>

      <div className="grid gap-3 sm:grid-cols-2">
        {bikes.map((bike) => (
          <BikeCard
            key={bike.id}
            bike={bike}
            selected={bike.id === selected.id}
          />
        ))}
      </div>

      <Card className="gap-4 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="min-w-0 truncate font-semibold">
            {selected.name} fuel log
          </h2>
          <AddFuelButton bikes={bikes} bikeId={selected.id} />
        </div>

        <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat
            label="Average mileage"
            value={
              stats.averageMileage === null
                ? "–"
                : `${stats.averageMileage.toFixed(1)} km/L`
            }
          />
          <Stat
            label="Total distance"
            value={`${formatNumber(stats.totalDistance)} km`}
          />
          <Stat
            label="Total fuel cost"
            value={formatTaka(stats.totalFuelCost)}
          />
          <Stat
            label="Cost per km"
            value={
              stats.costPerKm === null
                ? "–"
                : `${formatTaka(Number(stats.costPerKm.toFixed(2)))}/km`
            }
          />
        </dl>

        <FuelHistory entries={entries} bikes={bikes} />
      </Card>
    </div>
  );
}
