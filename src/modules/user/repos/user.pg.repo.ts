import { db } from '../../../shared/infra/db/postgres/postgres-client.config.js'; // Import your DB client
import type { UserResponseDTO } from '../dtos/user-response.dto.js';
import { UserResponseSchema } from '../dtos/user-response.dto.js';
import { user } from './auth.schema';
import { eq } from "drizzle-orm"

export class UserPGRepository {
  async findByEmail(email: string): Promise<UserResponseDTO|null> {
    const res = await db.
    select().
    from(user).
    where(eq(user.email,email));
    return res[0]?UserResponseSchema.parse(res[0]):null;
  }

}