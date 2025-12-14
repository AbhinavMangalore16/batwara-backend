const User = {
  name: { type: 'string', required: true },
  email: { type: 'string', unique: true },
};

export default User;
