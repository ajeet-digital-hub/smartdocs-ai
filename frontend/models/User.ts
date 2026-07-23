import mongoose, { Document, Model, Schema } from "mongoose"

export interface IUser extends Document {
  fullName: string
  email?: string
  countryCode?: string
  phoneNumber?: string
  passwordHash: string
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: false, lowercase: true, trim: true, unique: true, sparse: true },
    countryCode: { type: String, required: false, trim: true },
    phoneNumber: { type: String, required: false, trim: true, unique: true, sparse: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true },
)

const User = (mongoose.models.User as Model<IUser>) || mongoose.model<IUser>("User", UserSchema)

export default User
