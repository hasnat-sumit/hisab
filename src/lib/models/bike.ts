import { Schema } from "mongoose";

import { VEHICLE_TYPE_VALUES, type VehicleType } from "../constants";
import { defineModel } from "./define-model";

export type BikeDoc = {
  userId: string;
  name: string;
  /** Unset on vehicles from before cars were supported, which are all bikes. */
  vehicleType?: VehicleType;
  brand?: string;
  model?: string;
  registrationNumber?: string;
  purchaseDate?: Date;
  /** No longer used by the app. Kept so existing records and indexes stay valid. */
  isDefault: boolean;
  /** Archived vehicles leave the lists but keep their financial history. */
  archivedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

const bikeSchema = new Schema<BikeDoc>(
  {
    userId: { type: String, required: true },
    name: { type: String, required: true, trim: true, maxlength: 60 },
    vehicleType: { type: String, enum: VEHICLE_TYPE_VALUES },
    brand: { type: String, trim: true, maxlength: 60 },
    model: { type: String, trim: true, maxlength: 60 },
    registrationNumber: { type: String, trim: true, maxlength: 40 },
    purchaseDate: { type: Date },
    isDefault: { type: Boolean, required: true, default: false },
    archivedAt: { type: Date },
  },
  // "model" is also a Mongoose document method; this bike's field is intended.
  { timestamps: true, suppressReservedKeysWarning: true },
);

// One bike of each name per user, ignoring upper and lower case.
bikeSchema.index(
  { userId: 1, name: 1 },
  { unique: true, collation: { locale: "en", strength: 2 } },
);
// The database itself guarantees at most one default bike per user.
bikeSchema.index(
  { userId: 1, isDefault: 1 },
  { unique: true, partialFilterExpression: { isDefault: true } },
);

export const Bike = defineModel("Bike", bikeSchema);
