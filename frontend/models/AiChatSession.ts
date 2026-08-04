import mongoose, { Document, Model, Schema } from "mongoose";

export interface IChatMessage {
  role: "user" | "assistant";
  content: string;
  citations?: {
    pageNumber: number;
    documentId: string; // Storing as string for simplicity
    chunkId: string;
  }[];
  createdAt: Date;
}

export interface IAiChatSession extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  documentIds: mongoose.Types.ObjectId[]; // References to original file uploads
  messages: IChatMessage[];
  pendingPlan?: any; // Stores an incomplete execution plan for follow-up questions
  createdAt: Date;
  updatedAt: Date;
}

const AiChatSessionSchema = new Schema<IAiChatSession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, default: "New Chat" },
    documentIds: [{ type: Schema.Types.ObjectId, ref: "File" }], // Assuming a generic 'File' model for uploads
    messages: [{ type: Schema.Types.Mixed }], // Storing IChatMessage objects
    pendingPlan: { type: Schema.Types.Mixed, default: null },
  },
  { timestamps: true }
);

const AiChatSession: Model<IAiChatSession> = (mongoose.models.AiChatSession as Model<IAiChatSession>) || mongoose.model<IAiChatSession>("AiChatSession", AiChatSessionSchema);

export default AiChatSession;