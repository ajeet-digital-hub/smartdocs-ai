import mongoose, { Document, Model, Schema } from "mongoose";

export interface IReview extends Document {
  entityType: "hospital" | "doctor";
  entityId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId; // Reference to the User who wrote the review
  rating: number; // 1-5 stars
  comment: string;
  verifiedPatient: boolean;
  helpfulVotes: number;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    entityType: { type: String, enum: ["hospital", "doctor"], required: true },
    entityId: { type: Schema.Types.ObjectId, required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true },
    verifiedPatient: { type: Boolean, default: false },
    helpfulVotes: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

ReviewSchema.index({ entityId: 1, createdAt: -1 });

const Review: Model<IReview> =
  (mongoose.models.Review as Model<IReview>) || mongoose.model<IReview>("Review", ReviewSchema);

export default Review;