import mongoose, { Document, Model, Schema } from "mongoose"

export interface IChild extends Document {
  familyId: mongoose.Types.ObjectId
  name: string
  avatar?: string
  age: number
  dateOfBirth?: Date
  screenTimeLimitDaily: number // minutes
  studyGoalDaily: number // minutes
  points: number;
  achievements: string[];
  studyStreak: number;
  status: "active" | "paused" | "sleeping"
  createdAt: Date
  updatedAt: Date
}

const ChildSchema = new Schema<IChild>(
  {
    familyId: { type: Schema.Types.ObjectId, ref: "Family", required: true, index: true },
    name: { type: String, required: true, trim: true },
    avatar: { type: String, default: "" },
    age: { type: Number, required: true, min: 0, max: 18 },
    dateOfBirth: { type: Date },
    screenTimeLimitDaily: { type: Number, default: 120 },
    studyGoalDaily: { type: Number, default: 60 },
    points: { type: Number, default: 0 },
    achievements: [{ type: String }],
    studyStreak: { type: Number, default: 0 },
    status: { type: String, enum: ["active", "paused", "sleeping"], default: "active" },
  },
  { timestamps: true }
)

ChildSchema.index({ familyId: 1, name: 1 })

const Child = (mongoose.models.Child as Model<IChild>) || mongoose.model<IChild>("Child", ChildSchema)

export default Child
