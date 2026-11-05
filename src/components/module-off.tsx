import { EyeOff } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/** Shown if someone opens the page of a module they have turned off. */
export function ModuleOff({ name }: { name: string }) {
  return (
    <Card>
      <EmptyState
        icon={EyeOff}
        title={`${name} is turned off`}
        description="Your records are safe. Turn it back on any time in your settings."
      >
        <Link
          href="/settings"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Go to settings
        </Link>
      </EmptyState>
    </Card>
  );
}
