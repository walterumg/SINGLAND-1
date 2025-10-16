# SIGLAD – Sistema de Gestión de Declaraciones Aduaneras (v2)

Cambios incluidos:
- Sin dashboard propio para AUDITOR: ve igual que TRANSPORTISTA (solo lectura).
- Icono **lápiz** para ver **detalle completo** en **modal** (estilo formulario en hoja).
- **Filtros** (búsqueda + estado) en tablas.
- **Validar/Rechazar** solo **una vez** (confirmación previa y bloqueo posterior).
- **Admin**: validaciones de formulario, **modal de edición** por usuario (correo, nombre, rol, activo). Se **eliminó** el bloque de "declaraciones" en Admin.
- **Cerrar sesión** y **route guard** (no volver al login si hay sesión).

## Stack
- Backend: Node.js, Express, PostgreSQL, JWT, Bcrypt, Joi.
- Frontend: React + Vite, Bootstrap 5 (+ Bootstrap Icons).

## Setup rápido
1) **DB**
```bash
createdb siglad_db
psql -d siglad_db -f database/schema.sql
psql -d siglad_db -f database/seed.sql
```

2) **Backend**
```bash
cd backend
cp .env.example .env
npm install
npm run dev
# opcional:
npm run seed  # crea usuarios demo
```

3) **Frontend**
```bash
cd frontend
cp .env.example .env
npm install
npm run dev   # http://localhost:5173
```

### Cuentas demo
- Admin: `admin@siglad.test` / `Admin123*`
- Agente: `agente@siglad.test` / `Agente123*`
- Transportista: `juan.perez@siglad.test` / `Transportista123*` (display_name = *Juan Pérez*)
- Auditor: `auditor@siglad.test` / `Auditor123*`

### Endpoints
- `POST /api/auth/login`
- `POST /api/duca/recepcion`
- `GET /api/declaraciones` (Admin/Agente)
- `GET /api/estados` (Transportista/Auditor: solo lectura)
- `GET /api/declaraciones/:numero` (detalle para modal)
- `PATCH /api/declaraciones/:numero/estado` (Agente/Admin)

 