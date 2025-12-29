import { UserPGRepository } from '../repos/user.repo';
import type { dtoTypes } from '../dtos/index';

export class UserService {
  constructor(private userRepo: UserPGRepository) {}

  async getUserProfile(email:string):Promise<dtoTypes["UserResponseDTO"]|null> {
    const res = await this.userRepo.findByEmail(email);
    return (res?res:null);
  }

  async patchUserProfile(id:string,patchUserObject:dtoTypes["PatchUserDTO"]):Promise<dtoTypes["UserResponseDTO"]|null> {
    const res = await this.userRepo.updateUserDetail(id,patchUserObject);
    return null;
  }
}