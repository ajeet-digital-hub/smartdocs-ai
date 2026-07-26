import mongoose, { Document, Model, Schema } from "mongoose";

export interface IFamily extends Document {
  parentId: mongoose.Types.ObjectId;
  name: string;
  pairingCode?: string;
  pairingCodeExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const FamilySchema = new Schema<IFamily>(
  {
    parentId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true, unique: true },
    name: { type: String, required: true, default: "My Family", trim: true },
    pairingCode: { type: String },
    pairingCodeExpires: { type: Date },
  },
  { timestamps: true }
);

FamilySchema.index({ pairingCode: 1 });

const FamilyModel: Model<IFamily> =
  (mongoose.models.Family as Model<IFamily>) ||
  mongoose.model<IFamily>("Family", FamilySchema);

export default FamilyModel;

