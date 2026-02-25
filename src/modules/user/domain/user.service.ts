import { UserPGRepository } from '../repos/user.repo';
import type { dtoTypes } from '../dtos/index';

export class UserService {
  constructor(private userRepo: UserPGRepository) {}

  async getUserProfile(email:string) {
    const res = await this.userRepo.findByEmail(email);
    return (res?res:null);
  }

  async checkUserExists(email:string) {
    const res = await this.userRepo.findByEmail(email);
    return (res?res:null);
  }

  async patchUserProfile(id:string,patchUserObject:dtoTypes["PatchUserDTO"]) {
    const res = await this.userRepo.updateUserDetail(id,patchUserObject);
    return res;
  }

  async makeFriendRequest(id:string,friendId:string) {
    const res = await this.userRepo.makeFriendRequest(id,friendId);
    return res;
  }

  async acceptFriendRequest(id:string,friendId:string,accepted:boolean) {
    const res = await this.userRepo.acceptFriendRequest(id,friendId,accepted);
    return res;
  }
}