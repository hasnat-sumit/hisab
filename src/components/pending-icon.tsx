"use client";

import { Loader2 } from "lucide-react";
import { useLinkStatus } from "next/link";
import type { ReactNode } from "react";

/** Use inside a Link: swaps its icon for a spinner while the link loads. */
export function PendingIcon({ children }: { children: ReactNode }) {
  const { pending } = useLinkStatus();
  return pending ? (
    <Loader2 className="size-4 animate-spin" aria-hidden />
  ) : (
    children
  );
}
