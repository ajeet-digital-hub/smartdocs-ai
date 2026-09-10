import mongoose, { Document, Model, Schema } from "mongoose";

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
  deviceId: string;
  deviceName: string;
  platform: "android" | "ios" | "web";
  appVersion: string;
  status: "online" | "offline" | "pending";
  lastSeen: Date;
  deviceToken: string;
  fcmToken?: string;
  publicKey?: string;
  installedApps: IInstalledApp[];
  createdAt: Date;
  updatedAt: Date;
}

const InstalledAppSchema = new Schema<IInstalledApp>(
  {
    packageName: { type: String, required: true },
    appName: { type: String, required: true },
    version: { type: String, required: true },
    isDetected: { type: Boolean, default: true },
    lastDetected: { type: Date, default: Date.now },
  },
  { _id: false }
);

const DeviceSchema = new Schema<IDevice>(
  {
    childId: { type: Schema.Types.ObjectId, ref: "Child", required: true, index: true },
    familyId: { type: Schema.Types.ObjectId, ref: "Family", required: true, index: true },
    deviceId: { type: String, required: true },
    deviceName: { type: String, required: true, trim: true },
    platform: {
      type: String,
      enum: ["android", "ios", "web"],
      required: true,
    },
    appVersion: { type: String, default: "1.0.0" },
    status: {
      type: String,
      enum: ["online", "offline", "pending"],
      default: "pending",
    },
    lastSeen: { type: Date, default: Date.now },
    deviceToken: { type: String, required: true, unique: true },
    fcmToken: { type: String },
    publicKey: { type: String },
    installedApps: [InstalledAppSchema],
  },
  { timestamps: true }
);

DeviceSchema.index({ childId: 1, platform: 1 });
DeviceSchema.index({ familyId: 1, status: 1 });
DeviceSchema.index({ deviceToken: 1 }, { unique: true });
DeviceSchema.index({ "installedApps.packageName": 1 });

const Device: Model<IDevice> =
  (mongoose.models.Device as Model<IDevice>) ||
  mongoose.model<IDevice>("Device", DeviceSchema);

export default Device;

