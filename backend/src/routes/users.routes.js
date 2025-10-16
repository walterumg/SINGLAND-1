import { Router } from 'express';
import { createUser, listUsers, updateUser } from '../controllers/users.controller.js';
import { authRequired, requireRole } from '../utils/auth.js';
const r = Router();
r.use(authRequired);
r.get('/', requireRole('ADMIN'), listUsers);
r.post('/', requireRole('ADMIN'), createUser);
r.patch('/:id', requireRole('ADMIN'), updateUser);
export default r;
