/**
 * SmartDocs AI — Template Seed Script
 *
 * Usage:
 *   cd frontend
 *   node -r dotenv/config scripts/seed-templates.mjs
 *
 * Prerequisites:
 *   - MONGODB_URI in .env.local
 *   - dotenv package installed (npm install dotenv --save-dev)
 *
 * This script:
 *   - Connects to MongoDB
 *   - Upserts templates from data/templates/seed-templates.mjs
 *   - Avoids duplicates (uses slug as unique key)
 *   - Creates indexes if missing
 *   - Reports inserted count, skipped count, and category breakdown
 */

import mongoose from "mongoose";
import { TEMPLATES, buildLayers } from "../data/templates/seed-templates.mjs";

// Load dotenv manually if direct .env.local not inherited
import { config } from "dotenv";
config({ path: "../.env.local" });
config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("ERROR: MONGODB_URI environment variable is not set.");
  console.error("Create a .env.local file with:");
  console.error("  MONGODB_URI=mongodb://localhost:27017/smartdocs-ai");
  process.exit(1);
}

async function seed() {
  console.log("📦 SmartDocs AI — Template Seed Script");
  console.log("========================================");
  console.log(`Connecting to MongoDB...`);
  console.log();

  const conn = await mongoose.connect(MONGODB_URI, {
    bufferCommands: false,
  });
  console.log(`✅ Connected: ${conn.connection.host}/${conn.connection.name}`);
  console.log();

  // ── Ensure the Template model is registered ──
  // We need to register the schema to match the TS model.
  // Since we're in a plain .mjs script, we use the same schema fields.
  const templateSchema = new mongoose.Schema(
    {
      templateId: { type: String, required: true, unique: true },
      name: { type: String, required: true },
      slug: { type: String, required: true, unique: true },
      description: { type: String, default: "" },
      category: { type: String, required: true },
      tags: { type: [String], default: [] },
      fileType: { type: String, enum: ["PDF", "DOCX", "PPTX", "XLSX", "IMAGE", "DESIGN"], default: "PDF" },
      isPremium: { type: Boolean, default: false },
      isFeatured: { type: Boolean, default: false },
      isPopular: { type: Boolean, default: false },
      isNewArrival: { type: Boolean, default: false },
      thumbnail: { type: String, default: "" },
      preview: { type: String, default: "" },
      width: { type: Number, default: 800 },
      height: { type: Number, default: 600 },
      layers: { type: [mongoose.Schema.Types.Mixed], default: [] },
      fonts: { type: [String], default: [] },
      defaultData: { type: mongoose.Schema.Types.Mixed, default: {} },
      requiredPlan: { type: String, enum: ["free", "basic", "pro", "pro_plus", "enterprise"], default: "free" },
      status: { type: String, enum: ["DRAFT", "PUBLISHED", "UNPUBLISHED"], default: "PUBLISHED" },
      featured: { type: Boolean, default: false },
      author: { type: String, default: "SmartDocs AI" },
      usageCount: { type: Number, default: 0 },
      favoriteCount: { type: Number, default: 0 },
      useCount: { type: Number, default: 0 },
      createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
    { timestamps: true }
  );

  // Indexes matching the TS model
  templateSchema.index({ category: 1, status: 1 });
  templateSchema.index({ status: 1, isFeatured: -1, useCount: -1 });
  templateSchema.index({ status: 1, useCount: -1 });
  templateSchema.index({ status: 1, createdAt: -1 });
  templateSchema.index({ status: 1, isPopular: -1 });
  templateSchema.index({ status: 1, isNewArrival: -1 });
  templateSchema.index({ tags: 1, status: 1 });
  templateSchema.index({ name: "text", description: "text", category: "text", tags: "text" });

  const TemplateModel = mongoose.models.Template
    ? mongoose.models.Template
    : mongoose.model("Template", templateSchema);

  // ── Ensure indexes ──
  try {
    await TemplateModel.createIndexes();
    console.log("✅ Indexes created/verified");
  } catch (err) {
    console.warn("⚠️  Index creation warning:", err.message);
  }
  console.log();

  // ── Upsert templates ──
  let inserted = 0;
  let skipped = 0;
  const categoryCounts = {};

  for (const tpl of TEMPLATES) {
    const existing = await TemplateModel.findOne({ slug: tpl.slug }).select("_id").lean();

    if (existing) {
      // Update existing template with new data
      await TemplateModel.updateOne({ _id: existing._id }, { $set: tpl });
      skipped++;
    } else {
      await TemplateModel.create(tpl);
      inserted++;
    }

    categoryCounts[tpl.category] = (categoryCounts[tpl.category] || 0) + 1;
  }

  // ── Report ──
  console.log("📊 Seed Report");
  console.log("----------------------------------------");
  console.log(`Total templates in catalog: ${TEMPLATES.length}`);
  console.log(`Inserted:                 ${inserted}`);
  console.log(`Updated/Skipped:          ${skipped}`);
  console.log(`Categories:               ${Object.keys(categoryCounts).length}`);
  console.log();

  console.log("📁 Category Breakdown:");
  const sorted = Object.entries(categoryCounts).sort(([, a], [, b]) => b - a);
  for (const [cat, count] of sorted) {
    console.log(`  ${cat.padEnd(20)} ${count}`);
  }
  console.log();

  // ── Verify ──
  const total = await TemplateModel.countDocuments({ status: "PUBLISHED" });
  console.log(`✅ Templates seed completed.`);
  console.log(`   Total PUBLISHED templates in DB: ${total}`);
  console.log();

  await mongoose.disconnect();
  console.log("🔌 Disconnected from MongoDB.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
