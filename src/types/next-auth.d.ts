// Extend next-auth types for custom session properties
import { DefaultSession } from "next-auth"

declare module "next-auth" {
    interface Session extends DefaultSession {
        accessToken?: string
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        accessToken?: string
    }
}
