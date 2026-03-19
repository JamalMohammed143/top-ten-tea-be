import mongoose, { Schema, Document } from "mongoose";

export interface IAssignment extends Document {
  deliveryPersonId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  storeId?: mongoose.Types.ObjectId;
  groupNames?: string[];
  assignedQuantity: number;
  remainingQuantity: number;
  status: "active" | "settled";
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
    },
    groupNames: [{ type: String }],
    assignedQuantity: { type: Number, required: true, default: 0 },
    remainingQuantity: { type: Number, required: true, default: 0 },
    status: {
      type: String,
      enum: ["active", "settled"],
      default: "active",
    },
  },
  {
    timestamps: true,
  },
);

export const Assignment = mongoose.model<IAssignment>(
  "Assignment",
  AssignmentSchema,
);
