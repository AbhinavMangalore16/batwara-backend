import {
  createUser,
  getUser,
  getAllUsers,
  updateUser,
  deleteUser
} from '../domain/user.service.js';

export async function createUserController(req, res) {
  try {
    const user = await createUser(req.body);
    res.json({ success: true, data: user.properties() });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
}

export async function getUserController(req, res) {
  const user = await getUser(req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });

  res.json({ success: true, data: user.properties() });
}

export async function getAllUsersController(req, res) {
  const users = await getAllUsers();
  res.json({
    success: true,
    data: users.map(u => u.properties())
  });
}

export async function updateUserController(req, res) {
  const user = await updateUser(req.params.id, req.body);
  if (!user) return res.status(404).json({ error: "User not found" });

  res.json({ success: true, data: user.properties() });
}

export async function deleteUserController(req, res) {
  const deleted = await deleteUser(req.params.id);
  if (!deleted) return res.status(404).json({ error: "User not found" });

  res.json({ success: true, message: "User deleted" });
}
