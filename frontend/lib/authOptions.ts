import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import AppleProvider from "next-auth/providers/apple";
import User from "@/models/User";
import bcrypt from "bcrypt";
import mongoose from "mongoose";

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
          if (mongoose.connection.readyState !== 1) {
            if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI not set");
            await mongoose.connect(process.env.MONGODB_URI, {
              serverSelectionTimeoutMS: 5000,
            });
          }

          if (!credentials?.email || !credentials.password) return null;

          const user = await User.findOne({ email: credentials.email.toLowerCase().trim() });
          if (!user || !user.passwordHash) return null;

          const isPasswordCorrect = await bcrypt.compare(credentials.password, user.passwordHash);
          if (!isPasswordCorrect) return null;

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
      if (session.user) {
        session.user.id = token.id as string;
        session.user.fullName = token.fullName as string;
        session.user.image = token.picture as string;
        session.user.emailVerified = token.emailVerified as Date | null;
        session.user.hasSeenWelcome = token.hasSeenWelcome as boolean;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  debug: process.env.NODE_ENV === "development",
};

