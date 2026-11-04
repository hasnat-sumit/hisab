import mongoose, { Schema, type Model, type Types } from "mongoose";

export type FuelEntryDoc = {
  userId: string;
  bikeId: Types.ObjectId;
  date: Date;
  odometer: number;
  fuelQuantity: number;
  totalCost: number;
  createdAt: Date;
  updatedAt: Date;
};

const fuelEntrySchema = new Schema<FuelEntryDoc>(
  {
    userId: { type: String, required: true },
    bikeId: { type: Schema.Types.ObjectId, ref: "Bike", required: true },
    date: { type: Date, required: true },
    odometer: { type: Number, required: true, min: 0 },
    fuelQuantity: { type: Number, required: true, min: 0.001 },
    totalCost: { type: Number, required: true, min: 0 },
  },
  { timestamps: true },
);

// Also stops the same fill-up being saved twice.
fuelEntrySchema.index(
  { userId: 1, bikeId: 1, date: 1, odometer: 1 },
  { unique: true },
);

export const FuelEntry: Model<FuelEntryDoc> =
  mongoose.models.FuelEntry ??
  mongoose.model<FuelEntryDoc>("FuelEntry", fuelEntrySchema);
