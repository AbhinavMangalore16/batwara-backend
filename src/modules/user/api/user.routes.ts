import { Router } from 'express';
import { UserController } from './user.controller';
import { UserService } from '../domain/user.service';
import { UserPGRepository } from '../repos/user.repo';
import { authMiddleware } from '../../../shared/infra/auth/better-auth.middleware';
import type {Request,Response} from 'express'

const userRouter = Router();

const userRepo = new UserPGRepository();
const userService = new UserService(userRepo);
const userController = new UserController(userService);

// Define the route
userRouter.get('/me',authMiddleware, (req:Request,res:Response) => { //get my own details
    return userController.getUserDetails(req, res)
})

userRouter.patch('/me',authMiddleware, (req:Request,res:Response) => { //update my info
    return userController.patchUserDetails(req, res)
})

userRouter.get('/check',authMiddleware, (req:Request,res:Response) => {  //check user exists on email(friend search)
    return userController.checkUserExists(req, res)
})

userRouter.post('/add',authMiddleware, (req:Request,res:Response) => {  //add a new friend node edge
    return userController.addFriend(req, res)
})

export default userRouter;