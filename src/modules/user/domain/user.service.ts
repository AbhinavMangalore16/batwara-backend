import { UserPGRepository } from '../repos/user.pg.repo';
import { RegisterUserDTO } from '../dtos/register-user.dto';

export class UserService {
  constructor(private userRepo: UserPGRepository) {}

  async register(data: RegisterUserDTO) {
    // 1. Check if user exists (call this.userRepo.findByEmail)
    // 2. If yes, throw error
    // 3. Hash password (keep it simple or pseudo-code for now)
    // 4. Create user (call this.userRepo.create)
    // 5. Return the result (excluding password!)
  }
}