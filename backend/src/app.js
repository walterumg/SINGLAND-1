import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/users.routes.js';
import ducaRoutes from './routes/duca.routes.js';
import decRoutes from './routes/declaraciones.routes.js';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req,res)=>res.json({ok:true}));
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', userRoutes);
app.use('/api/duca', ducaRoutes);
app.use('/api', decRoutes);

export default app;
