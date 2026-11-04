import { randomUUID } from "node:crypto";

import { ApiError, parseData, withUser } from "@/lib/api";
import { MAX_DOCUMENT_BYTES } from "@/lib/constants";
import {
  detectFileType,
  hasAllowedExtension,
  nameWithoutExtension,
} from "@/lib/document-files";
import { Bike } from "@/lib/models/bike";
import { BikeDocument } from "@/lib/models/bike-document";
import { deleteFile, saveFile } from "@/lib/storage";
import { documentMetaSchema } from "@/lib/validators";

const TOO_LARGE = "File is too large. The limit is 4 MB.";
// Room for the multipart form fields around the file itself.
const MAX_REQUEST_BYTES = MAX_DOCUMENT_BYTES + 64 * 1024;

export const POST = withUser(async ({ request, user }) => {
  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > MAX_REQUEST_BYTES) throw new ApiError(413, TOO_LARGE);

  const form = await request.formData().catch(() => {
    throw new ApiError(400, "Invalid upload.");
  });
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    throw new ApiError(422, "Choose a file to upload.", {
      file: "Choose a file to upload.",
    });
  }
  if (file.size > MAX_DOCUMENT_BYTES) {
    throw new ApiError(413, TOO_LARGE, { file: TOO_LARGE });
  }

  const data = new Uint8Array(await file.arrayBuffer());
  const detected = hasAllowedExtension(file.name) ? detectFileType(data) : null;
  if (!detected) {
    const message = "Only PDF, JPG and PNG files are allowed.";
    throw new ApiError(415, message, { file: message });
  }

  const meta = parseData(
    {
      name: form.get("name") ?? undefined,
      documentType: form.get("documentType"),
      bikeId: form.get("bikeId") ?? undefined,
    },
    documentMetaSchema,
  );
  if (meta.bikeId) {
    const bike = await Bike.exists({ _id: meta.bikeId, userId: user.id });
    if (!bike) throw new ApiError(404, "Bike not found.");
  }

  const fileStorageKey = `documents/${user.id}/${randomUUID()}.${detected.extension}`;
  await saveFile(fileStorageKey, Buffer.from(data), detected.mimeType);

  try {
    const document = await BikeDocument.create({
      userId: user.id,
      bikeId: meta.bikeId,
      name: meta.name ?? nameWithoutExtension(file.name),
      documentType: meta.documentType,
      fileStorageKey,
      mimeType: detected.mimeType,
      extension: detected.extension,
      size: file.size,
    });
    return Response.json({ id: document.id }, { status: 201 });
  } catch (error) {
    // Don't leave a stored file that nothing points to.
    await deleteFile(fileStorageKey).catch(console.error);
    throw error;
  }
});
