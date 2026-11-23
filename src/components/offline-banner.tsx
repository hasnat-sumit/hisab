"use client";

import { WifiOff } from "lucide-react";
import { useOffline } from "next/offline";

/** Shown while the connection is down. Pages and saves continue by themselves when it returns. */
export function OfflineBanner() {
  const isOffline = useOffline();
  if (!isOffline) return null;
  return (
    <div
      role="status"
      className="fixed inset-x-0 top-[calc(env(safe-area-inset-top)+0.5rem)] z-50 flex justify-center px-4"
    >
      <p className="flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background shadow-lg">
        <WifiOff className="size-4" aria-hidden />
        No internet. Waiting to reconnect…
      </p>
    </div>
  );
}
