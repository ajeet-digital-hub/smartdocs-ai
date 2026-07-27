import mongoose, { Document, Model, models, Schema } from "mongoose";

export interface IUser extends Document {
  fullName: string;
  email: string;
  password?: string;
  passwordHash?: string;
  image?: string;
  provider: string;
  emailVerified?: Date | null;
  verificationToken?: string | null;
  resetPasswordToken?: string | null;
  resetPasswordExpires?: Date | null;
  hasSeenWelcome?: boolean;
  phoneNumber?: string;
  countryCode?: string;
}

const UserSchema: Schema = new Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    passwordHash: { type: String },
    image: { type: String },
    provider: { type: String, default: "credentials" },
    emailVerified: { type: Date, default: null },
    verificationToken: { type: String },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    hasSeenWelcome: { type: Boolean, default: false },
    phoneNumber: { type: String },
    countryCode: { type: String },
  },
  { timestamps: true }
);

const User: Model<IUser> = models.User || mongoose.model<IUser>("User", UserSchema);

export default User;

