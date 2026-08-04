import mongoose, { Document as MongooseDocument, Model, Schema } from "mongoose";

export interface IUserDesign extends MongooseDocument {
  userId: mongoose.Types.ObjectId;
  templateId?: mongoose.Types.ObjectId;
  name: string;
  width: number;
  height: number;
  layers: Record<string, unknown>[];
  fonts: string[];
  metadata: Record<string, unknown>;
  thumbnail?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserDesignSchema = new Schema<IUserDesign>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    templateId: { type: Schema.Types.ObjectId, ref: "Template", index: true },
    name: { type: String, required: true, trim: true },
    width: { type: Number, required: true, default: 800 },
    height: { type: Number, required: true, default: 600 },
    layers: { type: [{ type: Schema.Types.Mixed }], default: [] },
    fonts: { type: [String], default: [] },
    metadata: { type: Schema.Types.Mixed, default: {} },
    thumbnail: { type: String, default: "" },
  },
  { timestamps: true }
);

UserDesignSchema.index({ userId: 1, updatedAt: -1 });

const UserDesign: Model<IUserDesign> =
  (mongoose.models.UserDesign as Model<IUserDesign>) ||
  mongoose.model<IUserDesign>("UserDesign", UserDesignSchema);

export default UserDesign;
