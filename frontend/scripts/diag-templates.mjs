import mongoose from "mongoose";
import { config } from "dotenv";
config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;

async function run() {
  await mongoose.connect(MONGODB_URI, { bufferCommands: false });
  const col = mongoose.connection.collection("templates");

  const plans = await col
    .aggregate([{ $group: { _id: "$requiredPlan", count: { $sum: 1 } } }])
    .toArray();
  console.log("requiredPlan distribution:", JSON.stringify(plans));

  const cats = await col
    .aggregate([
      { $match: { status: "PUBLISHED" } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ])
    .toArray();
  console.log("Category counts (PUBLISHED):");
  cats.forEach((c) => console.log(" ", c._id, c.count));

  const total = await col.countDocuments({});
  const published = await col.countDocuments({ status: "PUBLISHED" });
  console.log("Total:", total, "Published:", published);

  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
