import type { Metadata } from "next";
import { headers } from "next/headers";
import { Suspense } from "react";

import { PageHeader } from "@/components/page-header";
import { PageSkeleton } from "@/components/page-skeleton";
import { ChangeEmailButton } from "@/components/settings/change-email-button";
import { ChangePasswordButton } from "@/components/settings/change-password-button";
import { ConnectGoogleButton } from "@/components/settings/connect-google-button";
import { EditNameForm } from "@/components/settings/edit-name-form";
import { ModuleSettingsForm } from "@/components/settings/module-settings-form";
import { ThemeSelector } from "@/components/settings/theme-selector";
import { Card } from "@/components/ui/card";
import { getAuth, googleSignInEnabled } from "@/lib/auth";
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
  const requestHeaders = await headers();
  const [settings, accounts] = await Promise.all([
    getSettings(user.id),
    getAuth().api.listUserAccounts({ headers: requestHeaders }),
  ]);
  const hasPassword = accounts.some((a) => a.providerId === "credential");
  const hasGoogle = accounts.some((a) => a.providerId === "google");

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" />

      <Card className="gap-4 p-4">
        <h2 className="font-semibold">Account</h2>
        <EditNameForm name={user.name} />
        <div className="border-t pt-4">
          <p className="text-sm font-medium">Email</p>
          <p className="text-sm wrap-anywhere text-muted-foreground">
            {user.email}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {hasPassword ? (
            <>
              <ChangeEmailButton />
              <ChangePasswordButton />
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              You sign in with Google, so your email comes from Google and there
              is no password to change.
            </p>
          )}
          {googleSignInEnabled() &&
            (hasGoogle ? (
              <p className="text-sm text-muted-foreground">Google is connected.</p>
            ) : (
              <ConnectGoogleButton />
            ))}
        </div>
      </Card>

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
