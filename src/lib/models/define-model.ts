import mongoose, { type Model, type Schema } from "mongoose";

/**
 * Registers a model once. In development the Mongoose instance outlives code
 * reloads, so an existing model is replaced: keeping it would mean using the
 * old schema, which silently drops any fields added since the server started.
 */
export function defineModel<T>(name: string, schema: Schema<T>): Model<T> {
  const existing = mongoose.models[name] as Model<T> | undefined;
  if (existing && process.env.NODE_ENV === "production") return existing;
  if (existing) mongoose.deleteModel(name);
  return mongoose.model<T>(name, schema);
}
