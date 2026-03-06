import { Router } from 'express'
import type {Request,Response,NextFunction} from 'express'
import { auth } from "./better-auth.config";

export const authMiddleware = async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const token = req.headers["auth_token"] as string | undefined;
        const session = await auth.api.getSession({
        headers: {
            cookie: req.headers.cookie ?? "",
            auth_token: token ?? "",
        },
        });
        if (!session) return res.status(401).json({ message: "Unauthorized" });
        res.locals.email = session.user.email;
        res.locals.id = session.user.id;
        next();
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Auth service unavailable!" });
    }
}
