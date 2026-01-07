import { UserPGRepository } from '../repos/user.repo';
import type { dtoTypes } from '../dtos/index';

export class UserService {
  constructor(private userRepo: UserPGRepository) {}

  async getUserProfile(email:string) {
    const res = await this.userRepo.findByEmail(email);
    return (res?res:null);
  }

  async checkUserExists(email:string):Promise<string|null> {
    const res = await this.userRepo.findByEmail(email);
    return (res?res.id:null);
  }

  async patchUserProfile(id:string,patchUserObject:dtoTypes["PatchUserDTO"]) {
    const res = await this.userRepo.updateUserDetail(id,patchUserObject);
    return res;
  }
}