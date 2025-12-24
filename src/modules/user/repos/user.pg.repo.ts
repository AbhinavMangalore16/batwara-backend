import { db } from '../../../shared/infra/db/postgres/postgres-client.config.js'; // Import your DB client
import type { UserResponseDTO } from '../dtos/user-response.dto.js';
import { UserResponseSchema } from '../dtos/user-response.dto.js';
import type { PatchUserDTO } from '../dtos/patch-user.dto';
import { PatchUserSchema } from '../dtos/patch-user.dto.js';
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

  async updateUserDetail(id:string,patchUserObject:PatchUserDTO): Promise<UserResponseDTO|null>{
    const res = await db.
    update(user).
    set(PatchUserSchema.parse(patchUserObject)).
    where(eq(user.id,id));
    return null;
  }

}