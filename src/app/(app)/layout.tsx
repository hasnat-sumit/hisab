import Link from "next/link";
import { Suspense } from "react";

import { AppNav, AppNavSkeleton } from "@/components/app-nav";
import { Logo } from "@/components/logo";
import { ThemeSync } from "@/components/theme-sync";
import { getSettings } from "@/lib/data/settings";
import { requireUser } from "@/lib/session";

async function UserChrome() {
  const user = await requireUser();
  const { modules, theme } = await getSettings(user.id);
  return (
    <>
      <AppNav modules={modules} />
      <ThemeSync theme={theme} />
    </>
  );
}

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      {/* A top bar on phones, the head of the sidebar on larger screens. */}
      <header className="sticky top-0 z-30 border-b bg-card pt-[env(safe-area-inset-top)] md:fixed md:inset-y-0 md:left-0 md:w-60 md:border-r md:border-b-0 md:p-5">
        <div className="flex h-12 items-center px-4 md:h-8 md:px-0">
          <Link
            href="/home"
            aria-label="হিসাব-Hisab home"
            className="flex min-h-10 items-center rounded-lg"
          >
            <Logo />
          </Link>
        </div>
      </header>
      <Suspense fallback={<AppNavSkeleton />}>
        <UserChrome />
      </Suspense>
      <div className="flex-1 md:pl-60">
        <main className="mx-auto w-full max-w-4xl px-4 pt-4 pb-[calc(6rem+env(safe-area-inset-bottom))] md:px-8 md:pt-6 md:pb-10">
          {children}
        </main>
      </div>
    </>
  );
}
