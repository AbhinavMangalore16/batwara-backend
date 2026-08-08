import type { Request, Response, NextFunction } from 'express';
import { db } from '../db/postgres/postgres-client.config';
import { user as userTable } from '../db/postgres/drizzle.schema';
import { eq } from 'drizzle-orm';
import { auth as betterAuthInstance } from "./better-auth.config";

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // 1. Try Clerk authentication ONLY if Clerk secret key is set
        if (process.env.CLERK_SECRET_KEY) {
            try {
                const clerkAuth = (req as any).auth;
                if (clerkAuth && clerkAuth.userId) {
                    const userId = clerkAuth.userId;
                    
                    const existingUser = await db.select().from(userTable).where(eq(userTable.id, userId)).limit(1);
                    if (!existingUser[0]) {
                        const newEmail = (clerkAuth.sessionClaims as any)?.email || `${userId}@clerk.user`;
                        const newName = "Clerk User";
                        
                        try {
                            await db.insert(userTable).values({
                                id: userId,
                                email: newEmail,
                                name: newName,
                                emailVerified: true,
                                createdAt: new Date(),
                                updatedAt: new Date(),
                            });
                        } catch (e) {
                            console.error("Error inserting Clerk user:", e);
                        }
                    }

                    res.locals.id = userId;
                    res.locals.email = (clerkAuth.sessionClaims as any)?.email || existingUser[0]?.email || `${userId}@clerk.user`;
                    return next();
                }
            } catch (e) {
                // Safe fallback if Clerk auth fails
            }
        }

        // 2. Fallback to Better Auth token/session
        const token = (req.headers["auth_token"] || req.headers["authorization"]?.replace("Bearer ", "")) as string | undefined;

        let session = null;
        try {
            session = await betterAuthInstance.api.getSession({
                headers: req.headers
            });
        } catch (e) {
            // Invalid session cookie
        }

        if (!session && token) {
            try {
                session = await betterAuthInstance.api.getSession({
                    headers: {
                        cookie: `better-auth.session_token=${token}`,
                        authorization: `Bearer ${token}`
                    }
                });
            } catch (e) {
                // Invalid token
            }
        }

        if (!session) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        res.locals.email = session.user.email;
        res.locals.id = session.user.id;
        return next();
    } catch (err) {
        console.error("authMiddleware error:", err);
        return res.status(500).json({ message: "Auth service unavailable!" });
    }
};
