import type { Metadata } from "next";
import { Suspense } from "react";

import { PageHeader } from "@/components/page-header";
import { PageSkeleton } from "@/components/page-skeleton";
import { ChangePasswordButton } from "@/components/profile/change-password-button";
import { DocumentList } from "@/components/profile/document-list";
import { LogOutButton } from "@/components/profile/log-out-button";
import { UploadDocumentButton } from "@/components/profile/upload-document-button";
import { Card } from "@/components/ui/card";
import { getBikes } from "@/lib/data/bikes";
import { getDocuments } from "@/lib/data/documents";
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
  const bikes = await getBikes(user.id);
  const documents = await getDocuments(user.id, bikes);

  return (
    <div className="space-y-6">
      <PageHeader title="Profile" />

      <Card className="gap-4 p-4">
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="flex size-12 shrink-0 items-center justify-center rounded-full bg-accent text-lg font-semibold text-accent-foreground"
          >
            {user.name.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate font-semibold">{user.name}</p>
            <p className="truncate text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-4">
          <ChangePasswordButton />
          <LogOutButton />
        </div>
      </Card>

      <Card className="gap-2 px-4 pt-4 pb-1">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="font-semibold">Bike Licences &amp; Documents</h2>
            <p className="text-xs text-muted-foreground">
              Private. Only you can open these files.
            </p>
          </div>
          <UploadDocumentButton bikes={bikes} />
        </div>
        <DocumentList documents={documents} />
      </Card>
    </div>
  );
}
