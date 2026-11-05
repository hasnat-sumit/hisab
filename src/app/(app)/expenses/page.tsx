import { ReceiptText } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { CategoryBreakdown } from "@/components/category-breakdown";
import { EmptyState } from "@/components/empty-state";
import { ModuleOff } from "@/components/module-off";
import { MonthSwitcher } from "@/components/month-switcher";
import { PageHeader } from "@/components/page-header";
import { PageSkeleton } from "@/components/page-skeleton";
import { SummaryCards } from "@/components/summary-cards";
import { AddTransactionButton } from "@/components/transactions/add-transaction-button";
import { CategoryFilter } from "@/components/transactions/category-filter";
import { TransactionActions } from "@/components/transactions/transaction-actions";
import { TransactionRow } from "@/components/transactions/transaction-row";
import { Card } from "@/components/ui/card";
import { categoryOptions, type TransactionType } from "@/lib/constants";
import { getBikes, getVehicleExpenseTypes } from "@/lib/data/bikes";
import { getSettings } from "@/lib/data/settings";
import { getFinanceRows, listTransactions } from "@/lib/data/transactions";
import { formatMonth, resolveMonth } from "@/lib/dates";
import {
  categoryBreakdown,
  periodSummary,
  usedCategories as findUsedCategories,
} from "@/lib/finance";
import { requireUser } from "@/lib/session";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Expenses" };

const TABS: { type: TransactionType; label: string }[] = [
  { type: "expense", label: "Expenses" },
  { type: "income", label: "Income" },
];

function pageHref(type: TransactionType, month: string): string {
  return `/expenses?type=${type}&month=${month}`;
}

export default function ExpensesPage({
  searchParams,
}: PageProps<"/expenses">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ExpensesContent searchParams={searchParams} />
    </Suspense>
  );
}

async function ExpensesContent({
  searchParams,
}: {
  searchParams: PageProps<"/expenses">["searchParams"];
}) {
  const user = await requireUser();
  const params = await searchParams;
  const type: TransactionType = params.type === "income" ? "income" : "expense";
  const month = resolveMonth(params.month);
  const category =
    typeof params.category === "string" && params.category
      ? params.category
      : undefined;

  const [settings, rows, transactions, bikes, expenseTypes] = await Promise.all([
    getSettings(user.id),
    getFinanceRows(user.id),
    listTransactions(user.id, { type, month, category }),
    getBikes(user.id),
    getVehicleExpenseTypes(user.id),
  ]);
  if (!settings.modules.finance) {
    return (
      <div className="space-y-6">
        <PageHeader title="Expenses" />
        <ModuleOff name="Finance" />
      </div>
    );
  }

  const usedCategories = findUsedCategories(rows, type);
  const hidden = settings.hiddenCategories[type];
  const categories = categoryOptions(type, usedCategories, hidden);
  const noun = type === "income" ? "income" : "expenses";

  return (
    <div className="space-y-6 max-md:pb-16">
      <PageHeader title="Expenses">
        <MonthSwitcher month={month} hrefFor={(m) => pageHref(type, m)} />
      </PageHeader>

      <SummaryCards summary={periodSummary(rows, month)} />

      <div
        role="navigation"
        aria-label="Transaction type"
        className="grid grid-cols-2 gap-1 rounded-xl bg-muted p-1 sm:max-w-xs"
      >
        {TABS.map((tab) => {
          const active = tab.type === type;
          return (
            <Link
              key={tab.type}
              href={pageHref(tab.type, month)}
              scroll={false}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex h-10 items-center justify-center rounded-lg text-sm font-medium transition-colors md:h-9",
                active
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      <CategoryBreakdown
        type={type}
        breakdown={categoryBreakdown(rows, month, type)}
        periodLabel={formatMonth(month)}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CategoryFilter
          key={`${type}-${category ?? "all"}`}
          baseHref={pageHref(type, month)}
          category={category}
          // A deleted "Other" can still hold records, which stay findable here.
          categories={categoryOptions(
            type,
            usedCategories,
            hidden.filter((c) => !usedCategories.includes(c)),
          )}
        />
        <AddTransactionButton
          type={type}
          categories={categories}
          floating
        />
      </div>

      <Card className="px-4 py-1">
        {transactions.length === 0 ? (
          <EmptyState
            icon={ReceiptText}
            title={category ? `No ${category} ${noun}` : `No ${noun} yet`}
            description={`Nothing recorded for ${formatMonth(month)}.`}
          />
        ) : (
          <ul className="divide-y">
            {transactions.map((transaction) => (
              <TransactionRow
                key={transaction.id}
                transaction={transaction}
                vehicleName={
                  bikes.find((bike) => bike.id === transaction.bikeId)?.name
                }
              >
                <TransactionActions
                  transaction={transaction}
                  categories={categories}
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
