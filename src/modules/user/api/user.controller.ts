import { Request, Response } from 'express';
import { UserService } from '../domain/user.service';

export class UserController {
  constructor(private userService: UserService) {}

  // The actual function called when POST /register hits
  async register(req: Request, res: Response) {
    try {
      // 1. Extract body (req.body)
      // 2. Call service (this.userService.register)
      // 3. Send success response (res.status(201).json(...))
    } catch (error) {
      // 4. Handle errors (res.status(400).json(...))
    }
  }
}