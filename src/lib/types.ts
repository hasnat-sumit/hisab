import type { DocumentType, TransactionType } from "./constants";
import type { FuelReading } from "./mileage";

// Plain objects passed from the server to client components.

export type SessionUser = {
  id: string;
  name: string;
  email: string;
};

export type TransactionDTO = {
  id: string;
  type: TransactionType;
  date: string;
  category: string;
  amount: number;
  note?: string;
};

export type BikeDTO = {
  id: string;
  name: string;
  brand?: string;
  model?: string;
  registrationNumber?: string;
  purchaseDate?: string;
  isDefault: boolean;
};

export type FuelEntryDTO = FuelReading & {
  bikeId: string;
};

export type DocumentDTO = {
  id: string;
  name: string;
  documentType: DocumentType;
  bikeName?: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
};
