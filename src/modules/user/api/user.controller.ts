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

  async addFriend(req: Request, res: Response) {
    try {
      const id:string | undefined = res.locals.id;
      if(id){
        const responseObject = await this.userService.addFriend(id,Schemas.AddFriendSchema.parse(req.body).friendId);
        const result = Schemas.AddFriendResponseSchema.parse(responseObject);
        return res.status(201).json(result);
      }
      else return res.status(404).json({message: "ID not found in header"})
    } catch (error) {
      return res.status(400).json({error: error})
    }
  }

  async searchFriend(req: Request, res: Response){
    try{
      const id: string | undefined = res.locals.id;
      if(id){
        const friendsList = await this.userService.searchFriend(id);
        return res.status(200).json({friends: friendsList});
      }
      else{
        return res.status(404).json({message: "ID not found in header"});
      }
    }
    catch(error){
      return res.status(400).json({error: error})
    }
  }

  async searchUsers(req: Request, res: Response){
    try{
      const nameQuery = req.query.name;
      if(!nameQuery || typeof nameQuery !== 'string'){
        return res.status(400).json({message: 'Missing or invalid name query parameter'});
      }
      const users = await this.userService.searchUsers(nameQuery);
      return res.status(200).json({ users });
    }
    catch(error){
      return res.status(400).json({error: error})
    }
  }

}