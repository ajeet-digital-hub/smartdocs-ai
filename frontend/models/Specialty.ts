import mongoose, { Document, Model, Schema } from "mongoose";

export interface ISpecialty extends Document {
  name: string;
  description?: string;
  icon?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SpecialtySchema = new Schema<ISpecialty>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, trim: true },
    icon: { type: String }, // e.g., an emoji or URL to an icon
  },
  { timestamps: true }
);

SpecialtySchema.index({ name: 1 });

const Specialty: Model<ISpecialty> =
  (mongoose.models.Specialty as Model<ISpecialty>) || mongoose.model<ISpecialty>("Specialty", SpecialtySchema);

export default Specialty;