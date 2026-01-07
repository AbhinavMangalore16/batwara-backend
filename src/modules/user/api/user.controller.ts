import { Request, Response } from 'express';
import { UserService } from '../domain/user.service';
import { Schemas } from '../dtos';

export class UserController {
  constructor(private userService: UserService) {}

  async getUserDetails(req: Request, res: Response) {
    try {
      const email:string | undefined = Schemas.SearchUserSchema.parse(res.locals).email;
      if(email){
        const responseObject = await this.userService.getUserProfile(email);
        const result = Schemas.GetUserResponseSchema.parse(responseObject);
        return res.status(201).json(result);
      }
      else return res.status(404).json({message: "Email not found in header"})
    } catch (error) {
      return res.status(400).json({error: error})
    }
  }

  async checkUserExists(req: Request, res: Response) {
    try {
      const email:string | undefined = Schemas.SearchUserSchema.parse(req.query).email;
      if(email){
        const responseObject = await this.userService.checkUserExists(email);
        const result = Schemas.SearchUserResponseSchema.parse(responseObject);
        return res.status(201).json(result);
      }
      else return res.status(404).json({message: "Email not provided in query parameter"})
    } catch (error) {
      return res.status(400).json({error: error})
    }
  }

  async patchUserDetails(req: Request, res: Response) {
    try {
      const id:string | undefined = res.locals.id;
      if(id){
        const responseObject = await this.userService.patchUserProfile(id,Schemas.PatchUserSchema.parse(req.body));
        const result = Schemas.PatchUserResponseSchema.parse(responseObject);
        return res.status(201).json(result);
      }
      else return res.status(404).json({message: "ID not found in header"})
    } catch (error) {
      return res.status(400).json({error: error})
    }
  }
}