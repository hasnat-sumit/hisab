import Link from "next/link";
import type { ReactNode } from "react";

import { Logo } from "@/components/logo";
import { Card } from "@/components/ui/card";

export function AuthCard({
  title,
  description,
  footerText,
  footerLinkHref,
  footerLinkLabel,
  children,
}: {
  title: string;
  description: string;
  footerText: string;
  footerLinkHref: string;
  footerLinkLabel: string;
  children: ReactNode;
}) {
  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-6">
      <Link
        href="/"
        aria-label="Hisab home"
        className="flex min-h-10 items-center rounded-lg"
      >
        <Logo />
      </Link>
      <Card className="w-full gap-5 p-6">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {children}
      </Card>
      <p className="text-sm text-muted-foreground">
        {footerText}{" "}
        <Link
          href={footerLinkHref}
          className="inline-flex min-h-10 min-w-11 items-center justify-center font-medium text-primary underline-offset-3 hover:underline"
        >
          {footerLinkLabel}
        </Link>
      </p>
    </div>
  );
}
