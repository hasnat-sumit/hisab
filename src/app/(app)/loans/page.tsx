import { HandCoins } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { EmptyState } from "@/components/empty-state";
import { AddLoanButton } from "@/components/loans/add-loan-button";
import { LoanCard } from "@/components/loans/loan-card";
import { ModuleOff } from "@/components/module-off";
import { PageHeader } from "@/components/page-header";
import { PageSkeleton } from "@/components/page-skeleton";
import { Card } from "@/components/ui/card";
import type { LoanDirection } from "@/lib/constants";
import { getLoans } from "@/lib/data/loans";
import { getSettings } from "@/lib/data/settings";
import { formatTaka } from "@/lib/format";
import { loanProgress, loanTotals, peopleSummary, personKey } from "@/lib/loans";
import { requireUser } from "@/lib/session";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Loans" };

const TABS: { direction: LoanDirection; label: string }[] = [
  { direction: "lent", label: "Lent" },
  { direction: "borrowed", label: "Borrowed" },
];

function pageHref(direction: LoanDirection, person?: string): string {
  const base = `/loans?view=${direction}`;
  return person ? `${base}&person=${encodeURIComponent(person)}` : base;
}

export default function LoansPage({ searchParams }: PageProps<"/loans">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <LoansContent searchParams={searchParams} />
    </Suspense>
  );
}

function Total({
  label,
  amount,
  highlight = false,
}: {
  label: string;
  amount: number;
  highlight?: boolean;
}) {
  return (
    <Card
      className={cn(
        "gap-1 p-4",
        highlight && "col-span-2 bg-accent ring-primary/15 sm:col-span-1",
      )}
    >
      <p className="text-sm text-muted-foreground">{label}</p>
      <p
        className={cn(
          "text-xl font-semibold tracking-tight wrap-anywhere sm:text-2xl",
          highlight && "text-accent-foreground",
        )}
      >
        {formatTaka(amount)}
      </p>
    </Card>
  );
}

async function LoansContent({
  searchParams,
}: {
  searchParams: PageProps<"/loans">["searchParams"];
}) {
  const user = await requireUser();
  const params = await searchParams;
  const direction: LoanDirection = params.view === "borrowed" ? "borrowed" : "lent";
  const personFilter =
    typeof params.person === "string" && params.person ? personKey(params.person) : undefined;

  const [settings, loans] = await Promise.all([getSettings(user.id), getLoans(user.id)]);
  if (!settings.modules.loans) {
    return (
      <div className="space-y-6">
        <PageHeader title="Loans" />
        <ModuleOff name="Loans" />
      </div>
    );
  }

  const lent = direction === "lent";
  const totals = loanTotals(loans, direction);
  const people = peopleSummary(loans, direction);
  const names = people.map((person) => person.person);
  const selected = people.find((person) => person.key === personFilter);
  // Loans still open come first, each group newest first.
  const shown = loans
    .filter(
      (loan) =>
        loan.direction === direction &&
        (!personFilter || personKey(loan.person) === personFilter),
    )
    .map((loan) => ({ loan, progress: loanProgress(loan) }))
    .sort((a, b) => Number(b.progress.state === "open") - Number(a.progress.state === "open"));

  return (
    <div className="space-y-6">
      <PageHeader title="Loans" />

      <div
        role="navigation"
        aria-label="Loan type"
        className="grid grid-cols-2 gap-1 rounded-xl bg-muted p-1 sm:max-w-xs"
      >
        {TABS.map((tab) => {
          const active = tab.direction === direction;
          return (
            <Link
              key={tab.direction}
              href={pageHref(tab.direction)}
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

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Total label={lent ? "Lent" : "Borrowed"} amount={totals.amount} />
        <Total label={lent ? "Returned" : "Repaid"} amount={totals.repaid} />
        <Total
          label={lent ? "Still to get back" : "You still owe"}
          amount={totals.outstanding}
          highlight
        />
      </div>
      <p className="-mt-3 text-xs text-muted-foreground">
        {lent
          ? "Money lent is not an expense. It is taken off your savings until it comes back."
          : "Borrowed money is not income. It counts in your savings until you pay it back."}
        {totals.writtenOff > 0 &&
          ` ${formatTaka(totals.writtenOff)} has been written off as an expense.`}
      </p>

      {people.length > 0 && (
        <Card className="gap-1 px-4 pt-4 pb-1">
          <h2 className="font-semibold">People</h2>
          <ul className="divide-y">
            {people.map((person) => {
              const active = person.key === personFilter;
              return (
                <li key={person.key}>
                  <Link
                    href={active ? pageHref(direction) : pageHref(direction, person.person)}
                    scroll={false}
                    aria-current={active ? "true" : undefined}
                    className={cn(
                      "-mx-2 flex min-h-12 items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted",
                      active && "bg-muted",
                    )}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium wrap-anywhere">{person.person}</span>
                      <span className="block text-xs text-muted-foreground">
                        {person.loans} {person.loans === 1 ? "loan" : "loans"} ·{" "}
                        {formatTaka(person.repaid)} of {formatTaka(person.amount)}{" "}
                        {lent ? "returned" : "repaid"}
                      </span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span
                        className={cn(
                          "block font-semibold tabular-nums",
                          person.outstanding > 0 ? "text-expense" : "text-muted-foreground",
                        )}
                      >
                        {formatTaka(person.outstanding)}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {person.outstanding > 0 ? (lent ? "owes you" : "you owe") : "settled"}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="font-semibold wrap-anywhere">
            {selected ? `Loans with ${selected.person}` : "All loans"}
          </h2>
          {selected && (
            <Link
              href={pageHref(direction)}
              scroll={false}
              className="inline-flex min-h-10 items-center text-sm font-medium text-primary md:min-h-0"
            >
              Show everyone
            </Link>
          )}
        </div>
        <AddLoanButton direction={direction} people={names} />
      </div>

      <Card className="px-4 py-1">
        {shown.length === 0 ? (
          <EmptyState
            icon={HandCoins}
            title={lent ? "No money lent yet" : "No borrowed money yet"}
            description={
              lent
                ? "Add money you lend, and record each repayment as it comes back."
                : "Add money you borrow, and record each repayment you make."
            }
          />
        ) : (
          <ul className="divide-y">
            {shown.map(({ loan, progress }) => (
              <LoanCard key={loan.id} loan={loan} progress={progress} people={names} />
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
