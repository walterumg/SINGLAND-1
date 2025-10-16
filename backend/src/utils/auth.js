import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
const SECRET = process.env.JWT_SECRET || 'dev';

export function signToken(payload){
  return jwt.sign(payload, SECRET, { expiresIn: process.env.JWT_EXPIRES || '2h' });
}
export function authRequired(req,res,next){
  const hdr = req.headers.authorization || '';
  const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : null;
  if(!token) return res.status(401).json({error:'Token requerido'});
  try{
    req.user = jwt.verify(token, SECRET);
    next();
  }catch(e){
    return res.status(401).json({error:'Token inválido'});
  }
}
export function requireRole(...roles){
  return (req,res,next)=>{
    if(!req.user) return res.status(401).json({error:'No autenticado'});
    if(!roles.includes(req.user.role)) return res.status(403).json({error:'No autorizado'});
    next();
  }
}
