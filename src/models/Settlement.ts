import mongoose, { Schema, Document } from "mongoose";

export interface ISettlement extends Document {
  deliveryPersonId: mongoose.Types.ObjectId;
  date: Date;
  totalSalesAmount: number;
  totalIncentive: number;
  petrolAllowance: number;
  finalTotal: number;
  status: "completed";
  createdAt: Date;
}

const SettlementSchema: Schema = new Schema(
  {
    deliveryPersonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    totalSalesAmount: { type: Number, required: true },
    totalIncentive: { type: Number, required: true },
    petrolAllowance: { type: Number, required: true, default: 0 },
    finalTotal: { type: Number, required: true },
    status: {
      type: String,
      enum: ["completed"],
      default: "completed",
    },
  },
  {
    timestamps: true,
  },
);

export const Settlement = mongoose.model<ISettlement>(
  "Settlement",
  SettlementSchema,
);
