import { db } from '../../../shared/infra/db/postgres/postgres-client.config.js'; // Import your DB client
import { graph } from '../../../shared/infra/db/neo4j/neo4j-client.config.js';
import type { dtoTypes } from '../dtos/index';
import { Schemas } from '../dtos/index';
import { user } from './auth.schema.js';
import { eq, ilike, inArray } from "drizzle-orm"

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

  async addFriend(userId: string, friendId: string){
    //TODO-> add behind an event such that handshake happens
    if (userId===friendId){
      throw new Error("User cannot add themeselves as friend!");
    }
    const driver = graph();
    const result = await driver.executeQuery(
      `
      MATCH (p: Person {id: $userId})
      MATCH (f: Person {id: $friendId})
      MERGE (p)-[:FRIENDS_WITH{ owes:0 }]->(f)
      RETURN p,f
      `,{
        userId, friendId
      }
    )
    if (result.records.length===0){
      throw new Error("One or both users not found!");
    }
    return {
      "message":"success"
    }
  }
  async searchFriends(userId: string) {
    const driver = graph();

    const result = await driver.executeQuery(
      `
      MATCH (p:Person {id:$userId})-[:FRIENDS_WITH]-(f:Person)
      RETURN f.id AS id
      `,
      { userId }
    );

    const friendIds = result.records.map((r) => r.get("id"));

    if (friendIds.length === 0) {
      return [];
    }

    const friends = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image
      })
      .from(user)
      .where(inArray(user.id, friendIds));

    return friends;
  }

  async findByName(email: string){
  const result = await db
    .select()
    .from(user)
    .where(ilike(user.email, `%${email}%`))
    .limit(20);

  return result;
  
}
  async getUsersByIds(ids: string[]) {
      return await db
          .select({
          id: user.id,
          name: user.name,
          })
          .from(user)
          .where(inArray(user.id, ids));
  }
}