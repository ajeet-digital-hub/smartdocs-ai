import mongoose, { Schema, Document, Model, models } from "mongoose";

export interface IPolicy extends Document {
  familyId: mongoose.Types.ObjectId;
  childId?: mongoose.Types.ObjectId;
  type: "website" | "app";
  target: string;
  action: "block" | "allow";
  dailyLimitMinutes?: number;
  scheduleIds?: mongoose.Types.ObjectId[];
  createdAt: Date;
}

const PolicySchema = new Schema<IPolicy>(
  {
    familyId: { type: Schema.Types.ObjectId, ref: "Family", required: true, index: true },
    childId: { type: Schema.Types.ObjectId, ref: "Child" },
    type: { type: String, enum: ["website", "app"], required: true },
    target: { type: String, required: true },
    action: { type: String, enum: ["block", "allow"], required: true },
    dailyLimitMinutes: Number,
    scheduleIds: [{ type: Schema.Types.ObjectId, ref: "Schedule" }],
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

PolicySchema.index({ familyId: 1, childId: 1, target: 1 });

const Policy: Model<IPolicy> =
  (models.Policy as Model<IPolicy>) || mongoose.model<IPolicy>("Policy", PolicySchema);

export default Policy;

