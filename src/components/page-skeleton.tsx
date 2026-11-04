import { Skeleton } from "@/components/ui/skeleton";

/** Shaped like the pages, so nothing jumps when the real content arrives. */
export function PageSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading">
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-7 w-32 md:h-8" />
        <Skeleton className="h-11 w-40 rounded-xl" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="col-span-2 h-24 rounded-xl sm:col-span-1" />
      </div>
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}
