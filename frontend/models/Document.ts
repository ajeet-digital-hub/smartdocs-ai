import mongoose, { Document as MongooseDocument, Model, Schema } from "mongoose";

export type DocumentStatus = "UPLOADED" | "PROCESSING" | "PROCESSED" | "FAILED";

export interface IStoredDocument extends MongooseDocument {
  userId: mongoose.Types.ObjectId;
  originalName: string;
  storageKey: string;
  mimeType: string;
  size: number;
  storageProvider: string;
  status: DocumentStatus;
  pageCount?: number;
  extractedTextAvailable?: boolean;
  extractedTextId?: mongoose.Types.ObjectId; // Reference to extracted text data
  processedAt?: Date;
  processingError?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema = new Schema<IStoredDocument>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  originalName: { type: String, required: true, trim: true },
  storageKey: { type: String, required: true, unique: true },
  mimeType: { type: String, required: true },
  size: { type: Number, required: true, min: 0 },
  storageProvider: { type: String, required: true, default: "backblaze" },
  status: { type: String, enum: ["UPLOADED", "PROCESSING", "READY", "FAILED"], default: "UPLOADED" },
  pageCount: { type: Number, required: true, default: 0, min: 0 },
  extractedTextAvailable: { type: Boolean, required: true, default: false },
  extractedTextId: { type: Schema.Types.ObjectId, ref: "ExtractedText" }, // Reference to ExtractedText model
  processedAt: { type: Date },
  processingError: { type: String },
}, { timestamps: true });

DocumentSchema.index({ userId: 1, createdAt: -1 });
const StoredDocument: Model<IStoredDocument> = (mongoose.models.StoredDocument as Model<IStoredDocument>) || mongoose.model<IStoredDocument>("StoredDocument", DocumentSchema);
export default StoredDocument;
