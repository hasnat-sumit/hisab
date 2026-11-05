import type { Metadata } from "next";
import { Suspense } from "react";

import { PageHeader } from "@/components/page-header";
import { PageSkeleton } from "@/components/page-skeleton";
import { ModuleSettingsForm } from "@/components/settings/module-settings-form";
import { ThemeSelector } from "@/components/settings/theme-selector";
import { Card } from "@/components/ui/card";
import { getSettings } from "@/lib/data/settings";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <SettingsContent />
    </Suspense>
  );
}

async function SettingsContent() {
  const user = await requireUser();
  const settings = await getSettings(user.id);

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" />

      <Card className="gap-3 p-4">
        <h2 className="font-semibold">Theme</h2>
        <ThemeSelector theme={settings.theme} />
      </Card>

      <Card className="gap-3 p-4">
        <div>
          <h2 className="font-semibold">Customize Your Dashboard</h2>
          <p className="text-xs text-muted-foreground">
            Choose what you see. Turning something off only hides it, and your
            records stay safe.
          </p>
        </div>
        <ModuleSettingsForm modules={settings.modules} />
      </Card>
    </div>
  );
}
