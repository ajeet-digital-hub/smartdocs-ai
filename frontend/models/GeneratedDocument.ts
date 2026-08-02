import mongoose, { Document as MongooseDocument, Model, Schema } from "mongoose";

export type ConversionType = "pdf_to_txt" | "pdf_to_docx" | "pdf_to_xlsx";

export interface IGeneratedDocument extends MongooseDocument {
  userId: mongoose.Types.ObjectId;
  originalDocumentId: mongoose.Types.ObjectId;
  conversionType: ConversionType;
  storageKey: string;
  originalName: string;
  mimeType: string;
  size: number;
  createdAt: Date;
}

const GeneratedDocumentSchema = new Schema<IGeneratedDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    originalDocumentId: {
      type: Schema.Types.ObjectId,
      ref: "StoredDocument",
      required: true,
      index: true,
    },
    conversionType: {
      type: String,
      enum: ["pdf_to_txt", "pdf_to_docx", "pdf_to_xlsx"],
      required: true,
    },
    storageKey: {
      type: String,
      required: true,
      unique: true,
    },
    originalName: {
      type: String,
      required: true,
      trim: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true }
);

GeneratedDocumentSchema.index({ userId: 1, createdAt: -1 });
GeneratedDocumentSchema.index({ originalDocumentId: 1, conversionType: 1 });

const GeneratedDocument: Model<IGeneratedDocument> =
  (mongoose.models.GeneratedDocument as Model<IGeneratedDocument>) ||
  mongoose.model<IGeneratedDocument>("GeneratedDocument", GeneratedDocumentSchema);

export default GeneratedDocument;
