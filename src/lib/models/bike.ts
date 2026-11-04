import mongoose, { Schema, type Model } from "mongoose";

export type BikeDoc = {
  userId: string;
  name: string;
  brand?: string;
  model?: string;
  registrationNumber?: string;
  purchaseDate?: Date;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
};

const bikeSchema = new Schema<BikeDoc>(
  {
    userId: { type: String, required: true },
    name: { type: String, required: true, trim: true, maxlength: 60 },
    brand: { type: String, trim: true, maxlength: 60 },
    model: { type: String, trim: true, maxlength: 60 },
    registrationNumber: { type: String, trim: true, maxlength: 40 },
    purchaseDate: { type: Date },
    isDefault: { type: Boolean, required: true, default: false },
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

export const Bike: Model<BikeDoc> =
  mongoose.models.Bike ?? mongoose.model<BikeDoc>("Bike", bikeSchema);
