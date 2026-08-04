import mongoose, { Document as MongooseDocument, Model, Schema } from "mongoose";
import { PlanId } from "@/lib/plan-config";

export type LayerType = "text" | "image" | "shape" | "background" | "logo" | "icon";

export interface ILayer {
  id: string;
  type: LayerType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  visible: boolean;
  locked: boolean;
  zIndex: number;
  props: Record<string, unknown>;
  style: Record<string, unknown>;
}

export type TemplateStatus = "DRAFT" | "PUBLISHED" | "UNPUBLISHED";

export type TemplateFileType = "PDF" | "DOCX" | "PPTX" | "XLSX" | "IMAGE" | "DESIGN";

export interface ITemplate extends MongooseDocument {
  templateId: string;
  name: string;
  slug: string;
  description: string;
  category: string; // stable slug, e.g. "resume"
  tags: string[];
  fileType: TemplateFileType;
  isPremium: boolean;
  isFeatured: boolean;
  isPopular: boolean;
  isNewArrival: boolean; // schema-level field (avoids Mongoose's reserved `isNew`)
  thumbnail: string;
  preview: string;
  width: number;
  height: number;
  layers: ILayer[];
  fonts: string[];
  defaultData: Record<string, unknown>;
  requiredPlan: PlanId;
  status: TemplateStatus;
  featured: boolean;
  author: string;
  usageCount: number;
  favoriteCount: number;
  useCount: number;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const LayerSchema = new Schema<ILayer>(
  {
    id: { type: String, required: true },
    type: {
      type: String,
      enum: ["text", "image", "shape", "background", "logo", "icon"],
      required: true,
    },
    x: { type: Number, required: true, default: 0 },
    y: { type: Number, required: true, default: 0 },
    width: { type: Number, required: true, default: 100 },
    height: { type: Number, required: true, default: 100 },
    rotation: { type: Number, default: 0 },
    opacity: { type: Number, default: 1, min: 0, max: 1 },
    visible: { type: Boolean, default: true },
    locked: { type: Boolean, default: false },
    zIndex: { type: Number, default: 0 },
    props: { type: Schema.Types.Mixed, default: {} },
    style: { type: Schema.Types.Mixed, default: {} },
  },
  { _id: false }
);

const TemplateSchema = new Schema<ITemplate>(
  {
    templateId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, default: "" },
    category: { type: String, required: true, index: true },
    tags: { type: [String], default: [], index: true },
    fileType: {
      type: String,
      enum: ["PDF", "DOCX", "PPTX", "XLSX", "IMAGE", "DESIGN"],
      default: "PDF",
    },
    isPremium: { type: Boolean, default: false, index: true },
    isFeatured: { type: Boolean, default: false, index: true },
    isPopular: { type: Boolean, default: false, index: true },
    isNewArrival: { type: Boolean, default: false, index: true },
    thumbnail: { type: String, default: "" },
    preview: { type: String, default: "" },
    width: { type: Number, required: true, default: 800 },
    height: { type: Number, required: true, default: 600 },
    layers: { type: [LayerSchema], default: [] },
    fonts: { type: [String], default: [] },
    defaultData: { type: Schema.Types.Mixed, default: {} },
    requiredPlan: {
      type: String,
      enum: ["free", "basic", "pro", "pro_plus", "enterprise"],
      default: "free",
    },
    status: {
      type: String,
      enum: ["DRAFT", "PUBLISHED", "UNPUBLISHED"],
      default: "PUBLISHED",
    },
    featured: { type: Boolean, default: false },
    author: { type: String, default: "SmartDocs AI" },
    usageCount: { type: Number, default: 0 },
    favoriteCount: { type: Number, default: 0 },
    useCount: { type: Number, default: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// ─── Indexes ──────────────────────────────────────────────────────────────
TemplateSchema.index({ category: 1, status: 1 });
TemplateSchema.index({ status: 1, isFeatured: -1, useCount: -1 });
TemplateSchema.index({ status: 1, useCount: -1 });
TemplateSchema.index({ status: 1, createdAt: -1 });
TemplateSchema.index({ status: 1, isPopular: -1 });
TemplateSchema.index({ status: 1, isNewArrival: -1 });
TemplateSchema.index({ tags: 1, status: 1 });
// Text index for fast title/description/category/tags search
TemplateSchema.index({ name: "text", description: "text", category: "text", tags: "text" });

const Template: Model<ITemplate> =
  (mongoose.models.Template as Model<ITemplate>) ||
  mongoose.model<ITemplate>("Template", TemplateSchema);

export default Template;

