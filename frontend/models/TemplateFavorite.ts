import mongoose, { Document as MongooseDocument, Model, Schema } from "mongoose";

export interface ITemplateFavorite extends MongooseDocument {
  userId: mongoose.Types.ObjectId;
  templateId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TemplateFavoriteSchema = new Schema<ITemplateFavorite>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    templateId: { type: Schema.Types.ObjectId, ref: "Template", required: true, index: true },
  },
  { timestamps: true }
);

// A user can favorite a template only once.
TemplateFavoriteSchema.index({ userId: 1, templateId: 1 }, { unique: true });
// Query pattern: all favorites for a user
TemplateFavoriteSchema.index({ userId: 1, createdAt: -1 });

const TemplateFavorite: Model<ITemplateFavorite> =
  (mongoose.models.TemplateFavorite as Model<ITemplateFavorite>) ||
  mongoose.model<ITemplateFavorite>("TemplateFavorite", TemplateFavoriteSchema);

export default TemplateFavorite;

