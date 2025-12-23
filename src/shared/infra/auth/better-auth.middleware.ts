import { Router } from 'express'
import type {Request,Response,NextFunction} from 'express'
import { auth } from "./better-auth.config";

export const authMiddleware = async(req:Request,res:Response,next:NextFunction)=>{
    const session = await auth.api.getSession({headers: {cookie:req.headers.cookie ?? ""}});
    if(session){
        res.locals.email = session.user.email;
        next();
    }
    else res.status(404).json({message:"daravne h bhoot teri maa ki choot"})
}
