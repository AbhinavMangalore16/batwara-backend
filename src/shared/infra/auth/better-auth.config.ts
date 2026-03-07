import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db/postgres/postgres-client.config";
import { databaseHooks } from "./better-auth.database-hooks";

export const auth = betterAuth({
appName: "batwaara",

baseURL: process.env.BETTER_AUTH_URL,

database: drizzleAdapter(db, {
    provider: "pg",
}),

trustedOrigins: [
    "http://localhost:3000",
    "https://batwara-eosin.vercel.app",
],

emailAndPassword: {
    enabled: true,
},

advanced: {
    useSecureCookies: true,

    crossSubDomainCookies: {
    enabled: false,
    },

    cookies: {
    sessionToken: {
        attributes: {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        },
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