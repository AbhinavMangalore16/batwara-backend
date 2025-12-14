import Neode from 'neode';
import dotenv from 'dotenv';
import User from '../../services/user-service/models/User.js';
dotenv.config();

const instance = new Neode(
  process.env.NEO4J_URI,
  process.env.NEO4J_USERNAME,
  process.env.NEO4J_PASSWORD
);
instance.model('User', User);
export default instance;
