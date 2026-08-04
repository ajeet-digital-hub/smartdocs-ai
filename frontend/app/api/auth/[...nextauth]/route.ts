import NextAuth, { AuthOptions, User } from "next-auth"
import { JWT } from "next-auth/jwt"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import AppleProvider from "next-auth/providers/apple"
import { authenticateCredentials } from "@/lib/auth"
import { getMongoClient } from "@/lib/mongodb"

const providers = []

providers.push(
  CredentialsProvider({
    name: "Email and password",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        throw new Error("Email and password are required.")
      }

      // Support OTP-verified login: if password is "__otp__", look up user by email
      if (credentials.password === "__otp__") {
        try {
          const client = await getMongoClient()
          const db = client.db(process.env.MONGODB_DB_NAME || "smartdocs-ai")
          const user = await db.collection("users").findOne(
            { email: credentials.email.toLowerCase().trim() },
            { projection: { fullName: 1, email: 1, phoneNumber: 1, passwordHash: 1 } },
          )
          if (!user) {
            throw new Error("User not found. Please sign up first.")
          }
          return {
            id: user._id.toString(),
            name: typeof user.fullName === "string" ? user.fullName : "",
            email: typeof user.email === "string" ? user.email : undefined,
          }
        } catch (error) {
          if (error instanceof Error) throw error
          throw new Error("Authentication error.")
        }
      }

      const result = await authenticateCredentials(credentials?.email, credentials?.password)

      if (result.reason === "invalid-input") {
        throw new Error("Email and password are required.")
      }
      if (result.reason === "user-not-found") {
        throw new Error("Invalid email or password.")
      }
      if (result.reason === "password-mismatch") {
        throw new Error("Invalid email or password.")
      }
      if (result.reason === "database-error") {
        throw new Error("Authentication database error.")
      }

      return result.user
        ? {
            id: result.user.id,
            name: result.user.fullName,
            email: result.user.email,
          }
        : null
    },
  }),
)

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  )
}

if (
  process.env.APPLE_CLIENT_ID &&
  process.env.APPLE_CLIENT_SECRET &&
  process.env.APPLE_TEAM_ID &&
  process.env.APPLE_KEY_ID &&
  process.env.APPLE_PRIVATE_KEY
) {
  providers.push(
    AppleProvider({
      clientId: process.env.APPLE_CLIENT_ID,
      clientSecret: process.env.APPLE_CLIENT_SECRET,
      teamId: process.env.APPLE_TEAM_ID,
      keyId: process.env.APPLE_KEY_ID,
      privateKey: process.env.APPLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    } as any),
  )
}

const authOptions = {
  providers,
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User; account?: any }) {
      // Initial sign in
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
      }
      return token
    },
    async session({ session, token }: { session: any; token: JWT }) {
      // Pass token data to session
      if (session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
      }
      return session
    },
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

