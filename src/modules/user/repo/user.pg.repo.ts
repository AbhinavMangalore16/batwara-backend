import { db } from '../../../shared/infra/db/postgres-client'; // Import your DB client
import { RegisterUserDTO } from '../dtos/register-user.dto';

export class UserPGRepository {
  // Method to check if email exists
  async findByEmail(email: string): Promise<any | null> {
    // TODO: Use db.select()...
    return null; 
  }

  // Method to save a new user
  async create(data: RegisterUserDTO): Promise<any> {
    // TODO: Use db.insert()...
    return {};
  }
}