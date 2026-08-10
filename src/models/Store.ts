import mongoose, { Schema, Document } from "mongoose";

export interface IStore extends Document {
  name: string;
  storeId: string;
  groupName: string;
  areaName: string;
  address: string;
  contactNo: string;
  message: string;
  feedback?: string;
  createdAt: Date;
  updatedAt: Date;
}

const StoreSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    storeId: { type: String, required: true, unique: true, trim: true },
    groupName: { type: String, required: true, trim: true },
    areaName: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    contactNo: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    feedback: { type: String, default: "", trim: true },
  },
  {
    timestamps: true,
  },
);

export const Store = mongoose.model<IStore>("Store", StoreSchema);
