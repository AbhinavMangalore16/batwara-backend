import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db/postgres/postgres-client.config"; // your drizzle instance
import { databaseHooks } from "./better-auth.database-hooks";
// import { hooks } from "./better-auth.hooks";

    export const auth = betterAuth({
    appName: "batwaara",

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
        cookies: {
        sessionToken: {
            attributes: {
            sameSite: "none",
            secure: true,
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