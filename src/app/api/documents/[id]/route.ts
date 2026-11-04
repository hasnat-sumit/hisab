import { isObjectId, notFound, withUser } from "@/lib/api";
import { BikeDocument } from "@/lib/models/bike-document";
import { deleteFile } from "@/lib/storage";

type Params = { id: string };

export const DELETE = withUser<Params>(async ({ user, params }) => {
  if (!isObjectId(params.id)) throw notFound("Document");
  const document = await BikeDocument.findOne({
    _id: params.id,
    userId: user.id,
  });
  if (!document) throw notFound("Document");

  // File first: if this fails the record remains and the user can retry.
  await deleteFile(document.fileStorageKey);
  await document.deleteOne();
  return new Response(null, { status: 204 });
});
