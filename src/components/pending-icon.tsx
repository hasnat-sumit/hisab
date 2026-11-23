"use client";

import { Loader2 } from "lucide-react";
import { useLinkStatus } from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Use inside a Link: swaps its icon for a spinner while the link loads. */
export function PendingIcon({
  children,
  className,
}: {
  children: ReactNode;
  /** Sizes the spinner to match the icon it replaces. */
  className?: string;
}) {
  const { pending } = useLinkStatus();
  return pending ? (
    <Loader2 className={cn("size-4 animate-spin", className)} aria-hidden />
  ) : (
    children
  );
}
