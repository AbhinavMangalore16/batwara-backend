import { Request, Response } from 'express';
import { UserService } from '../domain/user.service';

export class UserController {
  constructor(private userService: UserService) {}

  async getUserDetails(req: Request, res: Response) {
    try {
      const email:string | undefined = req.header("email");
      if(email){
        const result = this.userService.getUserProfile(email);
        return res.status(201).json({message: "User details sent.",result})
      }
      // 1. Extract body (req.body)
      // 2. Call service (this.userService.register)
      // 3. Send success response (res.status(201).json(...))
    } catch (error) {
      return res.status(400).json({error: error})
      // 4. Handle errors (res.status(400).json(...))
    }
  }
}