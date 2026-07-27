import mongoose from "mongoose";

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI environment variable is not set.");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("Connected to MongoDB");

  const db = mongoose.connection.db;
  if (!db) {
    console.error("Database connection not established.");
    process.exit(1);
  }

  const collections = await db.listCollections().toArray();
  const collectionNames = collections.map((c) => c.name);

  // Ensure indexes for known collections
  const indexPromises: Promise<void>[] = [];

  if (collectionNames.includes("devices")) {
    indexPromises.push(
      mongoose.connection.collection("devices").createIndex({ clientTokenHash: 1 }).then(() => {
        console.log("Device index on clientTokenHash created");
      })
    );
  }

  if (collectionNames.includes("notifications")) {
    indexPromises.push(
      mongoose.connection
        .collection("notifications")
        .createIndex({ userId: 1, read: 1 })
        .then(() => {
          console.log("Notification index on userId + read created");
        })
    );
    indexPromises.push(
      mongoose.connection
        .collection("notifications")
        .createIndex({ userId: 1, createdAt: -1 })
        .then(() => {
          console.log("Notification index on userId + createdAt created");
        })
    );
  }

  if (collectionNames.includes("activitylogs")) {
    indexPromises.push(
      mongoose.connection
        .collection("activitylogs")
        .createIndex({ childId: 1, timestamp: -1 })
        .then(() => {
          console.log("ActivityLog index on childId + timestamp created");
        })
    );
    indexPromises.push(
      mongoose.connection
        .collection("activitylogs")
        .createIndex({ familyId: 1, createdAt: -1 })
        .then(() => {
          console.log("ActivityLog index on familyId + createdAt created");
        })
    );
  }

  if (collectionNames.includes("families")) {
    indexPromises.push(
      mongoose.connection
        .collection("families")
        .createIndex({ parentId: 1 })
        .then(() => {
          console.log("Family index on parentId created");
        })
    );
  }

  if (collectionNames.includes("children")) {
    indexPromises.push(
      mongoose.connection
        .collection("children")
        .createIndex({ familyId: 1, name: 1 })
        .then(() => {
          console.log("Child index on familyId + name created");
        })
    );
  }

  if (collectionNames.includes("unlockrequests")) {
    indexPromises.push(
      mongoose.connection
        .collection("unlockrequests")
        .createIndex({ familyId: 1, status: 1 })
        .then(() => {
          console.log("UnlockRequest index on familyId + status created");
        })
    );
  }

  await Promise.all(indexPromises);
  console.log("All indexes created successfully");
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((e) => {
  console.error("Migration failed:", e);
  process.exit(1);
});

