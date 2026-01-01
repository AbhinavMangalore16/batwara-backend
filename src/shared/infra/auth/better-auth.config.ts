import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db/postgres/postgres-client.config"; // your drizzle instance
import { databaseHooks } from "./better-auth.database-hooks";
// import { hooks } from "./better-auth.hooks";

export const auth = betterAuth({
    appName: "batwaara",
    database: drizzleAdapter(db, {
        provider: "pg", // or "mysql", "sqlite"
    }),
    trustedOrigins: ["http://localhost:3000", "https://localhost:8000", process.env.FRONTEND_URL || ""],
    emailAndPassword: { 
        enabled: true, 
    }, 
    databaseHooks,
    //hooks,
    socialProviders: { 
        github: { 
            clientId: process.env.GITHUB_CLIENT_ID as string, 
            clientSecret: process.env.GITHUB_CLIENT_SECRET as string, 
        }, 
    }, 
});