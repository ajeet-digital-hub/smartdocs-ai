import mongoose, { Document, Model, Schema } from "mongoose";

export type JobStatus = "pending" | "processing" | "completed" | "failed";
export type FileType = "pdf" | "docx" | "txt" | "pptx" | "xlsx" | "html";

export interface ITranslationJob extends Document {
  userId: mongoose.Types.ObjectId;
  originalFileName: string;
  translatedFileName?: string;
  originalFileUrl: string; // URL to secure storage (e.g., S3)
  translatedFileUrl?: string;
  fileType: FileType;
  fileSize: number; // in bytes
  sourceLanguage: string; // e.g., "auto" or "en"
  targetLanguage: string; // e.g., "es"
  status: JobStatus;
  progress: number; // 0-100
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TranslationJobSchema = new Schema<ITranslationJob>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    originalFileName: { type: String, required: true },
    translatedFileName: { type: String },
    originalFileUrl: { type: String, required: true },
    translatedFileUrl: { type: String },
    fileType: { type: String, enum: ["pdf", "docx", "txt", "pptx", "xlsx", "html"], required: true },
    fileSize: { type: Number, required: true },
    sourceLanguage: { type: String, required: true },
    targetLanguage: { type: String, required: true },
    status: { type: String, enum: ["pending", "processing", "completed", "failed"], default: "pending" },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    errorMessage: { type: String },
  },
  { timestamps: true }
);

const TranslationJob: Model<ITranslationJob> = (mongoose.models.TranslationJob as Model<ITranslationJob>) || mongoose.model<ITranslationJob>("TranslationJob", TranslationJobSchema);

export default TranslationJob;