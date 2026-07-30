import mongoose, { Document, Model, Schema } from "mongoose"

export interface IFamily extends Document {
  parentId: mongoose.Types.ObjectId
  familyName: string
  subscriptionId?: mongoose.Types.ObjectId; // Reference to FamilySubscription
  maxChildren: number
  maxDevices: number
  createdAt: Date
  updatedAt: Date
}

const FamilySchema = new Schema<IFamily>(
  {
    parentId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true, unique: true },
    familyName: { type: String, required: true, trim: true },
    subscriptionId: { type: Schema.Types.ObjectId, ref: "FamilySubscription" },
    maxChildren: { type: Number, default: 5 },
    maxDevices: { type: Number, default: 10 },
  },
  { timestamps: true }
)

const Family = (mongoose.models.Family as Model<IFamily>) || mongoose.model<IFamily>("Family", FamilySchema)

export default Family
