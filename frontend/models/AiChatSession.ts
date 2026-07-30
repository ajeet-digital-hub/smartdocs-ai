import mongoose, { Document, Model, Schema } from "mongoose";

export interface IChatMessage {
  role: "user" | "assistant";
  content: string;
  citations?: {
    pageNumber: number;
    documentId: mongoose.Types.ObjectId;
    documentName: string;
  }[];
  createdAt: Date;
}

export interface IAiChatSession extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  documentIds: mongoose.Types.ObjectId[]; // References to original file uploads
  messages: IChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const AiChatSessionSchema = new Schema<IAiChatSession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, default: "New Chat" },
    documentIds: [{ type: Schema.Types.ObjectId, ref: "File" }], // Assuming a generic 'File' model for uploads
    messages: [{ type: Schema.Types.Mixed }], // Storing IChatMessage objects
  },
  { timestamps: true }
);

const AiChatSession: Model<IAiChatSession> = (mongoose.models.AiChatSession as Model<IAiChatSession>) || mongoose.model<IAiChatSession>("AiChatSession", AiChatSessionSchema);

export default AiChatSession;