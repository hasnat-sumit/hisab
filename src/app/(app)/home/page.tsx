import { Bike, PiggyBank } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { AddBikeButton } from "@/components/bike/add-bike-button";
import { AddFuelButton } from "@/components/bike/add-fuel-button";
import { VehicleIcon } from "@/components/bike/bike-card";
import { MileageBadge } from "@/components/bike/mileage-badge";
import { CategoryBreakdown } from "@/components/category-breakdown";
import { EmptyState } from "@/components/empty-state";
import { AnalyticsLoader } from "@/components/home/analytics-loader";
import { SavingsByYear } from "@/components/home/savings-by-year";
import { MonthSwitcher } from "@/components/month-switcher";
import { PageHeader } from "@/components/page-header";
import { PageSkeleton } from "@/components/page-skeleton";
import { SummaryCards } from "@/components/summary-cards";
import { AddTransactionButton } from "@/components/transactions/add-transaction-button";
import { Card } from "@/components/ui/card";
import { getBikes, getVehicleExpenses } from "@/lib/data/bikes";
import { getSettings } from "@/lib/data/settings";
import { getFinanceRows } from "@/lib/data/transactions";
import { formatMonth, resolveMonth } from "@/lib/dates";
import {
  categoryBreakdown,
  periodSummary,
  totalSavings,
  usedCategories,
} from "@/lib/finance";
import { formatNumber, formatTaka } from "@/lib/format";
import { fuelStats } from "@/lib/mileage";
import { requireUser } from "@/lib/session";
import type { BikeDTO, VehicleExpenseDTO } from "@/lib/types";
import { cn } from "@/lib/utils";
import { fuelEntriesFor, vehicleTotals } from "@/lib/vehicles";

export const metadata: Metadata = { title: "Home" };

export default function HomePage({ searchParams }: PageProps<"/home">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <HomeContent searchParams={searchParams} />
    </Suspense>
  );
}

async function HomeContent({
  searchParams,
}: {
  searchParams: PageProps<"/home">["searchParams"];
}) {
  const user = await requireUser();
  const month = resolveMonth((await searchParams).month);

  const [{ modules }, rows, bikes, records] = await Promise.all([
    getSettings(user.id),
    getFinanceRows(user.id),
    getBikes(user.id),
    getVehicleExpenses(user.id),
  ]);
  const vehicles = bikes.filter((bike) => !bike.archived);
  const savings = totalSavings(rows);

  return (
    <div className={cn("space-y-6", modules.finance && "max-md:pb-16")}>
      <PageHeader title={`Hi, ${user.name.split(" ")[0]}`}>
        <MonthSwitcher month={month} hrefFor={(m) => `/home?month=${m}`} />
      </PageHeader>

      {modules.finance && (
        <>
          <Card className="flex-row items-center gap-4 bg-accent p-4 ring-primary/15 sm:p-5">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-card text-accent-foreground">
              <PiggyBank className="size-5" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">Total Savings</p>
              <p
                data-testid="total-savings"
                className={cn(
                  "text-2xl font-semibold tracking-tight wrap-anywhere sm:text-3xl",
                  savings < 0 ? "text-expense" : "text-accent-foreground",
                )}
              >
                {formatTaka(savings)}
              </p>
            </div>
          </Card>

          <SummaryCards summary={periodSummary(rows, month)} />

          <AddTransactionButton
            type="expense"
            usedCategories={usedCategories(rows, "expense")}
            floating
          />
        </>
      )}

      {modules.vehicles && vehicles.length > 0 && (
        <section aria-label="Your vehicles" className="grid gap-3 sm:grid-cols-2">
          {vehicles.map((bike) => (
            <VehicleCard
              key={bike.id}
              bike={bike}
              bikes={bikes}
              records={records}
              month={month}
            />
          ))}
        </section>
      )}

      {!modules.finance && vehicles.length === 0 && (
        <Card>
          <EmptyState
            icon={Bike}
            title="Add your first vehicle"
            description="Then log fuel and expenses to see your mileage and running costs."
          >
            <AddBikeButton variant="default" />
          </EmptyState>
        </Card>
      )}

      {modules.finance && (
        <>
          <div className="grid items-start gap-3 md:grid-cols-2">
            <CategoryBreakdown
              type="income"
              breakdown={categoryBreakdown(rows, month, "income")}
              periodLabel={formatMonth(month)}
            />
            <CategoryBreakdown
              type="expense"
              breakdown={categoryBreakdown(rows, month, "expense")}
              periodLabel={formatMonth(month)}
            />
          </div>

          <SavingsByYear rows={rows} initialYear={month.slice(0, 4)} />

          {modules.analytics && (
            <AnalyticsLoader rows={rows} initialMonth={month} />
          )}
        </>
      )}
    </div>
  );
}

function VehicleCard({
  bike,
  bikes,
  records,
  month,
}: {
  bike: BikeDTO;
  bikes: BikeDTO[];
  records: VehicleExpenseDTO[];
  month: string;
}) {
  const stats = fuelStats(fuelEntriesFor(records, bike.id));
  const monthly = vehicleTotals(records, month, bike.id);
  return (
    <Card className="gap-3 p-4">
      <Link
        href={`/bike?bike=${bike.id}&month=${month}`}
        className="flex items-center gap-3 rounded-lg"
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
          <VehicleIcon type={bike.vehicleType} className="size-5" />
        </span>
        <h2 className="min-w-0 truncate font-semibold">{bike.name}</h2>
      </Link>
      <dl className="grid grid-cols-3 gap-2 text-sm">
        <div className="min-w-0">
          <dt className="text-xs text-muted-foreground">Odometer</dt>
          <dd className="font-semibold tabular-nums wrap-anywhere">
            {stats.latestOdometer === null
              ? "–"
              : `${formatNumber(stats.latestOdometer)} km`}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-xs text-muted-foreground">Mileage</dt>
          <dd className="font-semibold tabular-nums wrap-anywhere">
            {stats.averageMileage === null
              ? "–"
              : `${stats.averageMileage.toFixed(1)} km/L`}
          </dd>
          <MileageBadge quality={stats.mileageQuality} />
        </div>
        <div className="min-w-0">
          <dt className="text-xs text-muted-foreground">This month</dt>
          <dd className="font-semibold text-expense tabular-nums wrap-anywhere">
            {formatTaka(monthly.total)}
          </dd>
        </div>
      </dl>
      <AddFuelButton
        bikes={bikes}
        bikeId={bike.id}
        vehicleName={bike.name}
        variant="outline"
      />
    </Card>
  );
}
