import { UserPGRepository } from '../repos/user.pg.repo';
import type { UserResponseDTO } from '../dtos/user-response.dto.js';
import type { PatchUserDTO } from '../dtos/patch-user.dto';

export class UserService {
  constructor(private userRepo: UserPGRepository) {}

  async getUserProfile(email:string):Promise<UserResponseDTO|null> {
    const res = await this.userRepo.findByEmail(email);
    return (res?res:null);
  }

  async patchUserProfile(id:string,patchUserObject:PatchUserDTO):Promise<UserResponseDTO|null> {
    const res = await this.userRepo.updateUserDetail(id,patchUserObject);
    return null;
  }
}