import { Request, Response } from 'express';
import { UserService } from '../domain/user.service';

export class UserController {
  constructor(private userService: UserService) {}

  async getUserDetails(req: Request, res: Response) {
    try {
      const email:string | undefined = res.locals.email;
      if(email){
        const result = await this.userService.getUserProfile(email);
        return res.status(201).json({message: "User details sent.",result});
      }
      else return res.status(404).json({message: "Email not provided in session header"})
    } catch (error) {
      return res.status(400).json({error: error})
    }
  }

  async patchUserDetails(req: Request, res: Response) {
    try {
      const id:string | undefined = res.locals.id;
      if(id){
        const result = await this.userService.patchUserProfile(id,req.body);
        return res.status(201).json({message: "User details updated"});
      }
      else return res.status(404).json({message: "ID not provided in session header"})
    } catch (error) {
      return res.status(400).json({error: error})
    }
  }
}