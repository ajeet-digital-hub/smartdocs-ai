import { MongoClient, MongoClientOptions } from "mongodb"

const globalForMongo = globalThis as typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClient>
}

let clientPromise: Promise<MongoClient> | null = null

export function getMongoClient() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    throw new Error("Missing MONGODB_URI environment variable.")
  }

  const options: MongoClientOptions = {}

  // Only enable TLS for Atlas URIs (mongodb+srv://)
  if (uri.startsWith("mongodb+srv://")) {
    options.tls = true
  }

  if (process.env.NODE_ENV === "development") {
    console.log("Attempting to connect to MongoDB (MongoClient - Development)...");
    if (!globalForMongo._mongoClientPromise) {
      globalForMongo._mongoClientPromise = new MongoClient(uri, options).connect().catch((error: any) => {
        console.error("MongoDB (MongoClient) connection failed in development:", {
          type: "MongoDB Connection Failure",
          stage: "MongoClient Connect (Development)",
          message: error.message,
          name: error.name,
          stack: error.stack,
        });
        throw error;
      });
    }
    console.log("MongoDB (MongoClient) connection successful in development.");
    return globalForMongo._mongoClientPromise
  }

  // Reuse client in production to avoid duplicate connections
  if (!clientPromise) {
    console.log("Attempting to connect to MongoDB (MongoClient - Production)...");
    clientPromise = new MongoClient(uri, options).connect().catch((error: any) => {
      console.error("MongoDB (MongoClient) connection failed in production:", {
        type: "MongoDB Connection Failure",
        stage: "MongoClient Connect (Production)",
        message: error.message,
        name: error.name,
        stack: error.stack,
      });
      throw error;
    });
  }
  console.log("MongoDB (MongoClient) connection successful in production.");
  return clientPromise
}
