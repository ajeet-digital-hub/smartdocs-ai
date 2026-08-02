import mongoose, { Document as MongooseDocument, Model, Schema } from "mongoose";

export interface IDocumentChunk extends MongooseDocument {
  documentId: mongoose.Types.ObjectId; // Reference to StoredDocument
  pageNumber: number;
  chunkIndex: number;
  text: string;
  embedding?: number[]; // Store embeddings directly for now
  createdAt: Date;
}

const DocumentChunkSchema = new Schema<IDocumentChunk>({
  documentId: {
    type: Schema.Types.ObjectId,
    ref: "StoredDocument",
    required: true,
    index: true,
  },
  pageNumber: { type: Number, required: true, min: 1 },
  chunkIndex: { type: Number, required: true, min: 0 },
  text: { type: String, required: true },
  embedding: {
    type: [Number], // Array of numbers
    required: false, // Not all chunks might have embeddings immediately
    // index: '2dsphere' or 'text' or custom for vector search if using MongoDB's capabilities
  },
}, { timestamps: true });

// Compound index for efficient retrieval of chunks for a specific document and page
DocumentChunkSchema.index({ documentId: 1, pageNumber: 1, chunkIndex: 1 });

const DocumentChunk: Model<IDocumentChunk> = (mongoose.models.DocumentChunk as Model<IDocumentChunk>) || mongoose.model<IDocumentChunk>("DocumentChunk", DocumentChunkSchema);
export default DocumentChunk;