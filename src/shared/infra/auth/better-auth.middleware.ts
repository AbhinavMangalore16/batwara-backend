import { Router } from 'express'
import type {Request,Response,NextFunction} from 'express'
import { auth } from "./better-auth.config";

export const authMiddleware = async(req:Request,res:Response,next:NextFunction)=>{
    try{
        const session = await auth.api.getSession({headers: {cookie:req.headers.cookie ?? ""}});
        if(session){
            res.locals.email = session.user.email;
            res.locals.id = session.user.id;
            next();
        }
        else res.status(401).json({message:"Unauthorized "})
    }
    catch(error){
        console.error('Session invalidated:', error);
        res.status(500).json({message: "Auth service unavailable!"})
    }
}
