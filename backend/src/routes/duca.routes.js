import { Router } from 'express';
import { recepcion } from '../controllers/duca.controller.js';
import { authRequired } from '../utils/auth.js';
const r = Router();
r.post('/recepcion', authRequired, recepcion);
export default r;
