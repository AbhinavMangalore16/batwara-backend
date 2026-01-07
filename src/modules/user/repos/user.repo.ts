import { db } from '../../../shared/infra/db/postgres/postgres-client.config.js'; // Import your DB client
import { graph } from '../../../shared/infra/db/neo4j/neo4j-client.config.js
import type { dtoTypes } from '../dtos/index';
import { Schemas } from '../dtos/index';
import { user } from './auth.schema.js';
import { eq } from "drizzle-orm"

export class UserPGRepository {
  async findByEmail(email: string){
    const res = await db.
    select().
    from(user).
    where(eq(user.email,email));
    return res[0]?res[0]:null;
  }

  async updateUserDetail(id:string,patchUserObject:dtoTypes["PatchUserDTO"]){
    const res = await db.
    update(user).
    set(Schemas.PatchUserSchema.parse(patchUserObject)).
    where(eq(user.id,id));
    return null;
  }

  async addFriend(id:string,friendId:string){
    const driver = graph();
    let { records, summary } = await driver.executeQuery(`
						MATCH (p:Person)-[r:FRIENDS_WITH]-(n:Person)
            FILTER p.id:$userId,n.id:$friendId`,
						{ userId:id,
              friendId:friendId
             }
					)
    if(!records){
      await driver.executeQuery(`
						CREATE (p:Person)-[r:FRIENDS_WITH]-(n:Person)
            FILTER p.id:$userId,n.id:$friendId`,
						{ userId:id,
              friendId:friendId
             }
					)
    }
    const res = await db.
    update(user).
    set(Schemas.PatchUserSchema.parse(patchUserObject)).
    where(eq(user.id,id));
    return null;
  }

}