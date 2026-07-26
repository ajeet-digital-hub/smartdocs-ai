import mongoose, { Schema, Document, Model, models } from "mongoose";

export interface IChild extends Document {
  familyId: mongoose.Types.ObjectId;
  name: string;
  age: number;
  dateOfBirth?: Date;
  avatar?: string;
  points: number;
  studyStreak: number;
  currentStatus: "online" | "offline" | "studying" | "sleeping";
  createdAt: Date;
  settings?: {
    timezone?: string;
    dailyLimitMinutes?: number;
  };
}

const ChildSchema = new Schema<IChild>(
  {
    familyId: { type: Schema.Types.ObjectId, ref: "Family", required: true, index: true },
    name: { type: String, required: true },
    age: { type: Number, required: true, min: 1, max: 18 },
    dateOfBirth: Date,
    avatar: String,
    points: { type: Number, default: 0 },
    studyStreak: { type: Number, default: 0 },
    currentStatus: {
      type: String,
      enum: ["online", "offline", "studying", "sleeping"],
      default: "offline",
    },
    settings: {
      timezone: String,
      dailyLimitMinutes: Number,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

ChildSchema.index({ familyId: 1, name: 1 });

const Child: Model<IChild> =
  (models.Child as Model<IChild>) || mongoose.model<IChild>("Child", ChildSchema);

export default Child;


