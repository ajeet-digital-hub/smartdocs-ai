import mongoose, { Schema, Document } from "mongoose";

export interface IInstalledApp {
  packageName: string;
  appName: string;
  version: string;
  isDetected: boolean;
  lastDetected: Date;
}

export interface IDevice extends Document {
  childId: mongoose.Types.ObjectId;
  familyId: mongoose.Types.ObjectId;
  deviceId: string; // Unique identifier from the device itself (e.g., Android ID)
  deviceName: string;
  platform: "android" | "ios" | "web" | "browser-extension";
  osVersion?: string;
  deviceInfo?: string; // e.g., "Samsung Galaxy S23"
  appVersion?: string; // Version of the Family Guardian app on the device
  status: "online" | "offline" | "pending" | "revoked";
  lastSeen: Date;
  deviceToken: string; // Secure random token for API auth
  fcmToken?: string; // Firebase Cloud Messaging token for push notifications
  batteryLevel?: number; // Last reported battery level
  installedApps: IInstalledApp[];
  lastSyncedPolicyVersion: number; // To track policy updates for device sync
  createdAt: Date;
  updatedAt: Date;
}

const InstalledAppSchema: Schema = new Schema({
  packageName: { type: String, required: true },
  appName: { type: String, required: true },
  version: { type: String },
  isDetected: { type: Boolean, default: true },
  lastDetected: { type: Date, default: Date.now },
}, { _id: false });

const DeviceSchema: Schema = new Schema(
  {
    childId: { type: Schema.Types.ObjectId, ref: "Child", required: true },
    familyId: { type: Schema.Types.ObjectId, ref: "Family", required: true },
    deviceId: { type: String, required: true },
    deviceName: { type: String, required: true },
    platform: { type: String, enum: ["android", "ios", "web", "browser-extension"], required: true },
    osVersion: { type: String },
    deviceInfo: { type: String },
    appVersion: { type: String },
    status: { type: String, enum: ["online", "offline", "pending", "revoked"], default: "pending" },
    lastSeen: { type: Date, default: Date.now },
    deviceToken: { type: String, required: true, unique: true },
    fcmToken: { type: String },
    batteryLevel: { type: Number, min: 0, max: 100 },
    lastSyncedPolicyVersion: { type: Number, default: 0 },
    installedApps: [InstalledAppSchema],
  },
  { timestamps: true }
);

DeviceSchema.index({ childId: 1, deviceId: 1 }, { unique: true });
DeviceSchema.index({ deviceToken: 1 });

export default (mongoose.models.Device as mongoose.Model<IDevice>) ||
  mongoose.model<IDevice>("Device", DeviceSchema);