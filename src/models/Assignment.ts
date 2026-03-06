import mongoose, { Schema, Document } from "mongoose";

export interface IAssignment extends Document {
  deliveryPersonId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  assignedQuantity: number;
  createdAt: Date;
}

const AssignmentSchema: Schema = new Schema(
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
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    assignedQuantity: { type: Number, required: true, default: 0 },
  },
  {
    timestamps: true,
  },
);

export const Assignment = mongoose.model<IAssignment>(
  "Assignment",
  AssignmentSchema,
);
