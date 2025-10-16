import { query } from '../db.js';
import bcrypt from 'bcrypt';
import { signToken } from '../utils/auth.js';

export async function login(req,res){
  const { email, password } = req.body;
  const ip = req.ip;
  try{
    const { rows } = await query('SELECT u.*, r.name AS role_name FROM users u JOIN roles r ON r.id=u.role_id WHERE u.email=$1', [email]);
    if(!rows.length){
      await query('INSERT INTO bitacora_login(usuario, ip_origen, operacion, resultado) VALUES ($1, $2, $3, $4)',
        [email, ip, 'Login', 'Fallo']);
      return res.status(401).json({error:'Usuario o contraseña incorrecta'});
    }
    const u = rows[0];
    if(!u.is_active){
      await query('INSERT INTO bitacora_login(usuario, ip_origen, operacion, resultado) VALUES ($1, $2, $3, $4)',
        [email, ip, 'Login', 'Usuario inactivo']);
      return res.status(403).json({error:'Usuario deshabilitado'});
    }
    const ok = await bcrypt.compare(password, u.password_hash);
    if(!ok){
      await query('INSERT INTO bitacora_login(usuario, ip_origen, operacion, resultado) VALUES ($1, $2, $3, $4)',
        [email, ip, 'Login', 'Fallo']);
      return res.status(401).json({error:'Usuario o contraseña incorrecta'});
    }
    const token = signToken({ id:u.id, email:u.email, role:u.role_name, display_name:u.display_name });
    await query('INSERT INTO bitacora_login(usuario, ip_origen, operacion, resultado) VALUES ($1, $2, $3, $4)',
      [email, ip, 'Login', 'Éxito']);
    res.json({ token, role:u.role_name, display_name:u.display_name });
  }catch(err){
    console.error(err);
    res.status(500).json({error:'Error de servidor'});
  }
}
