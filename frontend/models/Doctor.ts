import mongoose, { Document, Model, Schema } from "mongoose";

export interface IDoctor extends Document {
  name: string;
  specialties: mongoose.Types.ObjectId[]; // References to Specialty model
  qualifications: string[];
  experienceYears: number;
  hospitalAffiliations: mongoose.Types.ObjectId[]; // References to Hospital model
  consultationFee: number;
  languagesSpoken: string[];
  availableTimings: string; // e.g., "Mon-Fri 9AM-5PM"
  onlineConsultation: boolean;
  inPersonConsultation: boolean;
  overallRating: number;
  totalReviews: number;
  verifiedBadge: boolean;
  location: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  createdAt: Date;
  updatedAt: Date;
}

const DoctorSchema = new Schema<IDoctor>(
  {
    name: { type: String, required: true, trim: true },
    specialties: [{ type: Schema.Types.ObjectId, ref: "Specialty", required: true }],
    qualifications: [{ type: String }],
    experienceYears: { type: Number, default: 0, min: 0 },
    hospitalAffiliations: [{ type: Schema.Types.ObjectId, ref: "Hospital" }],
    consultationFee: { type: Number, default: 0, min: 0 },
    languagesSpoken: [{ type: String }],
    availableTimings: { type: String },
    onlineConsultation: { type: Boolean, default: false },
    inPersonConsultation: { type: Boolean, default: true },
    overallRating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0, min: 0 },
    verifiedBadge: { type: Boolean, default: false },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], index: "2dsphere" }, // [longitude, latitude]
    },
  },
  { timestamps: true }
);

DoctorSchema.index({ name: 1 });
DoctorSchema.index({ specialties: 1 });
DoctorSchema.index({ hospitalAffiliations: 1 });

const Doctor: Model<IDoctor> =
  (mongoose.models.Doctor as Model<IDoctor>) || mongoose.model<IDoctor>("Doctor", DoctorSchema);

export default Doctor;