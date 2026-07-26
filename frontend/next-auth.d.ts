import { DefaultSession, DefaultUser } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      fullName?: string | null;
      hasSeenWelcome?: boolean;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    fullName?: string | null;
    hasSeenWelcome?: boolean;
  }
}

