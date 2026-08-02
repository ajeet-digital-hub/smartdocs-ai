import mongoose, { Document as MongooseDocument, Model, Schema } from "mongoose";

export interface IExtractedText extends MongooseDocument {
  documentId: mongoose.Types.ObjectId; // Reference to StoredDocument
  pages: Array<{
    pageNumber: number;
    text: string;
  }>;
  createdAt: Date;
}

const ExtractedTextSchema = new Schema<IExtractedText>({
  documentId: {
    type: Schema.Types.ObjectId,
    ref: "StoredDocument",
    required: true,
    unique: true, // One extracted text record per document
  },
  pages: [
    {
      pageNumber: { type: Number, required: true },
      text: { type: String, required: true },
    },
  ],
}, { timestamps: true });

const ExtractedText: Model<IExtractedText> = (mongoose.models.ExtractedText as Model<IExtractedText>) || mongoose.model<IExtractedText>("ExtractedText", ExtractedTextSchema);
export default ExtractedText;