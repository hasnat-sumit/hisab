import { Bike, ReceiptText } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { AddBikeButton } from "@/components/bike/add-bike-button";
import { AddFuelButton } from "@/components/bike/add-fuel-button";
import { AddVehicleExpenseButton } from "@/components/bike/add-vehicle-expense-button";
import { BikeCard, VehicleIcon } from "@/components/bike/bike-card";
import { FuelHistory } from "@/components/bike/fuel-history";
import { MileageBadge } from "@/components/bike/mileage-badge";
import { ArchiveButton, VehicleActions } from "@/components/bike/vehicle-actions";
import { EmptyState } from "@/components/empty-state";
import { ModuleOff } from "@/components/module-off";
import { MonthSwitcher } from "@/components/month-switcher";
import { PageHeader } from "@/components/page-header";
import { PageSkeleton } from "@/components/page-skeleton";
import { TransactionActions } from "@/components/transactions/transaction-actions";
import { TransactionRow } from "@/components/transactions/transaction-row";
import { Card } from "@/components/ui/card";
import {
  VEHICLE_CATEGORY,
  VEHICLE_TYPES,
  vehicleExpenseTypeOptions,
  type VehicleExpenseTypeOption,
} from "@/lib/constants";
import {
  getBikes,
  getVehicleExpenses,
  getVehicleExpenseTypes,
} from "@/lib/data/bikes";
import { getSettings } from "@/lib/data/settings";
import { formatMonth, resolveMonth } from "@/lib/dates";
import { formatNumber, formatTaka } from "@/lib/format";
import { fuelStats, monthlyFuelStats, type MileageQuality } from "@/lib/mileage";
import { requireUser } from "@/lib/session";
import type { BikeDTO, TransactionDTO, VehicleExpenseDTO } from "@/lib/types";
import { cn } from "@/lib/utils";
import { fuelEntriesFor, vehicleTotals, type VehicleTotals } from "@/lib/vehicles";

export const metadata: Metadata = { title: "Vehicles" };

type View = "month" | "year";

export default function BikePage({ searchParams }: PageProps<"/bike">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <BikeContent searchParams={searchParams} />
    </Suspense>
  );
}

function Stat({
  label,
  value,
  quality,
}: {
  label: string;
  value: string;
  quality?: MileageQuality | null;
}) {
  return (
    <div className="rounded-lg bg-muted p-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-semibold tabular-nums wrap-anywhere">{value}</dd>
      {quality && <MileageBadge quality={quality} />}
    </div>
  );
}

function ExpenseTypeTable({ totals }: { totals: VehicleTotals }) {
  // Every type with spending shows here, even one deleted from the form's list.
  const rows = [
    { value: "fuel", label: "Fuel" },
    ...vehicleExpenseTypeOptions(Object.keys(totals.byType)),
  ].filter((type) => (totals.byType[type.value] ?? 0) > 0);
  if (rows.length === 0) {
    return <p className="text-sm text-muted-foreground">No expenses in this period.</p>;
  }
  return (
    <ul className="grid gap-1.5 text-sm">
      {rows.map((type) => (
        <li key={type.value} className="flex items-baseline justify-between gap-3">
          <span className="min-w-0 truncate text-muted-foreground">{type.label}</span>
          <span className="shrink-0 font-medium tabular-nums">
            {formatTaka(totals.byType[type.value] ?? 0)}
          </span>
        </li>
      ))}
    </ul>
  );
}

function toTransaction(record: VehicleExpenseDTO): TransactionDTO {
  return {
    id: record.id,
    type: "expense",
    date: record.date,
    category: VEHICLE_CATEGORY,
    amount: record.amount,
    note: record.note,
    bikeId: record.bikeId,
    vehicleExpenseType: record.expenseType,
    fuel: record.fuel,
  };
}

async function BikeContent({
  searchParams,
}: {
  searchParams: PageProps<"/bike">["searchParams"];
}) {
  const user = await requireUser();
  const params = await searchParams;
  const month = resolveMonth(params.month);
  const view: View = params.view === "year" ? "year" : "month";
  const period = view === "year" ? month.slice(0, 4) : month;
  const periodLabel = view === "year" ? period : formatMonth(month);

  const [settings, bikes, records, expenseTypes] = await Promise.all([
    getSettings(user.id),
    getBikes(user.id),
    getVehicleExpenses(user.id),
    getVehicleExpenseTypes(user.id),
  ]);

  if (!settings.modules.vehicles) {
    return (
      <div className="space-y-6">
        <PageHeader title="Vehicles" />
        <ModuleOff name="Vehicles" />
      </div>
    );
  }

  const active = bikes.filter((bike) => !bike.archived);
  const archived = bikes.filter((bike) => bike.archived);

  if (bikes.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader title="Vehicles" />
        <Card>
          <EmptyState
            icon={Bike}
            title="Add your first vehicle"
            description="Then log fuel and expenses to see your mileage and running costs."
          >
            <AddBikeButton variant="default" />
          </EmptyState>
        </Card>
      </div>
    );
  }

  // Only ever the user's own vehicles, so a link to someone else's does nothing.
  const selected = bikes.find((bike) => bike.id === params.bike);

  const hrefFor = (next: {
    bike?: string;
    month?: string;
    view?: View;
  }): string => {
    const query = new URLSearchParams();
    const bikeId = "bike" in next ? next.bike : selected?.id;
    if (bikeId) query.set("bike", bikeId);
    query.set("month", next.month ?? month);
    query.set("view", next.view ?? view);
    return `/bike?${query}`;
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Vehicles">
        <MonthSwitcher
          month={month}
          yearly={view === "year"}
          hrefFor={(m) => hrefFor({ month: m })}
        />
      </PageHeader>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          role="navigation"
          aria-label="Period"
          className="grid grid-cols-2 gap-1 rounded-xl bg-muted p-1"
        >
          {(["month", "year"] as const).map((option) => (
            <Link
              key={option}
              href={hrefFor({ view: option })}
              scroll={false}
              aria-current={view === option ? "page" : undefined}
              className={cn(
                "flex h-10 items-center justify-center rounded-lg px-4 text-sm font-medium md:h-9",
                view === option
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {option === "month" ? "Month" : "Year"}
            </Link>
          ))}
        </div>
        <AddBikeButton />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {active.map((bike) => (
          <BikeCard
            key={bike.id}
            bike={bike}
            href={hrefFor({ bike: bike.id })}
            total={vehicleTotals(records, period, bike.id).total}
            periodLabel={periodLabel}
            selected={bike.id === selected?.id}
          />
        ))}
      </div>

      {selected ? (
        <VehicleDashboard
          bike={selected}
          bikes={bikes}
          records={records}
          expenseTypes={expenseTypes}
          period={period}
          periodLabel={periodLabel}
          overviewHref={hrefFor({ bike: undefined })}
        />
      ) : (
        <AllVehicles
          bikes={bikes}
          records={records}
          period={period}
          periodLabel={periodLabel}
        />
      )}

      {archived.length > 0 && (
        <Card className="gap-2 p-4">
          <h2 className="font-semibold">Archived</h2>
          <p className="text-xs text-muted-foreground">
            Hidden from your lists. Their expenses still count in your totals.
          </p>
          <ul className="divide-y">
            {archived.map((bike) => (
              <li
                key={bike.id}
                className="flex flex-wrap items-center justify-between gap-2 py-2"
              >
                <Link
                  href={hrefFor({ bike: bike.id })}
                  scroll={false}
                  className="flex min-h-10 min-w-0 items-center truncate font-medium"
                >
                  {bike.name}
                </Link>
                <ArchiveButton bike={bike} />
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

function AllVehicles({
  bikes,
  records,
  period,
  periodLabel,
}: {
  bikes: BikeDTO[];
  records: VehicleExpenseDTO[];
  period: string;
  periodLabel: string;
}) {
  const combined = vehicleTotals(records, period);
  const withSpending = bikes
    .map((bike) => ({ bike, totals: vehicleTotals(records, period, bike.id) }))
    .filter(({ totals }) => totals.total > 0);
  return (
    <Card className="gap-4 p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
        <h2 className="font-semibold">Total Vehicle Expenses</h2>
        <p className="text-lg font-semibold text-expense wrap-anywhere">
          {formatTaka(combined.total)}
        </p>
      </div>
      {withSpending.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nothing recorded for {periodLabel}. Open a vehicle above to add fuel or
          an expense.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {withSpending.map(({ bike, totals }) => (
            <section key={bike.id} className="grid gap-2 rounded-lg bg-muted p-3">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="min-w-0 truncate font-medium">{bike.name}</h3>
                <p className="shrink-0 font-semibold tabular-nums">
                  {formatTaka(totals.total)}
                </p>
              </div>
              <ExpenseTypeTable totals={totals} />
            </section>
          ))}
        </div>
      )}
    </Card>
  );
}

function VehicleDashboard({
  bike,
  bikes,
  records,
  expenseTypes,
  period,
  periodLabel,
  overviewHref,
}: {
  bike: BikeDTO;
  bikes: BikeDTO[];
  records: VehicleExpenseDTO[];
  expenseTypes: VehicleExpenseTypeOption[];
  period: string;
  periodLabel: string;
  overviewHref: string;
}) {
  const own = records.filter((record) => record.bikeId === bike.id);
  const entries = fuelEntriesFor(records, bike.id);
  const stats = fuelStats(entries);
  const totals = vehicleTotals(records, period, bike.id);
  const months = monthlyFuelStats(entries).filter((m) =>
    m.month.startsWith(period.slice(0, 4)),
  );
  const current = monthlyFuelStats(entries).filter((m) =>
    m.month.startsWith(period),
  );
  const others = own.filter(
    (record) => record.expenseType !== "fuel" && record.date.startsWith(period),
  );
  const typeLabel = VEHICLE_TYPES.find((t) => t.value === bike.vehicleType)?.label;
  const partsAndRepairs =
    (totals.byType.parts ?? 0) + (totals.byType.repairs ?? 0);
  const otherExpenses =
    totals.total -
    (totals.byType.fuel ?? 0) -
    (totals.byType.servicing ?? 0) -
    partsAndRepairs;
  const periodFuel = current.reduce(
    (sum, m) => ({
      cost: sum.cost + m.totalCost,
      liters: sum.liters + m.liters,
    }),
    { cost: 0, liters: 0 },
  );
  // Only a single month has its own mileage; a year shows the overall average.
  const periodMileage = current.length === 1 ? current[0] : null;

  return (
    <div className="space-y-6">
      <Card className="gap-4 p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
              <VehicleIcon type={bike.vehicleType} className="size-5" />
            </span>
            <div className="min-w-0">
              <h2 className="truncate font-semibold">{bike.name}</h2>
              <p className="truncate text-sm text-muted-foreground">
                {[typeLabel, bike.registrationNumber].filter(Boolean).join(" · ")}
                {bike.archived ? " · Archived" : ""}
              </p>
            </div>
          </div>
          <VehicleActions bike={bike} recordCount={own.length} />
        </div>

        {!bike.archived && (
          <div className="grid grid-cols-2 gap-3 sm:flex">
            <AddFuelButton bikes={bikes} bikeId={bike.id} />
            <AddVehicleExpenseButton
              bikes={bikes}
              bikeId={bike.id}
              expenseTypes={expenseTypes}
            />
          </div>
        )}

        <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat
            label="Latest odometer"
            value={
              stats.latestOdometer === null
                ? "–"
                : `${formatNumber(stats.latestOdometer)} km`
            }
          />
          <Stat
            label="Average mileage"
            value={
              stats.averageMileage === null
                ? "–"
                : `${stats.averageMileage.toFixed(1)} km/L`
            }
            quality={stats.mileageQuality}
          />
          <Stat label={`Total, ${periodLabel}`} value={formatTaka(totals.total)} />
          <Stat label="Fuel" value={formatTaka(totals.byType.fuel ?? 0)} />
          <Stat label="Servicing" value={formatTaka(totals.byType.servicing ?? 0)} />
          <Stat label="Parts & repairs" value={formatTaka(partsAndRepairs)} />
          <Stat
            label="Other expenses"
            value={formatTaka(Math.round(otherExpenses * 100) / 100)}
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
        <Link
          href={overviewHref}
          scroll={false}
          className="flex min-h-10 items-center text-sm font-medium text-primary"
        >
          See all vehicles together
        </Link>
      </Card>

      <Card className="gap-4 p-4">
        <h2 className="font-semibold">Fuel, {periodLabel}</h2>
        <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat label="Fuel cost" value={formatTaka(periodFuel.cost)} />
          <Stat label="Liters bought" value={`${formatNumber(periodFuel.liters)} L`} />
          <Stat
            label="Average price"
            value={
              periodFuel.cost > 0 && periodFuel.liters > 0
                ? `${formatTaka(Number((periodFuel.cost / periodFuel.liters).toFixed(2)))}/L`
                : "–"
            }
          />
          <Stat
            label="Mileage"
            value={
              periodMileage?.mileage
                ? `${periodMileage.mileage.toFixed(1)} km/L`
                : "–"
            }
            quality={periodMileage?.mileageQuality}
          />
        </dl>

        {months.length > 0 && (
          <details className="group">
            <summary className="flex min-h-10 cursor-pointer items-center text-sm font-medium text-primary">
              Monthly fuel history, {period.slice(0, 4)}
            </summary>
            <div className="overflow-x-auto">
              <table className="w-full text-sm tabular-nums">
                <thead className="text-left text-xs text-muted-foreground">
                  <tr>
                    <th className="py-1 pr-2 font-medium">Month</th>
                    <th className="py-1 pr-2 text-right font-medium">Cost</th>
                    <th className="py-1 pr-2 text-right font-medium">Liters</th>
                    <th className="py-1 pr-2 text-right font-medium">৳/L</th>
                    <th className="py-1 text-right font-medium">km/L</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {months.map((m) => (
                    <tr key={m.month}>
                      <td className="py-1.5 pr-2 whitespace-nowrap">{formatMonth(m.month)}</td>
                      <td className="py-1.5 pr-2 text-right">{formatTaka(m.totalCost)}</td>
                      <td className="py-1.5 pr-2 text-right">{formatNumber(m.liters)}</td>
                      <td className="py-1.5 pr-2 text-right">
                        {m.averagePrice ? m.averagePrice.toFixed(2) : "–"}
                      </td>
                      <td className="py-1.5 text-right">
                        {m.mileage ? m.mileage.toFixed(1) : "–"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        )}

        <div>
          <h3 className="text-sm font-medium">All fuel entries</h3>
          <FuelHistory entries={entries} bikes={bikes} />
        </div>
      </Card>

      <Card className="gap-2 px-4 pt-4 pb-1">
        <h2 className="font-semibold">Other expenses, {periodLabel}</h2>
        {others.length === 0 ? (
          <EmptyState
            icon={ReceiptText}
            title="No other expenses"
            description="Servicing, parts, insurance and the like appear here."
          />
        ) : (
          <ul className="divide-y">
            {others.map((record) => (
              <TransactionRow
                key={record.id}
                transaction={toTransaction(record)}
                vehicleName={bike.name}
              >
                <TransactionActions
                  transaction={toTransaction(record)}
                  categories={[]}
                  expenseTypes={expenseTypes}
                  bikes={bikes}
                />
              </TransactionRow>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
