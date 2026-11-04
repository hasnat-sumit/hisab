"use client";

import { Bike, Home, UserRound, WalletCards } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import type { ModuleSettings } from "@/lib/constants";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/expenses", label: "Expenses", icon: WalletCards, module: "finance" },
  { href: "/bike", label: "Vehicles", icon: Bike, module: "vehicles" },
  { href: "/profile", label: "Profile", icon: UserRound },
] as const;

const BOTTOM_COLUMNS: Record<number, string> = {
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
};

export function AppNav({ modules }: { modules: ModuleSettings }) {
  const pathname = usePathname();
  const items = NAV_ITEMS.filter(
    (item) => !("module" in item) || modules[item.module],
  );

  return (
    <>
      <nav
        aria-label="Main"
        className="fixed top-19 left-5 z-40 hidden w-50 flex-col gap-1 md:flex"
      >
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors",
                active
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="size-4.5" aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>

      <nav
        aria-label="Main"
        className={cn(
          "fixed inset-x-0 bottom-0 z-40 grid border-t bg-card pb-[env(safe-area-inset-bottom)] md:hidden",
          BOTTOM_COLUMNS[items.length],
        )}
      >
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex h-16 flex-col items-center justify-center gap-1 text-xs font-medium transition-colors select-none active:bg-muted",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Icon className="size-5" aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}

/** Holds the navigation's place until the user's settings have loaded. */
export function AppNavSkeleton() {
  return (
    <div
      aria-hidden
      className="fixed inset-x-0 bottom-0 z-40 h-[calc(4rem+env(safe-area-inset-bottom))] border-t bg-card md:hidden"
    />
  );
}
