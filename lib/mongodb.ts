import { MongoClient } from "mongodb"

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

function buildClientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error("MONGODB_URI is not set in .env.local")
  return new MongoClient(uri).connect()
}

let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === "development") {
  if (!globalThis._mongoClientPromise) {
    globalThis._mongoClientPromise = buildClientPromise()
  }
  clientPromise = globalThis._mongoClientPromise
} else {
  clientPromise = buildClientPromise()
}

export default clientPromise
