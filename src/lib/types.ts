import type {
  DocumentType,
  ModuleSettings,
  ThemePreference,
  TransactionType,
  VehicleExpenseType,
  VehicleType,
} from "./constants";
import type { FuelReading } from "./mileage";

// Plain objects passed from the server to client components.

export type SessionUser = {
  id: string;
  name: string;
  email: string;
};

export type SettingsDTO = {
  hiddenCategories: Record<TransactionType, string[]>;
  hiddenVehicleExpenseTypes: string[];
  theme: ThemePreference;
  modules: ModuleSettings;
};

export type FuelDetailsDTO = {
  odometer: number;
  liters: number;
  pricePerLiter?: number;
  fullTank?: boolean;
};

export type TransactionDTO = {
  id: string;
  type: TransactionType;
  date: string;
  category: string;
  amount: number;
  note?: string;
  recurring?: boolean;
  bikeId?: string;
  vehicleExpenseType?: VehicleExpenseType;
  fuel?: FuelDetailsDTO;
};

export type BikeDTO = {
  id: string;
  name: string;
  vehicleType: VehicleType;
  brand?: string;
  model?: string;
  registrationNumber?: string;
  purchaseDate?: string;
  archived: boolean;
};

/** A transaction that belongs to a vehicle. */
export type VehicleExpenseDTO = {
  id: string;
  bikeId: string;
  date: string;
  expenseType: VehicleExpenseType;
  amount: number;
  note?: string;
  fuel?: FuelDetailsDTO;
};

export type FuelEntryDTO = FuelReading & {
  bikeId: string;
  note?: string;
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
