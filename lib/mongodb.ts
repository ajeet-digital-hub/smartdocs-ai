import { MongoClient } from "mongodb"

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

const uri = process.env.MONGODB_URI
if (!uri) {
  throw new Error("MONGODB_URI is not set in .env.local")
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

// Use global caching in all environments to prevent connection storms
if (!globalThis._mongoClientPromise) {
  client = new MongoClient(uri)
  globalThis._mongoClientPromise = client.connect()
}
clientPromise = globalThis._mongoClientPromise

export default clientPromise
