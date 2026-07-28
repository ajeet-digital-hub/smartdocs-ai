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
    if (!globalForMongo._mongoClientPromise) {
      globalForMongo._mongoClientPromise = new MongoClient(uri, options).connect()
    }
    return globalForMongo._mongoClientPromise
  }

  // Reuse client in production to avoid duplicate connections
  if (!clientPromise) {
    clientPromise = new MongoClient(uri, options).connect()
  }
  return clientPromise
}
