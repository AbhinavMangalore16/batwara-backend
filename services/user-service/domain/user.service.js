import neode from '../../../src/db/test-enode.js';

/**
 * Create a new user
 */
export async function createUser(data) {
  // Validate required fields
  if (!data.name || !data.email) {
    const err = new Error("Name and Email are required");
    err.name = "ERROR_VALIDATION";
    throw err;
  }

  // Check for uniqueness
  const existing = await neode.first("User", "email", data.email);
  if (existing) {
    const err = new Error("Email already exists");
    err.name = "ERROR_VALIDATION";
    throw err;
  }

  // Create user in Neo4j
  const user = await neode.create("User", {
    name: data.name,
    email: data.email,
  });

  return user;
}

/**
 * Get single user by id (UUID)
 */
export async function getUser(id) {
  return await neode.first("User", "uuid", id);
}

/**
 * Get all users
 */
export async function getAllUsers() {
  return await neode.all("User");
}

/**
 * Update user by id
 */
export async function updateUser(id, data) {
  const user = await neode.first("User", "uuid", id);
  if (!user) return null;

  if (data.name) user.set("name", data.name);
  if (data.email) {
    // check uniqueness
    const existing = await neode.first("User", "email", data.email);
    if (existing && existing.id() !== id) {
      const err = new Error("Email already exists");
      err.name = "ERROR_VALIDATION";
      throw err;
    }
    user.set("email", data.email);
  }

  await user.save();
  return user;
}

/**
 * Delete user by id
 */
export async function deleteUser(id) {
  const user = await neode.first("User", "uuid", id);
  if (!user) return null;

  await user.delete();
  return true;
}

