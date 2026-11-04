import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

import { PendingIcon } from "@/components/pending-icon";
import { buttonVariants } from "@/components/ui/button";
import { formatMonth, formatShortMonth, shiftMonth } from "@/lib/dates";

/** Previous/next month control. `hrefFor` builds the link for a given month. */
export function MonthSwitcher({
  month,
  hrefFor,
}: {
  month: string;
  hrefFor: (month: string) => string;
}) {
  const stepClass = buttonVariants({ variant: "ghost", size: "icon-sm" });
  return (
    <div className="inline-flex shrink-0 items-center gap-0.5 rounded-xl border bg-card p-0.5 md:gap-1 md:p-1">
      <Link
        href={hrefFor(shiftMonth(month, -1))}
        scroll={false}
        className={stepClass}
        aria-label="Previous month"
      >
        <PendingIcon>
          <ChevronLeft aria-hidden />
        </PendingIcon>
      </Link>
      <span className="min-w-18 text-center text-sm font-medium tabular-nums md:min-w-32">
        <span className="md:hidden">{formatShortMonth(month)}</span>
        <span className="hidden md:inline">{formatMonth(month)}</span>
      </span>
      <Link
        href={hrefFor(shiftMonth(month, 1))}
        scroll={false}
        className={stepClass}
        aria-label="Next month"
      >
        <PendingIcon>
          <ChevronRight aria-hidden />
        </PendingIcon>
      </Link>
    </div>
  );
}
