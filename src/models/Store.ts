import mongoose, { Schema, Document } from "mongoose";

export interface IStore extends Document {
  name: string;
  storeId: string;
  address: string;
  contactNo: string;
  message?: string;
  createdAt: Date;
  updatedAt: Date;
}

const StoreSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    storeId: { type: String, required: true, unique: true },
    address: { type: String, required: true },
    contactNo: { type: String, required: true },
    message: { type: String },
  },
  {
    timestamps: true,
  },
);

export const Store = mongoose.model<IStore>("Store", StoreSchema);
