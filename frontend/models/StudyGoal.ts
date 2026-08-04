import mongoose, { Document, Model, Schema } from "mongoose"

export type StudyGoalType = "time-based" | "task-based" | "quiz-based"
export type StudyGoalStatus = "active" | "completed" | "expired"

export interface IStudyGoal extends Document {
  familyId: mongoose.Types.ObjectId
  childId: mongoose.Types.ObjectId
  name: string
  description?: string
  type: StudyGoalType
  targetMinutes?: number
  targetTasks?: number
  targetQuizScore?: number
  completedMinutes: number
  completedTasks: number
  quizScore: number
  status: StudyGoalStatus
  rewardId?: mongoose.Types.ObjectId
  rewardMinutesEarned: number
  expiresAt?: Date
  completedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const StudyGoalSchema = new Schema<IStudyGoal>(
  {
    familyId: { type: Schema.Types.ObjectId, ref: "Family", required: true, index: true },
    childId: { type: Schema.Types.ObjectId, ref: "Child", required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    type: { type: String, enum: ["time-based", "task-based", "quiz-based"], required: true },
    targetMinutes: { type: Number, min: 0 },
    targetTasks: { type: Number, min: 0 },
    targetQuizScore: { type: Number, min: 0, max: 100 },
    completedMinutes: { type: Number, default: 0 },
    completedTasks: { type: Number, default: 0 },
    quizScore: { type: Number, default: 0 },
    status: { type: String, enum: ["active", "completed", "expired"], default: "active" },
    rewardId: { type: Schema.Types.ObjectId, ref: "Reward" },
    rewardMinutesEarned: { type: Number, default: 0 },
    expiresAt: { type: Date },
    completedAt: { type: Date },
  },
  { timestamps: true }
)

const StudyGoal = (mongoose.models.StudyGoal as Model<IStudyGoal>) ||
  mongoose.model<IStudyGoal>("StudyGoal", StudyGoalSchema)

export default StudyGoal

