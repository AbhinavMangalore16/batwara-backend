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
userRouter.get('/me',authMiddleware, (req:Request,res:Response) => {
    return userController.getUserDetails(req, res)
})

userRouter.patch('/me',authMiddleware, (req:Request,res:Response) => {
    return userController.patchUserDetails(req, res)
})

userRouter.get('/check',authMiddleware, (req:Request,res:Response) => {
    return userController.getUserDetails(req, res)
})

userRouter.post('/add',authMiddleware, (req:Request,res:Response) => {
    return userController.addFriend(req, res)
})

userRouter.get('/friends', authMiddleware, (req: Request, res: Response) => {
    return userController.searchFriend(req, res);
});

export default userRouter;