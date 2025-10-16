import { query } from '../db.js';
import bcrypt from 'bcrypt';

export async function listUsers(req,res){
  const { rows } = await query('SELECT u.id, u.email, u.display_name, u.is_active, r.name as role FROM users u JOIN roles r ON r.id=u.role_id ORDER BY u.id');
  res.json(rows);
}

export async function createUser(req,res){
  const { email, password, role, display_name, is_active=true } = req.body;
  try{
    const roleRow = await query('SELECT id FROM roles WHERE name=$1', [role]);
    if(!roleRow.rowCount) return res.status(400).json({error:'Rol inválido'});
    const hash = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS||'10'));
    await query('INSERT INTO users(email, password_hash, role_id, display_name, is_active) VALUES ($1,$2,$3,$4,$5)',
      [email, hash, roleRow.rows[0].id, display_name, is_active]);
    await query('INSERT INTO bitacora_usuarios(usuario, ip_origen, operacion, resultado) VALUES ($1,$2,$3,$4)',
      [req.user.email, req.ip, 'Usuario creado', 'Éxito']);
    res.status(201).json({message:'Usuario creado exitosamente'});
  }catch(e){
    await query('INSERT INTO bitacora_usuarios(usuario, ip_origen, operacion, resultado) VALUES ($1,$2,$3,$4)',
      [req.user.email, req.ip, 'Usuario creado', 'Fallo']);
    if(e.code=='23505') return res.status(409).json({error:'Correo ya registrado'});
    res.status(500).json({error:'Error de servidor'});
  }
}

export async function updateUser(req,res){
  const { id } = req.params;
  const { email, display_name, is_active, role } = req.body;
  try{
    let roleId = null;
    if(role){
      const r = await query('SELECT id FROM roles WHERE name=$1',[role]);
      if(!r.rowCount) return res.status(400).json({error:'Rol inválido'});
      roleId = r.rows[0].id;
    }
    await query(
      'UPDATE users SET email=COALESCE($1,email), display_name=COALESCE($2,display_name), is_active=COALESCE($3,is_active), role_id=COALESCE($4,role_id) WHERE id=$5',
      [email || null, display_name || null, (is_active==null? null : !!is_active), roleId, id]
    );

    // Si se envía una nueva contraseña, hashearla y actualizar password_hash
    if(req.body.password){
      const hash = await bcrypt.hash(req.body.password, parseInt(process.env.BCRYPT_ROUNDS||'10'));
      await query('UPDATE users SET password_hash=$1 WHERE id=$2', [hash, id]);
    }
    await query('INSERT INTO bitacora_usuarios(usuario, ip_origen, operacion, resultado) VALUES ($1,$2,$3,$4)',
      [req.user.email, req.ip, 'Usuario actualizado', 'Éxito']);
    res.json({message:'Actualizado'});
  }catch(e){
    if(e.code=='23505') return res.status(409).json({error:'Correo ya registrado'});
    res.status(500).json({error:'Error de servidor'});
  }
}
