import {
  Bike,
  FileText,
  PiggyBank,
  WalletCards,
} from "lucide-react";
import Link from "next/link";

import { Logo } from "@/components/logo";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function LandingPage() {
  return (
    <>
      <header className="sticky top-0 z-30 border-b bg-card pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-2 md:px-8 md:py-3">
          <Link
            href="/"
            aria-label="হিসাব-Hisab home"
            className="flex min-h-10 items-center rounded-lg"
          >
            <Logo />
          </Link>
          <nav aria-label="Main" className="flex items-center gap-1 sm:gap-2">
            <Link
              href="#features"
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "hidden sm:inline-flex",
              )}
            >
              Features
            </Link>
            <Link href="/login" className={buttonVariants({ variant: "ghost" })}>
              Log in
            </Link>
            <Link href="/signup" className={buttonVariants()}>
              Sign up
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto w-full max-w-3xl px-4 py-16 text-center md:px-8 md:py-24">
          <h1 className="text-4xl font-semibold tracking-tight text-balance md:text-5xl">
            Your money and your vehicles, in one simple place
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-pretty text-muted-foreground">
            হিসাব-Hisab tracks your income, expenses and savings, along with
            your vehicles&apos; fuel and mileage.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/login"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              Log in
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t bg-card pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-muted-foreground sm:flex-row md:px-8">
          <p className="text-center sm:text-left">
            হিসাব-Hisab 
            <br />Personal finance and vehicle management app
          </p>
          <nav
            aria-label="Footer"
            className="flex flex-wrap justify-center gap-x-4"
          >
            <Link
              href="/contact"
              className="flex min-h-10 min-w-11 items-center justify-center hover:text-foreground"
            >
              Contact
            </Link>
            <a
              href="https://kamrulhsumit.vercel.app/"
              className="flex min-h-10 min-w-11 items-center justify-center hover:text-foreground"
            >
              Developed by
            </a>
          </nav>
        </div>
      </footer>
    </>
  );
}
