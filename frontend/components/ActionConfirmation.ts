import mongoose, { Document, Schema, Model } from "mongoose";

export interface IActionConfirmation extends Document {
  userId: mongoose.Types.ObjectId;
  status: "pending" | "completed" | "cancelled" | "expired";
  expiresAt: Date;
  action: string;
  payload: Record<string, any>;
}

const ActionConfirmationSchema: Schema<IActionConfirmation> = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    status: { type: String, enum: ["pending", "completed", "cancelled", "expired"], default: "pending", required: true },
    expiresAt: { type: Date, required: true, index: { expires: "1m" } }, // Automatically delete expired docs
    action: { type: String, required: true },
    payload: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

const ActionConfirmation: Model<IActionConfirmation> =
  mongoose.models.ActionConfirmation || mongoose.model<IActionConfirmation>("ActionConfirmation", ActionConfirmationSchema);

export default ActionConfirmation;