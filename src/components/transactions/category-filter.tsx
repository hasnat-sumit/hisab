"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { SimpleSelect } from "@/components/simple-select";
import { cn } from "@/lib/utils";

const ALL = "all";

/** `baseHref` is the current page URL without the category filter. */
export function CategoryFilter({
  baseHref,
  category,
  categories,
}: {
  baseHref: string;
  category?: string;
  categories: string[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <SimpleSelect
      label="Filter by category"
      value={category ?? ALL}
      className={cn("sm:w-48", pending && "opacity-60")}
      options={[
        { value: ALL, label: "All categories" },
        ...categories.map((c) => ({ value: c, label: c })),
      ]}
      onChange={(next) => {
        const href =
          next === ALL
            ? baseHref
            : `${baseHref}&category=${encodeURIComponent(next)}`;
        startTransition(() => router.push(href, { scroll: false }));
      }}
    />
  );
}
