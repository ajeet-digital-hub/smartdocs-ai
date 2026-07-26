import mongoose, { Schema, Document, Model, models } from "mongoose";

export interface IUnlockRequest extends Document {
  childId: mongoose.Types.ObjectId;
  familyId: mongoose.Types.ObjectId;
  parentId: mongoose.Types.ObjectId;
  websiteId?: mongoose.Types.ObjectId;
  websiteName: string;
  websiteDomain: string;
  reason: string;
  type: "normal" | "emergency";
  status: "pending" | "approved_once" | "approved_10min" | "approved_30min" | "denied";
  deniedReason?: string;
  approvedUntil?: Date;
  createdAt: Date;
}

const UnlockRequestSchema = new Schema<IUnlockRequest>(
  {
    childId: { type: Schema.Types.ObjectId, ref: "Child", required: true, index: true },
    familyId: { type: Schema.Types.ObjectId, ref: "Family", required: true, index: true },
    parentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    websiteId: { type: Schema.Types.ObjectId, ref: "WebsitePolicy" },
    websiteName: { type: String, required: true },
    websiteDomain: { type: String, required: true },
    reason: { type: String, required: true },
    type: { type: String, enum: ["normal", "emergency"], default: "normal" },
    status: {
      type: String,
      enum: ["pending", "approved_once", "approved_10min", "approved_30min", "denied"],
      default: "pending",
    },
    deniedReason: String,
    approvedUntil: Date,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

UnlockRequestSchema.index({ familyId: 1, status: 1 });
UnlockRequestSchema.index({ childId: 1, status: 1 });

const UnlockRequest: Model<IUnlockRequest> =
  (models.UnlockRequest as Model<IUnlockRequest>) ||
  mongoose.model<IUnlockRequest>("UnlockRequest", UnlockRequestSchema);

export default UnlockRequest;

