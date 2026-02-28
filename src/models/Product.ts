import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  name: string;
  productCode: string;
  price: number;
  netQuantity: number;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const ProductSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    productCode: { type: String, required: true, unique: true },
    price: { type: Number, required: true },
    netQuantity: { type: Number, required: true, default: 0 },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const Product = mongoose.model<IProduct>("Product", ProductSchema);
