import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import AppleProvider from "next-auth/providers/apple";
import User from "@/models/User"; // Assuming User model is used for credentials
import bcrypt from "bcrypt";
import dbConnect from "@/lib/dbConnect"; // Import the dbConnect utility

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    AppleProvider({
      clientId: process.env.APPLE_ID!,
      clientSecret: process.env.APPLE_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          // Check if there is an existing connection before creating a new one
          try {
            await dbConnect();
            console.log("[Authorize] DB connection successful.");
          } catch (dbError: any) {
            console.error("DB Connection Error in authOptions (authorize):", {
              type: "MongoDB Connection Failure",
              stage: "NextAuth Authorize",
              message: dbError.message,
            });
            return null; // Cannot authorize without database connection
          }

          if (!credentials?.email || !credentials.password) return null;

          console.log(`[Authorize] Looking up user in 'users' collection with email: ${credentials.email}`);
          const user = await User.findOne({ email: credentials.email.toLowerCase().trim() }).select('+passwordHash');
          
          if (!user) {
            console.log("[Authorize] User lookup result: User not found.");
            return null;
          }
          console.log(`[Authorize] User lookup result: Found user with ID: ${user._id}`);
          
          if (!user.passwordHash) {
            console.log("[Authorize] passwordHash exists: false. User may have registered via social login.");
            return null;
          }
          console.log("[Authorize] passwordHash exists: true.");

          const isPasswordCorrect = await bcrypt.compare(credentials.password, user.passwordHash);
          console.log(`[Authorize] bcrypt.compare() result: ${isPasswordCorrect}`);
          if (!isPasswordCorrect) {
            console.log("[Authorize] Password comparison failed.");
            return null;
          }
          
          console.log("[Authorize] Authorization successful. Returning user object to NextAuth.");

          return {
            id: user._id.toString(),
            email: user.email,
            fullName: user.fullName,
            name: user.fullName,
            image: user.image,
            emailVerified: user.emailVerified,
            hasSeenWelcome: user.hasSeenWelcome,
          };
        } catch (error) {
          console.error("AUTHORIZE ERROR:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      console.log(`[NextAuth JWT Callback] Trigger: ${trigger}`);
      if (user) {
        token.id = user.id;
        token.fullName = user.fullName;
        token.picture = user.image;
        token.emailVerified = (user as any).emailVerified;
        token.hasSeenWelcome = (user as any).hasSeenWelcome;
      }
      if (trigger === "update" && session) {
        if (session.fullName !== undefined) token.fullName = session.fullName;
        if (session.image !== undefined) token.picture = session.image;
        if (session.hasSeenWelcome !== undefined) token.hasSeenWelcome = session.hasSeenWelcome;
      }
      return token;
    },
    async session({ session, token }) {
      console.log("[NextAuth Session Callback] Populating session with token data.");
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).fullName = token.fullName as string;
        (session.user as any).image = token.picture as string;
        (session.user as any).emailVerified = token.emailVerified as Date | null;
        (session.user as any).hasSeenWelcome = token.hasSeenWelcome as boolean;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  debug: process.env.NODE_ENV === "development",
};
