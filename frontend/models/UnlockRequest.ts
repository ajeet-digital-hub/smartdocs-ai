import mongoose, { Schema, Document } from "mongoose";

export interface IUnlockRequest extends Document {
  childId: mongoose.Types.ObjectId;
  familyId: mongoose.Types.ObjectId;
  deviceId: mongoose.Types.ObjectId;
  appId?: string; // Catalog app ID
  appName?: string;
  domain?: string; // For website unlock requests
  requestType: "app" | "website";
  reason: string;
  status: "pending" | "approved" | "denied" | "expired";
  requestedAt: Date;
  respondedAt?: Date;
  responseBy?: mongoose.Types.ObjectId; // ParentId
  approvedDurationMinutes?: number;
  expiresAt?: Date; // For approved requests
  createdAt: Date;
  updatedAt: Date;
}

const UnlockRequestSchema: Schema = new Schema(
  {
    childId: { type: Schema.Types.ObjectId, ref: "Child", required: true },
    familyId: { type: Schema.Types.ObjectId, ref: "Family", required: true },
    deviceId: { type: Schema.Types.ObjectId, ref: "Device", required: true },
    appId: { type: String },
    appName: { type: String },
    domain: { type: String },
    requestType: { type: String, enum: ["app", "website"], required: true },
    reason: { type: String, required: true },
    status: { type: String, enum: ["pending", "approved", "denied", "expired"], default: "pending" },
    requestedAt: { type: Date, default: Date.now },
    respondedAt: { type: Date },
    responseBy: { type: Schema.Types.ObjectId, ref: "User" },
    approvedDurationMinutes: { type: Number },
    expiresAt: { type: Date },
  },
  { timestamps: true }
);

UnlockRequestSchema.index({ childId: 1, status: 1 });
UnlockRequestSchema.index({ deviceId: 1, status: 1 });

export default (mongoose.models.UnlockRequest as mongoose.Model<IUnlockRequest>) ||
  mongoose.model<IUnlockRequest>("UnlockRequest", UnlockRequestSchema);