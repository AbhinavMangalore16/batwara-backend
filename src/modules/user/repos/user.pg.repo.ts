import { db } from '../../../shared/infra/db/postgres/postgres-client.config.js'; // Import your DB client
import type { dtoTypes } from '../dtos/index';
import { Schemas } from '../dtos/index';
import { user } from './auth.schema';
import { eq } from "drizzle-orm"

export class UserPGRepository {
  async findByEmail(email: string): Promise<dtoTypes["UserResponseDTO"]|null> {
    const res = await db.
    select().
    from(user).
    where(eq(user.email,email));
    return res[0]?Schemas.UserResponseSchema.parse(res[0]):null;
  }

  async updateUserDetail(id:string,patchUserObject:dtoTypes["PatchUserDTO"]): Promise<dtoTypes["UserResponseDTO"]|null>{
    const res = await db.
    update(user).
    set(Schemas.PatchUserSchema.parse(patchUserObject)).
    where(eq(user.id,id));
    return null;
  }

}