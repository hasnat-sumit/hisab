import { isObjectId, notFound, withUser } from "@/lib/api";
import { contentDisposition } from "@/lib/document-files";
import { BikeDocument } from "@/lib/models/bike-document";
import { readStoredFile } from "@/lib/storage";

type Params = { id: string };

// The only way to read a stored file: the session and ownership are checked
// on every request, and the response is never cached by shared caches.
export const GET = withUser<Params>(async ({ request, user, params }) => {
  if (!isObjectId(params.id)) throw notFound("Document");
  const document = await BikeDocument.findOne({
    _id: params.id,
    userId: user.id,
  }).lean();
  if (!document) throw notFound("Document");

  const file = await readStoredFile(document.fileStorageKey);
  if (!file) throw notFound("File");

  const download = new URL(request.url).searchParams.has("download");
  return new Response(file, {
    headers: {
      "Content-Type": document.mimeType,
      "Content-Disposition": contentDisposition(
        download ? "attachment" : "inline",
        document.name,
        document.extension,
      ),
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
});
