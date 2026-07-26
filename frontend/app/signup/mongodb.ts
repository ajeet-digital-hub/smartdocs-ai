import { MongoClient } from "mongodb"

declare global {
  // eslint-disable-next-line no-var
  var _signupMongoClientPromise: Promise<MongoClient> | undefined
}

export default async function getSignupClientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    throw new Error("Missing MONGODB_URI environment variable. Set it in .env.local.")
  }

  if (process.env.NODE_ENV === "development") {
    if (!globalThis._signupMongoClientPromise) {
      const client = new MongoClient(uri)
      globalThis._signupMongoClientPromise = client.connect()
    }
    return globalThis._signupMongoClientPromise
  } else {
    const client = new MongoClient(uri)
    return client.connect()
  }
}

export async function getSignupDb() {
  const client = await getSignupClientPromise()
  return client.db(process.env.MONGODB_DB_NAME || "smartdocs-ai")
}
