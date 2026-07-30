import mongoose, { Document, Model, models, Schema } from "mongoose";
import { SubscriptionStatus } from "./Subscription";

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
  onboardingCompleted?: boolean;
  phoneNumber?: string;
  countryCode?: string;
  currentSubscription?: mongoose.Types.ObjectId; // Reference to the active subscription
  subscriptionStatus?: SubscriptionStatus; // Denormalized status for quick access
  planExpiry?: Date; // Denormalized expiry date
}

const UserSchema: Schema = new Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String },
    passwordHash: { type: String },
    image: { type: String },
    provider: { type: String, default: "credentials" },
    emailVerified: { type: Date, default: null },
    verificationToken: { type: String },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    hasSeenWelcome: { type: Boolean, default: false, required: true },
    onboardingCompleted: { type: Boolean, default: false },
    phoneNumber: { type: String, sparse: true, unique: true },
    countryCode: { type: String }, // Reference to the active subscription
    currentSubscription: { type: Schema.Types.ObjectId, ref: "Subscription", index: true },
    subscriptionStatus: { type: String, enum: ["ACTIVE", "PENDING", "EXPIRED", "CANCELLED", "TRIALING", "PAST_DUE"] },
    planExpiry: { type: Date },
  },
  { timestamps: true }
);

const User: Model<IUser> = models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
