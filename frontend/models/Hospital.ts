import mongoose, { Document, Model, Schema } from "mongoose";

export interface IHospital extends Document {
  name: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  location: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  overallRating: number;
  totalReviews: number;
  emergencyService: boolean;
  icuAvailable: boolean;
  ambulanceService: boolean;
  pharmacy: boolean;
  parking: boolean;
  insuranceAccepted: string[]; // e.g., ["Apollo", "Max Bupa"]
  photos: string[]; // URLs to photos
  openingHours: string; // e.g., "24/7" or "Mon-Fri 9AM-5PM"
  specialties: mongoose.Types.ObjectId[]; // References to Specialty model
  createdAt: Date;
  updatedAt: Date;
}

const HospitalSchema = new Schema<IHospital>(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    pinCode: { type: String, required: true, trim: true },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true, index: "2dsphere" }, // [longitude, latitude]
    },
    overallRating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0, min: 0 },
    emergencyService: { type: Boolean, default: false },
    icuAvailable: { type: Boolean, default: false },
    ambulanceService: { type: Boolean, default: false },
    pharmacy: { type: Boolean, default: false },
    parking: { type: Boolean, default: false },
    insuranceAccepted: [{ type: String }],
    photos: [{ type: String }],
    openingHours: { type: String, default: "24/7" },
    specialties: [{ type: Schema.Types.ObjectId, ref: "Specialty" }],
  },
  { timestamps: true }
);

HospitalSchema.index({ name: 1 });
HospitalSchema.index({ city: 1, state: 1 });
HospitalSchema.index({ specialties: 1 });

const Hospital: Model<IHospital> =
  (mongoose.models.Hospital as Model<IHospital>) || mongoose.model<IHospital>("Hospital", HospitalSchema);

export default Hospital;