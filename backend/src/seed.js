import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { query } from './db.js';
dotenv.config();

async function run(){
  const roles = (await query('SELECT name,id FROM roles')).rows.reduce((m,r)=> (m[r.name]=r.id, m), {});
  async function upsert(email, password, role, display_name){
    const hash = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS||'10'));
    await query(
      `INSERT INTO users(email,password_hash,role_id,display_name,is_active)
       VALUES ($1,$2,$3,$4,true)
       ON CONFLICT (email) DO NOTHING`,
      [email, hash, roles[role], display_name]
    );
  }
  await upsert('admin@siglad.test','Admin123*','ADMIN','Administrador');
  await upsert('agente@siglad.test','Agente123*','AGENTE','Agente Aduanero');
  await upsert('juan.perez@siglad.test','Transportista123*','TRANSPORTISTA','Juan Pérez');
  await upsert('auditor@siglad.test','Auditor123*','AUDITOR','Auditoría');

  console.log('Seed listo');
  process.exit(0);
}
run().catch(e=>{ console.error(e); process.exit(1); });
