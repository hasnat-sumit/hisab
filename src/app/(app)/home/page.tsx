import { ArrowRight, Bike, ReceiptText } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { AddFuelButton } from "@/components/bike/add-fuel-button";
import { EmptyState } from "@/components/empty-state";
import { MonthSwitcher } from "@/components/month-switcher";
import { PageHeader } from "@/components/page-header";
import { PageSkeleton } from "@/components/page-skeleton";
import { SummaryCards } from "@/components/summary-cards";
import { AddTransactionButton } from "@/components/transactions/add-transaction-button";
import { TransactionRow } from "@/components/transactions/transaction-row";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getBikes, getFuelEntries } from "@/lib/data/bikes";
import {
  getMonthSummary,
  getRecentTransactions,
  getUsedCategories,
} from "@/lib/data/transactions";
import { resolveMonth } from "@/lib/dates";
import { formatNumber } from "@/lib/format";
import { fuelStats } from "@/lib/mileage";
import { requireUser } from "@/lib/session";
import { cn } from "@/lib/utils";

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

  const [summary, recent, usedCategories, bikes] = await Promise.all([
    getMonthSummary(user.id, month),
    getRecentTransactions(user.id),
    getUsedCategories(user.id, "expense"),
    getBikes(user.id),
  ]);

  return (
    <div className="space-y-6 max-md:pb-16">
      <PageHeader title={`Hi, ${user.name.split(" ")[0]}`}>
        <MonthSwitcher month={month} hrefFor={(m) => `/home?month=${m}`} />
      </PageHeader>

      <SummaryCards summary={summary} />

      <AddTransactionButton
        type="expense"
        usedCategories={usedCategories}
        floating
      />

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <Card className="gap-0 px-4 pt-4 pb-1">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Recent transactions</h2>
            <Link
              href="/expenses"
              className="-my-2 flex min-h-10 items-center gap-1 text-xs font-medium text-primary md:my-0 md:min-h-0"
            >
              View all <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </div>
          {recent.length === 0 ? (
            <EmptyState
              icon={ReceiptText}
              title="No transactions yet"
              description="Add your first expense to get started."
            />
          ) : (
            <ul className="divide-y">
              {recent.map((transaction) => (
                <TransactionRow
                  key={transaction.id}
                  transaction={transaction}
                />
              ))}
            </ul>
          )}
        </Card>

        <BikeSummary userId={user.id} bikes={bikes} />
      </div>
    </div>
  );
}

async function BikeSummary({
  userId,
  bikes,
}: {
  userId: string;
  bikes: Awaited<ReturnType<typeof getBikes>>;
}) {
  const bike = bikes.find((b) => b.isDefault) ?? bikes[0];

  if (!bike) {
    return (
      <Card className="gap-0 p-4">
        <h2 className="font-semibold">Your bike</h2>
        <EmptyState
          icon={Bike}
          title="No bike added"
          description="Add a bike to track fuel and mileage."
        >
          <Link
            href="/bike"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Go to Bike
          </Link>
        </EmptyState>
      </Card>
    );
  }

  const stats = fuelStats(await getFuelEntries(userId, bike.id));
  return (
    <Card className="gap-4 p-4">
      <div className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
          <Bike className="size-5" aria-hidden />
        </span>
        <div className="min-w-0">
          <h2 className="truncate font-semibold">{bike.name}</h2>
          <p className="text-xs text-muted-foreground">Default bike</p>
        </div>
      </div>
      <dl className="grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-muted p-3">
          <dt className="text-xs text-muted-foreground">Latest odometer</dt>
          <dd className="font-semibold tabular-nums">
            {stats.latestOdometer === null
              ? "–"
              : `${formatNumber(stats.latestOdometer)} km`}
          </dd>
        </div>
        <div className="rounded-lg bg-muted p-3">
          <dt className="text-xs text-muted-foreground">Average mileage</dt>
          <dd className="font-semibold tabular-nums">
            {stats.averageMileage === null
              ? "–"
              : `${stats.averageMileage.toFixed(1)} km/L`}
          </dd>
        </div>
      </dl>
      <AddFuelButton bikes={bikes} bikeId={bike.id} variant="outline" />
    </Card>
  );
}
