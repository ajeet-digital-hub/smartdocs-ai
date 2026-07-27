import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/authOptions"

export const getSession = () => getServerSession(authOptions);