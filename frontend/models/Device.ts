import mongoose, { Schema, Document, Model, models } from "mongoose";

export interface IDevice extends Document {
  childId: mongoose.Types.ObjectId;
  deviceType: string;
  deviceName: string;
  clientTokenHash: string;
  lastSeenAt?: Date;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const DeviceSchema = new Schema<IDevice>(
  {
    childId: { type: Schema.Types.ObjectId, ref: "Child", required: true, index: true },
    deviceType: { type: String, required: true },
    deviceName: { type: String, required: true },
    clientTokenHash: { type: String, required: true },
    lastSeenAt: Date,
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

DeviceSchema.index({ clientTokenHash: 1 });

const Device: Model<IDevice> =
  (models.Device as Model<IDevice>) || mongoose.model<IDevice>("Device", DeviceSchema);

export default Device;

