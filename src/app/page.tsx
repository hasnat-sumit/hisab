import {
  ArrowRight,
  Bike,
  FileText,
  PiggyBank,
  WalletCards,
} from "lucide-react";
import Link from "next/link";

import { Logo } from "@/components/logo";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const FEATURES = [
  {
    icon: WalletCards,
    title: "Income and expenses",
    description:
      "Add an expense in seconds, then filter by month or category to see where your money went.",
  },
  {
    icon: PiggyBank,
    title: "Monthly savings",
    description:
      "See your income, expenses and savings in Taka (৳) for any month, worked out for you.",
  },
  {
    icon: Bike,
    title: "Bike fuel and mileage",
    description:
      "Log each fill-up to follow your km/L, total fuel cost and cost per km for every bike.",
  },
  {
    icon: FileText,
    title: "Licences and documents",
    description:
      "Keep your licence, RC, insurance and tax token together. Only you can open them.",
  },
];

export default function LandingPage() {
  return (
    <>
      <header className="sticky top-0 z-30 border-b bg-card pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-2 md:px-8 md:py-3">
          <Link
            href="/"
            aria-label="Hisab home"
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
            Your money and your bike, in one simple place
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-pretty text-muted-foreground">
            Hisab tracks your income, expenses and savings, along with your
            motorcycle&apos;s fuel and mileage.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/signup" className={buttonVariants({ size: "lg" })}>
              Get started <ArrowRight aria-hidden />
            </Link>
            <Link
              href="/login"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              Log in
            </Link>
          </div>
        </section>

        <section
          id="features"
          aria-labelledby="features-heading"
          className="scroll-mt-16 border-t bg-muted/40"
        >
          <div className="mx-auto w-full max-w-5xl px-4 py-14 md:px-8">
            <h2
              id="features-heading"
              className="text-center text-2xl font-semibold tracking-tight"
            >
              Everything you need, nothing you don&apos;t
            </h2>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2">
              {FEATURES.map(({ icon: Icon, title, description }) => (
                <li key={title}>
                  <Card className="h-full gap-3 p-5">
                    <span className="flex size-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <h3 className="font-semibold">{title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {description}
                    </p>
                  </Card>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <footer className="border-t bg-card pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-muted-foreground sm:flex-row md:px-8">
          <p className="text-center sm:text-left">
            Hisab: personal finance and motorcycle tracker
          </p>
          <nav aria-label="Footer" className="flex gap-4">
            <Link
              href="/login"
              className="flex min-h-10 min-w-11 items-center justify-center hover:text-foreground"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="flex min-h-10 min-w-11 items-center justify-center hover:text-foreground"
            >
              Sign up
            </Link>
          </nav>
        </div>
      </footer>
    </>
  );
}
