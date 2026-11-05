import type { Metadata } from "next";
import Link from "next/link";

import { Contact } from "@/components/contact";
import { Logo } from "@/components/logo";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <>
      <header className="sticky top-0 z-30 border-b bg-card pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex w-full max-w-5xl items-center px-4 py-2 md:px-8 md:py-3">
          <Link
            href="/"
            aria-label="হিসাব-Hisab home"
            className="flex min-h-10 items-center rounded-lg"
          >
            <Logo />
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 pb-[calc(2.5rem+env(safe-area-inset-bottom))] md:px-8">
        <Contact />
      </main>
    </>
  );
}
