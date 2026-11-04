import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    // A top bar that stays in view on phones, an ordinary heading on desktop.
    <header className="sticky top-0 z-30 -mx-4 flex items-center justify-between gap-3 border-b bg-background/95 px-4 pt-[calc(0.5rem+env(safe-area-inset-top))] pb-2 backdrop-blur-sm md:static md:mx-0 md:flex-wrap md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
      <div className="min-w-0">
        <h1 className="truncate text-xl font-semibold tracking-tight md:text-2xl">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
    </header>
  );
}
