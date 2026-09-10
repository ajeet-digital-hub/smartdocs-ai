import mongoose, { Document, Model, Schema } from "mongoose";

export interface IScheduleBlock {
  startTime: string;
  endTime: string;
  daysOfWeek: string[];
}

export interface ITemporaryUnlock {
  expiresAt: Date;
  reason: string;
}

export interface IAppPolicy extends Document {
  childId: mongoose.Types.ObjectId;
  familyId: mongoose.Types.ObjectId;
  appId: string;
  appName: string;
  appPackage: string;
  appStoreId?: string;
  category: string;
  icon?: string;
  isBlocked: boolean;
  isAllowed: boolean;
  dailyLimitMinutes?: number;
  scheduleBlocks: IScheduleBlock[];
  temporaryUnlock?: ITemporaryUnlock;
  policyVersion: number;
  createdAt: Date;
  updatedAt: Date;
}

const ScheduleBlockSchema = new Schema<IScheduleBlock>(
  {
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    daysOfWeek: [{ type: String, enum: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] }],
  },
  { _id: false }
);

const TemporaryUnlockSchema = new Schema<ITemporaryUnlock>(
  {
    expiresAt: { type: Date, required: true },
    reason: { type: String, required: true },
  },
  { _id: false }
);

const AppPolicySchema = new Schema<IAppPolicy>(
  {
    childId: { type: Schema.Types.ObjectId, ref: "Child", required: true, index: true },
    familyId: { type: Schema.Types.ObjectId, ref: "Family", required: true, index: true },
    appId: { type: String, required: true },
    appName: { type: String, required: true, trim: true },
    appPackage: { type: String, required: true, trim: true },
    appStoreId: { type: String },
    category: { type: String, required: true },
    icon: { type: String },
    isBlocked: { type: Boolean, default: false },
    isAllowed: { type: Boolean, default: true },
    dailyLimitMinutes: { type: Number },
    scheduleBlocks: [ScheduleBlockSchema],
    temporaryUnlock: { type: TemporaryUnlockSchema },
    policyVersion: { type: Number, default: 1 },
  },
  { timestamps: true }
);

AppPolicySchema.index({ childId: 1, appId: 1 }, { unique: true });
AppPolicySchema.index({ childId: 1, appPackage: 1 });
AppPolicySchema.index({ familyId: 1, isBlocked: 1 });
AppPolicySchema.index({ childId: 1, policyVersion: 1 });

const AppPolicy: Model<IAppPolicy> =
  (mongoose.models.AppPolicy as Model<IAppPolicy>) ||
  mongoose.model<IAppPolicy>("AppPolicy", AppPolicySchema);

export default AppPolicy;

