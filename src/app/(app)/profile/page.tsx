import { ChevronRight, Settings } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { PageHeader } from "@/components/page-header";
import { PageSkeleton } from "@/components/page-skeleton";
import { DocumentList } from "@/components/profile/document-list";
import { LogOutButton } from "@/components/profile/log-out-button";
import { UploadDocumentButton } from "@/components/profile/upload-document-button";
import { Card } from "@/components/ui/card";
import { getBikes } from "@/lib/data/bikes";
import { getDocuments } from "@/lib/data/documents";
import { getSettings } from "@/lib/data/settings";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Profile" };

export default function ProfilePage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ProfileContent />
    </Suspense>
  );
}

async function ProfileContent() {
  const user = await requireUser();
  const [settings, bikes] = await Promise.all([
    getSettings(user.id),
    getBikes(user.id),
  ]);
  const documents = settings.modules.vehicles
    ? await getDocuments(user.id, bikes)
    : [];

  return (
    <div className="space-y-6">
      <PageHeader title="Profile" />

      <Card className="gap-4 p-4">
        <h2 className="font-semibold">Account</h2>
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="flex size-12 shrink-0 items-center justify-center rounded-full bg-accent text-lg font-semibold text-accent-foreground"
          >
            {user.name.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate font-semibold">{user.name}</p>
            <p className="truncate text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
      </Card>

      {settings.modules.vehicles && (
        <Card className="gap-2 px-4 pt-4 pb-1">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <h2 className="font-semibold">Vehicle Licences &amp; Documents</h2>
              <p className="text-xs text-muted-foreground">
                Private. Only you can open these files.
              </p>
            </div>
            <UploadDocumentButton bikes={bikes.filter((b) => !b.archived)} />
          </div>
          <DocumentList documents={documents} />
        </Card>
      )}

      <Link
        href="/settings"
        className="flex min-h-14 items-center gap-3 rounded-xl border bg-card px-4 py-2 transition-colors hover:bg-muted active:bg-muted"
      >
        <Settings className="size-5 shrink-0 text-muted-foreground" aria-hidden />
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium">Settings</span>
          <span className="block text-xs text-muted-foreground">
            Name, email, password, theme and dashboard
          </span>
        </span>
        <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
      </Link>

      <div className="flex justify-center">
        <LogOutButton />
      </div>
    </div>
  );
}
