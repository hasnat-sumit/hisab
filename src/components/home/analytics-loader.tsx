"use client";

import dynamic from "next/dynamic";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { FinanceRow } from "@/lib/finance";

// The chart library is large, so it loads after the page and only when used.
const Analytics = dynamic(
  () => import("@/components/home/analytics").then((mod) => mod.Analytics),
  {
    ssr: false,
    loading: () => (
      <Card className="gap-3 p-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-64 rounded-lg" />
      </Card>
    ),
  },
);

export function AnalyticsLoader(props: {
  rows: FinanceRow[];
  initialMonth: string;
}) {
  return <Analytics {...props} />;
}
