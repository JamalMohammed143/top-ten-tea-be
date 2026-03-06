import mongoose, { Schema, Document } from "mongoose";

export interface ISale extends Document {
  deliveryPersonId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  quantitySold: number;
  amountPerProduct: number;
  storeId: mongoose.Types.ObjectId;
  totalAmount: number;
  commissionEarned: number;
  createdAt: Date;
}

const SaleSchema: Schema = new Schema(
  {
    deliveryPersonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantitySold: { type: Number, required: true },
    amountPerProduct: { type: Number, required: true },
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    totalAmount: { type: Number, required: true },
    commissionEarned: { type: Number, required: true },
  },
  {
    timestamps: true,
  },
);

export const Sale = mongoose.model<ISale>("Sale", SaleSchema);
