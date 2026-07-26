import mongoose, { Document, Model, Schema } from "mongoose";

export interface IDevice {
  name: string;
  type: "browser" | "android" | "ios" | "desktop";
  deviceId?: string;
  pairedAt?: Date;
  lastSeenAt?: Date;
  status: "online" | "offline" | "locked" | "unlocked";
}

export interface IChild extends Document {
  familyId: mongoose.Types.ObjectId;
  name: string;
  age: number;
  dateOfBirth?: Date;
  avatar?: string;
  devices: IDevice[];
  currentStatus: string;
  points: number;
  studyStreak: number;
  createdAt: Date;
  updatedAt: Date;
}

const DeviceSchema = new Schema<IDevice>(
  {
    name: { type: String, required: true },
    type: { type: String, enum: ["browser", "android", "ios", "desktop"], required: true },
    deviceId: { type: String },
    pairedAt: { type: Date },
    lastSeenAt: { type: Date },
    status: { type: String, enum: ["online", "offline", "locked", "unlocked"], default: "offline" },
  },
  { _id: false }
);

const ChildSchema = new Schema<IChild>(
  {
    familyId: { type: Schema.Types.ObjectId, ref: "Family", required: true, index: true },
    name: { type: String, required: true, trim: true },
    age: { type: Number, required: true, min: 1, max: 18 },
    dateOfBirth: { type: Date },
    avatar: { type: String },
    devices: [DeviceSchema],
    currentStatus: { type: String, default: "offline" },
    points: { type: Number, default: 0 },
    studyStreak: { type: Number, default: 0 },
  },
  { timestamps: true }
);

ChildSchema.index({ familyId: 1, name: 1 });

const Child: Model<IChild> =
  (mongoose.models.Child as Model<IChild>) ||
  mongoose.model<IChild>("Child", ChildSchema);

export default Child;

