import mongoose, { Document, Model, Schema } from "mongoose";

export interface IUserStorage extends Document {
  userId: mongoose.Types.ObjectId;
  storageLimitGB: number;
  usedStorageBytes: number; // Stored in bytes for precision
  updatedAt: Date;
}

const UserStorageSchema = new Schema<IUserStorage>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    storageLimitGB: { type: Number, required: true, default: 0, min: 0 },
    usedStorageBytes: { type: Number, required: true, default: 0, min: 0 },
  },
  { timestamps: true }
);

const UserStorage: Model<IUserStorage> =
  (mongoose.models.UserStorage as Model<IUserStorage>) || mongoose.model<IUserStorage>("UserStorage", UserStorageSchema);

export default UserStorage;