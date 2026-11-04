import "server-only";

import { connectDB } from "../db";
import { toISODate } from "../dates";
import { BikeDocument, type BikeDocumentDoc } from "../models/bike-document";
import type { BikeDTO, DocumentDTO } from "../types";

type LeanDocument = BikeDocumentDoc & { _id: { toString(): string } };

export async function getDocuments(
  userId: string,
  bikes: BikeDTO[],
): Promise<DocumentDTO[]> {
  await connectDB();
  const docs = await BikeDocument.find({ userId })
    .sort({ uploadedAt: -1 })
    .lean<LeanDocument[]>();
  return docs.map((doc) => ({
    id: doc._id.toString(),
    name: doc.name,
    documentType: doc.documentType,
    bikeName: bikes.find((bike) => bike.id === doc.bikeId?.toString())?.name,
    mimeType: doc.mimeType,
    size: doc.size,
    uploadedAt: toISODate(doc.uploadedAt),
  }));
}
