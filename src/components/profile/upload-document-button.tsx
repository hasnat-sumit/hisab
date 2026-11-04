"use client";

import { Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { FormField } from "@/components/form-field";
import { SimpleSelect } from "@/components/simple-select";
import { SubmitButton } from "@/components/submit-button";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ApiRequestError, apiFetch } from "@/lib/api-client";
import {
  DOCUMENT_ACCEPT,
  DOCUMENT_TYPES,
  MAX_DOCUMENT_BYTES,
} from "@/lib/constants";
import { hasAllowedExtension } from "@/lib/document-files";
import type { BikeDTO } from "@/lib/types";

type Errors = Partial<Record<"file" | "documentType" | "name", string>>;

const NO_BIKE = "none";

function UploadForm({
  bikes,
  onDone,
}: {
  bikes: BikeDTO[];
  onDone: () => void;
}) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState("");
  const [name, setName] = useState("");
  const [bikeId, setBikeId] = useState(NO_BIKE);
  const [errors, setErrors] = useState<Errors>({});
  const [pending, setPending] = useState(false);

  function validate(): Errors {
    const found: Errors = {};
    if (!file) found.file = "Choose a file to upload.";
    else if (!hasAllowedExtension(file.name)) {
      found.file = "Only PDF, JPG and PNG files are allowed.";
    } else if (file.size > MAX_DOCUMENT_BYTES) {
      found.file = "File is too large. The limit is 4 MB.";
    }
    if (!documentType) found.documentType = "Choose a document type.";
    return found;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0 || !file) return;

    const form = new FormData();
    form.set("file", file);
    form.set("documentType", documentType);
    form.set("name", name);
    if (bikeId !== NO_BIKE) form.set("bikeId", bikeId);

    setPending(true);
    try {
      await apiFetch("/api/documents", { body: form });
      toast.success("Document uploaded");
      onDone();
      router.refresh();
    } catch (error) {
      if (error instanceof ApiRequestError && error.fieldErrors) {
        setErrors(error.fieldErrors);
      } else {
        toast.error(error instanceof Error ? error.message : "Upload failed.");
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4" noValidate>
      <FormField id="doc-file" label="File" error={errors.file}>
        <Input
          id="doc-file"
          type="file"
          accept={DOCUMENT_ACCEPT}
          className="pt-2"
          aria-invalid={Boolean(errors.file) || undefined}
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
        />
      </FormField>
      <FormField id="doc-type" label="Type" error={errors.documentType}>
        <SimpleSelect
          id="doc-type"
          value={documentType}
          onChange={setDocumentType}
          options={DOCUMENT_TYPES}
          placeholder="Choose a type"
          invalid={Boolean(errors.documentType)}
        />
      </FormField>
      <FormField id="doc-name" label="Name" error={errors.name}>
        <Input
          id="doc-name"
          maxLength={100}
          placeholder="Optional. Uses the file name if empty"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </FormField>
      {bikes.length > 0 && (
        <FormField id="doc-bike" label="Bike">
          <SimpleSelect
            id="doc-bike"
            value={bikeId}
            onChange={setBikeId}
            options={[
              { value: NO_BIKE, label: "Not for a specific bike" },
              ...bikes.map((bike) => ({ value: bike.id, label: bike.name })),
            ]}
          />
        </FormField>
      )}
      <SubmitButton pending={pending}>Upload</SubmitButton>
    </form>
  );
}

export function UploadDocumentButton({ bikes }: { bikes: BikeDTO[] }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Upload aria-hidden />
        Upload
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload a document</DialogTitle>
            <DialogDescription>
              PDF, JPG or PNG, up to 4 MB. Only you can see it.
            </DialogDescription>
          </DialogHeader>
          <UploadForm bikes={bikes} onDone={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
