import { DOCUMENT_EXTENSIONS } from "./constants";

type DetectedType = { mimeType: string; extension: string };

function startsWith(data: Uint8Array, signature: number[]): boolean {
  return signature.every((byte, index) => data[index] === byte);
}

/**
 * Identifies a file from its first bytes. The name and type sent by the
 * browser can say anything, so they are not trusted.
 */
export function detectFileType(data: Uint8Array): DetectedType | null {
  if (startsWith(data, [0x25, 0x50, 0x44, 0x46, 0x2d])) {
    return { mimeType: "application/pdf", extension: "pdf" };
  }
  if (startsWith(data, [0xff, 0xd8, 0xff])) {
    return { mimeType: "image/jpeg", extension: "jpg" };
  }
  if (startsWith(data, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return { mimeType: "image/png", extension: "png" };
  }
  return null;
}

export function hasAllowedExtension(fileName: string): boolean {
  const extension = fileName.split(".").pop()?.toLowerCase() ?? "";
  return DOCUMENT_EXTENSIONS.includes(extension);
}

export function nameWithoutExtension(fileName: string): string {
  return fileName.replace(/\.[^.]+$/, "").trim().slice(0, 100) || "Document";
}

/** Content-Disposition header value that is safe for any document name. */
export function contentDisposition(
  mode: "inline" | "attachment",
  name: string,
  extension: string,
): string {
  const fileName = `${name}.${extension}`;
  const ascii = fileName.replace(/[^\w.\- ]/g, "_");
  return `${mode}; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(fileName)}`;
}
