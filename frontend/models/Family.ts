import mongoose, { Schema, Document, Model, models } from "mongoose";

export interface IFamily extends Document {
  parentId: mongoose.Types.ObjectId;
  name: string;
  createdAt: Date;
  members: {
    userId: mongoose.Types.ObjectId;
    role: "parent" | "child";
    childId?: mongoose.Types.ObjectId;
  }[];
}

const FamilySchema = new Schema<IFamily>(
  {
    parentId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, default: "My Family" },
    members: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User" },
        role: { type: String, enum: ["parent", "child"] },
        childId: { type: Schema.Types.ObjectId, ref: "Child" },
      },
    ],
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const Family: Model<IFamily> =
  (models.Family as Model<IFamily>) || mongoose.model<IFamily>("Family", FamilySchema);

export default Family;

