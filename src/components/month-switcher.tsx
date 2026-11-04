import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

import { PendingIcon } from "@/components/pending-icon";
import { buttonVariants } from "@/components/ui/button";
import { formatMonth, formatShortMonth, shiftMonth } from "@/lib/dates";

/**
 * Previous/next control. `hrefFor` builds the link for a given month, and
 * `yearly` moves a whole year at a time and shows only the year.
 */
export function MonthSwitcher({
  month,
  hrefFor,
  yearly = false,
}: {
  month: string;
  hrefFor: (month: string) => string;
  yearly?: boolean;
}) {
  const stepClass = buttonVariants({ variant: "ghost", size: "icon-sm" });
  const step = yearly ? 12 : 1;
  const unit = yearly ? "year" : "month";
  return (
    <div className="inline-flex shrink-0 items-center gap-0.5 rounded-xl border bg-card p-0.5 md:gap-1 md:p-1">
      <Link
        href={hrefFor(shiftMonth(month, -step))}
        scroll={false}
        className={stepClass}
        aria-label={`Previous ${unit}`}
      >
        <PendingIcon>
          <ChevronLeft aria-hidden />
        </PendingIcon>
      </Link>
      <span className="min-w-18 text-center text-sm font-medium tabular-nums md:min-w-32">
        {yearly ? (
          month.slice(0, 4)
        ) : (
          <>
            <span className="md:hidden">{formatShortMonth(month)}</span>
            <span className="hidden md:inline">{formatMonth(month)}</span>
          </>
        )}
      </span>
      <Link
        href={hrefFor(shiftMonth(month, step))}
        scroll={false}
        className={stepClass}
        aria-label={`Next ${unit}`}
      >
        <PendingIcon>
          <ChevronRight aria-hidden />
        </PendingIcon>
      </Link>
    </div>
  );
}
