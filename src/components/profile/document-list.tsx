import { Download, Eye, FileImage, FileText } from "lucide-react";

import { ConfirmDelete } from "@/components/confirm-delete";
import { EmptyState } from "@/components/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { DOCUMENT_TYPES } from "@/lib/constants";
import { formatDate } from "@/lib/dates";
import { formatFileSize } from "@/lib/format";
import type { DocumentDTO } from "@/lib/types";

export function DocumentList({ documents }: { documents: DocumentDTO[] }) {
  if (documents.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No documents yet"
        description="Keep your licence, RC, insurance and tax token in one safe place."
      />
    );
  }

  const linkClass = buttonVariants({ variant: "ghost", size: "icon-sm" });
  return (
    <ul className="divide-y">
      {documents.map((document) => {
        const Icon = document.mimeType.startsWith("image/")
          ? FileImage
          : FileText;
        const typeLabel = DOCUMENT_TYPES.find(
          (type) => type.value === document.documentType,
        )?.label;
        const fileUrl = `/api/documents/${document.id}/file`;
        return (
          <li
            key={document.id}
            className="flex flex-wrap items-center gap-x-3 gap-y-1 py-3 md:flex-nowrap"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <Icon className="size-4" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{document.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {typeLabel}
                {document.bikeName && ` · ${document.bikeName}`}
              </p>
              <p className="text-xs text-muted-foreground">
                Uploaded {formatDate(document.uploadedAt)} ·{" "}
                {formatFileSize(document.size)}
              </p>
            </div>
            {/* A row of its own on phones, so long names stay readable. */}
            <div className="flex shrink-0 justify-end text-muted-foreground max-md:-mr-2 max-md:basis-full">

              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
                aria-label={`View ${document.name}`}
              >
                <Eye aria-hidden />
              </a>
              <a
                href={`${fileUrl}?download=1`}
                className={linkClass}
                aria-label={`Download ${document.name}`}
              >
                <Download aria-hidden />
              </a>
              <ConfirmDelete
                url={`/api/documents/${document.id}`}
                itemLabel={`Delete ${document.name}`}
                title="Delete this document?"
                description={`"${document.name}" will be permanently removed.`}
                successMessage="Document deleted"
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
