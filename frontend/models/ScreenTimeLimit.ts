import mongoose, { Document, Model, Schema } from "mongoose"

export interface IScreenTimeLimit extends Document {
  familyId: mongoose.Types.ObjectId
  childId: mongoose.Types.ObjectId
  dailyTotalMinutes: number
  usedMinutes: number
  resetDate: Date
  lastResetAt: Date
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const ScreenTimeLimitSchema = new Schema<IScreenTimeLimit>(
  {
    familyId: { type: Schema.Types.ObjectId, ref: "Family", required: true, index: true },
    childId: { type: Schema.Types.ObjectId, ref: "Child", required: true, index: true, unique: true },
    dailyTotalMinutes: { type: Number, required: true, default: 120 },
    usedMinutes: { type: Number, default: 0 },
    resetDate: { type: Date, required: true },
    lastResetAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

const ScreenTimeLimit = (mongoose.models.ScreenTimeLimit as Model<IScreenTimeLimit>) ||
  mongoose.model<IScreenTimeLimit>("ScreenTimeLimit", ScreenTimeLimitSchema)

export default ScreenTimeLimit

