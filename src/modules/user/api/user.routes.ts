// import { Router } from 'express';
// import { UserController } from './user.controller';
// import { UserService } from '../domain/user.service';
// import { UserPGRepository } from '../repos/user.pg.repo';

// const router = Router();

// // MANUAL DEPENDENCY INJECTION (The "Poor Man's" Container)
// // We instantiate everything here to wire them up.
// const userRepo = new UserPGRepository();
// const userService = new UserService(userRepo);
// const userController = new UserController(userService);

// // Define the route
// router.post('/register', (req, res) => userController.register(req, res));

// export default router;