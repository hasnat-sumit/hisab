import mongoose, { Schema, type Model, type Types } from "mongoose";

import { DOCUMENT_TYPE_VALUES, type DocumentType } from "../constants";

export type BikeDocumentDoc = {
  userId: string;
  bikeId?: Types.ObjectId;
  name: string;
  documentType: DocumentType;
  fileStorageKey: string;
  mimeType: string;
  extension: string;
  size: number;
  uploadedAt: Date;
};

const bikeDocumentSchema = new Schema<BikeDocumentDoc>({
  userId: { type: String, required: true },
  bikeId: { type: Schema.Types.ObjectId, ref: "Bike" },
  name: { type: String, required: true, trim: true, maxlength: 100 },
  documentType: { type: String, enum: DOCUMENT_TYPE_VALUES, required: true },
  fileStorageKey: { type: String, required: true, unique: true },
  mimeType: { type: String, required: true },
  extension: { type: String, required: true },
  size: { type: Number, required: true },
  uploadedAt: { type: Date, required: true, default: Date.now },
});

bikeDocumentSchema.index({ userId: 1, uploadedAt: -1 });

export const BikeDocument: Model<BikeDocumentDoc> =
  mongoose.models.BikeDocument ??
  mongoose.model<BikeDocumentDoc>("BikeDocument", bikeDocumentSchema);
