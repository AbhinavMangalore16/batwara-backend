import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db/postgres/postgres-client.config";
import { databaseHooks } from "./better-auth.database-hooks";

const trustedOrigins = [
    "http://localhost:3000",
    "https://batwara-eosin.vercel.app",
    ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
].filter(Boolean);

const isProd = process.env.NODE_ENV === "production";

export const auth = betterAuth({
appName: "batwaara",

baseURL: process.env.BETTER_AUTH_URL,

database: drizzleAdapter(db, {
    provider: "pg",
}),

trustedOrigins,

emailAndPassword: {
    enabled: true,
},

advanced: {
    useSecureCookies: true,

    crossSubDomainCookies: {
    enabled: false,
    },
},

cookies: {
    sessionToken: {
      attributes: {
        sameSite: "none",   // 🔥 CRITICAL FIX
        secure: true,       // required with SameSite=None
        httpOnly: true,
      },
    },
  },

databaseHooks,

socialProviders: {
    github: {
    clientId: process.env.GITHUB_CLIENT_ID as string,
    clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
},
});