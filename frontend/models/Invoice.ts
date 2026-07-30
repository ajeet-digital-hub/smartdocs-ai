import mongoose, { Document, Model, Schema } from "mongoose";

export type InvoiceStatus = "draft" | "open" | "paid" | "uncollectible" | "void";

export interface IInvoice extends Document {
  userId: mongoose.Types.ObjectId;
  subscriptionId: mongoose.Types.ObjectId;
  invoiceNumber: string;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  dueDate?: Date;
  paidAt?: Date;
  pdfUrl?: string; // URL to the generated PDF invoice from payment provider
  createdAt: Date;
}

const InvoiceSchema = new Schema<IInvoice>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    subscriptionId: { type: Schema.Types.ObjectId, ref: "Subscription", required: true, index: true },
    invoiceNumber: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true, default: "INR" },
    status: { type: String, enum: ["draft", "open", "paid", "uncollectible", "void"], default: "paid" },
    dueDate: { type: Date },
    paidAt: { type: Date },
    pdfUrl: { type: String },
  },
  { timestamps: true }
);

const Invoice: Model<IInvoice> = (mongoose.models.Invoice as Model<IInvoice>) || mongoose.model<IInvoice>("Invoice", InvoiceSchema);

export default Invoice;