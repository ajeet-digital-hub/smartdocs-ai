import mongoose, { Mongoose } from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}

interface MongooseCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

declare global {
  // allow global `var` declarations
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache;
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect(): Promise<Mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };
    const dbName = MONGODB_URI ? (new URL(MONGODB_URI).pathname.substring(1) || process.env.MONGODB_DB_NAME || '(Not Set)') : '(Not Set)';
    console.log(`[dbConnect] MONGODB_URI exists: ${!!MONGODB_URI}`);
    console.log(`[dbConnect] Attempting to connect to MongoDB... DB: ${dbName}`);
    try {
      cached.promise = mongoose.connect(MONGODB_URI!, opts);
      cached.conn = await cached.promise;
      console.log("MongoDB (Mongoose) connection successful.");
    } catch (error: any) {
      console.error("MongoDB (Mongoose) connection failed:", {
        type: "MongoDB Connection Failure",
        stage: "Mongoose Connect",
        message: error.message,
        name: error.name,
        stack: error.stack,
      });
      cached.promise = null; // Reset promise to retry on next call
      throw error; // Re-throw the error to propagate it
    }
  }
  return cached.conn!;
}

export default dbConnect;