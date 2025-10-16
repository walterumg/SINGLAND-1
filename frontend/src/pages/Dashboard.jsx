import React, { useEffect, useState } from 'react';
import api from '../api/client';
import './dashboard.css';

/* ===================== Filtros ===================== */
function Filters({
  q, setQ,
  estado, setEstado,
  fechaDesde, setFechaDesde,
  fechaHasta, setFechaHasta,
  onClear
}){
  return (
    <div className="row g-2 mb-3">
      <div className="col-md-3">
        <input
          className="form-control"
          placeholder="Buscar por número o tipo..."
          value={q}
          onChange={e=>setQ(e.target.value)}
        />
      </div>

      <div className="col-md-3">
        <select
          className="form-select"
          value={estado}
          onChange={e=>setEstado(e.target.value)}
        >
          <option value="">Todos los estados</option>
          <option value="PENDIENTE">PENDIENTE</option>
          <option value="VALIDADA">VALIDADA</option>
          <option value="RECHAZADA">RECHAZADA</option>
        </select>
      </div>

      <div className="col-md-2">
        <input
          type="date"
          className="form-control"
          value={fechaDesde}
          onChange={e=>setFechaDesde(e.target.value)}
        />
      </div>

      <div className="col-md-2">
        <input
          type="date"
          className="form-control"
          value={fechaHasta}
          onChange={e=>setFechaHasta(e.target.value)}
        />
      </div>

      <div className="col-md-2">
        <button
          type="button"
          className="btn btn-outline-secondary w-100"
          onClick={onClear}
        >
          Limpiar
        </button>
      </div>
    </div>
  );
}

/* ============ Campo tipo “papel” para el modal ============ */
function PaperField({ label, value }){
  return (
    <div className="mb-2">
      <div className="text-uppercase small text-muted">{label}</div>
      <div className="fw-semibold border-bottom pb-1">{value ?? '-'}</div>
    </div>
  );
}

/* ===================== Modal de detalle ===================== */
function DetailModal({ numero, onClose }){
  const [data,setData]=useState(null);
  const [err,setErr]=useState('');

  useEffect(()=>{
    async function load(){
      try{
        const { data } = await api.get(`/declaraciones/${numero}`);
        setData(data);
      }catch(e){
        setErr('No fue posible cargar el detalle');
      }
    }
    load();
  },[numero]);

  return (
    <div className="modal fade show" style={{display:'block', background:'rgba(0,0,0,.5)'}}>
      <div className="modal-dialog modal-lg modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Detalle de DUCA — {numero}</h5>
            <button className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            {err && <div className="alert alert-danger">{err}</div>}
            {!data ? <div>Cargando...</div> : (
              <div className="p-3" style={{background:'#fff', boxShadow:'0 0 0 1px #eee inset', borderRadius:'6px'}}>
                <h6 className="mb-3 text-muted">Datos Generales</h6>
                <div className="row">
                  <div className="col-md-4"><PaperField label="Número" value={data.declaracion.numeroDocumento}/></div>
                  <div className="col-md-4"><PaperField label="Fecha" value={String(data.declaracion.fechaEmision).slice(0,10)}/></div>
                  <div className="col-md-4"><PaperField label="Estado" value={data.declaracion.estadoDocumento}/></div>
                </div>
                <div className="row">
                  <div className="col-md-4"><PaperField label="País Emisor" value={data.declaracion.paisEmisor}/></div>
                  <div className="col-md-4"><PaperField label="Tipo Operación" value={data.declaracion.tipoOperacion}/></div>
                  <div className="col-md-4"><PaperField label="Moneda" value={data.declaracion.moneda}/></div>
                </div>
                <hr/>
                <h6 className="mb-3 text-muted">Transporte</h6>
                <div className="row">
                  <div className="col-md-4"><PaperField label="Medio" value={data.declaracion.medioTransporte}/></div>
                  <div className="col-md-4"><PaperField label="Placa" value={data.declaracion.placaVehiculo}/></div>
                  <div className="col-md-4"><PaperField label="Conductor" value={data.declaracion.nombreConductor}/></div>
                </div>
                <div className="row">
                  <div className="col-md-4"><PaperField label="Licencia" value={data.declaracion.licenciaConductor}/></div>
                  <div className="col-md-4"><PaperField label="País Licencia" value={data.declaracion.paisLicencia}/></div>
                  <div className="col-md-4"><PaperField label="Km Aprox" value={data.declaracion.kmAproximados}/></div>
                </div>
                <div className="row">
                  <div className="col-md-4"><PaperField label="Aduana Salida" value={data.declaracion.aduanaSalida}/></div>
                  <div className="col-md-4"><PaperField label="Aduana Entrada" value={data.declaracion.aduanaEntrada}/></div>
                  <div className="col-md-4"><PaperField label="País Destino" value={data.declaracion.paisDestino}/></div>
                </div>
                <hr/>
                <h6 className="mb-3 text-muted">Valores</h6>
                <div className="row">
                  <div className="col-md-3"><PaperField label="Factura" value={data.declaracion.valorFactura}/></div>
                  <div className="col-md-3"><PaperField label="Transporte" value={data.declaracion.gastosTransporte}/></div>
                  <div className="col-md-3"><PaperField label="Seguro" value={data.declaracion.seguro}/></div>
                  <div className="col-md-3"><PaperField label="Otros" value={data.declaracion.otrosGastos}/></div>
                </div>
                <div className="row">
                  <div className="col-md-4"><PaperField label="Valor Aduana" value={data.declaracion.valorAduanaTotal}/></div>
                  <div className="col-md-8"><PaperField label="Resultado Selectivo" value={(data.declaracion.resultadoCodigo||'') + ' ' + (data.declaracion.resultadoDescripcion||'')}/></div>
                </div>
                <hr/>
                <h6 className="mb-2">Mercancías</h6>
                <table className="table table-sm">
                  <thead><tr><th>Linea</th><th>Descripción</th><th>Cantidad</th><th>Unidad</th><th>Valor Unit.</th><th>País Origen</th></tr></thead>
                  <tbody>
                    {data.mercancias.map((m,i)=>(
                      <tr key={i}><td>{m.linea}</td><td>{m.descripcion}</td><td>{m.cantidad}</td><td>{m.unidad_medida}</td><td>{m.valor_unitario}</td><td>{m.pais_origen}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>Cerrar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===================== Tabla ===================== */
function Table({ data, actions }){
  return (
    <table className="table table-sm table-hover">
      <thead><tr>
        <th>Número</th><th>Estado</th><th>Fecha</th><th>Pais</th><th>Tipo</th><th>Valor Aduana</th><th></th>
      </tr></thead>
      <tbody>
        {data.map((r,i)=>(
          <tr key={i}>
            <td>{r.numero_documento}</td>
            <td>
              <span className={'badge bg-' + (
                r.estado_documento==='VALIDADA' ? 'success' :
                r.estado_documento==='RECHAZADA' ? 'danger' :
                r.estado_documento==='PENDIENTE' ? 'secondary' : 'info'
              )}>
                {r.estado_documento}
              </span>
            </td>
            <td>{r.fecha_emision?.slice(0,10)}</td>
            <td>{r.pais_emisor}</td>
            <td>{r.tipo_operacion}</td>
            <td>{r.valor_aduana_total}</td>
            <td className="text-end">{actions ? actions(r) : null}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* ===================== Dashboard ===================== */
export default function Dashboard(){
  const [datos,setDatos]=useState([]);
  const role = localStorage.getItem('role');
  const name = localStorage.getItem('display_name');
  const [msg,setMsg]=useState('');
  const [modalNum,setModalNum]=useState(null);

  // Filtros existentes
  const [q,setQ]=useState('');
  const [estado,setEstado]=useState('');

  // NUEVO: filtros de fecha
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');

  async function cargar(){
    try{
      const { data } = await api.get(
        (role==='TRANSPORTISTA' || role==='AUDITOR') ? '/estados' : '/declaraciones'
      );
      setDatos(data);
    }catch(e){
      setMsg('Error al cargar');
    }
  }

  useEffect(()=>{ cargar(); },[]);

  async function cambiar(numero, estadoNuevo){
    if(!window.confirm('¿Seguro que quiere realizar esta acción?')) return;
    try{
      await api.patch(`/declaraciones/${numero}/estado`, { nuevoEstado: estadoNuevo });
      cargar();
    }catch(e){
      setMsg(e.response?.data?.error || 'Error');
    }
  }

  function logout(){
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('display_name');
    window.location.replace('/login');
  }

  // Filtrado combinado: texto + estado + rango de fechas
  const filtrados = datos.filter(r=>{
    const text = (r.numero_documento + ' ' + r.tipo_operacion).toLowerCase();
    const passQ = !q || text.includes(q.toLowerCase());
    const passE = !estado || r.estado_documento===estado;

    const fecha = (r.fecha_emision || '').slice(0,10); // YYYY-MM-DD
    const passFD = !fechaDesde || (fecha && fecha >= fechaDesde);
    const passFH = !fechaHasta || (fecha && fecha <= fechaHasta);

    return passQ && passE && passFD && passFH;
  });

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Dashboard — {role}</h4>
        <div className="d-flex align-items-center gap-3">
          <div>Usuario: <strong>{name}</strong></div>
          <button className="btn btn-outline-secondary btn-sm" onClick={logout}>
            <i className="bi bi-box-arrow-right"></i> Cerrar sesión
          </button>
        </div>
      </div>

      {msg && <div className="alert alert-warning">{msg}</div>}

      {role==='ADMIN' ? (
        <div className="card shadow-sm">
          <div className="card-body">
            <h5 className="mb-3">Usuarios</h5>
            <AdminUsers onChange={cargar}/>
          </div>
        </div>
      ) : (
        <div className="card shadow-sm">
          <div className="card-body">
            <h5 className="mb-3">Declaraciones</h5>

            <Filters
              q={q} setQ={setQ}
              estado={estado} setEstado={setEstado}
              fechaDesde={fechaDesde} setFechaDesde={setFechaDesde}
              fechaHasta={fechaHasta} setFechaHasta={setFechaHasta}
              onClear={()=>{
                setQ(''); setEstado('');
                setFechaDesde(''); setFechaHasta('');
              }}
            />

            <Table
              data={filtrados}
              actions={(role==='AGENTE'||role==='ADMIN'||role==='TRANSPORTISTA'||role==='AUDITOR') ? (r=>(
                <div className="btn-group btn-group-sm">
                  <button className="btn btn-outline-secondary" title="Ver detalle" onClick={()=>setModalNum(r.numero_documento)}>
                    <i className="bi bi-pencil-square"></i>
                  </button>
                  {(role==='AGENTE'||role==='ADMIN') && (
                    <>
                      <button className="btn btn-outline-success" disabled={r.estado_documento!=='PENDIENTE'} onClick={()=>cambiar(r.numero_documento,'VALIDADA')}>Validar</button>
                      <button className="btn btn-outline-danger" disabled={r.estado_documento!=='PENDIENTE'} onClick={()=>cambiar(r.numero_documento,'RECHAZADA')}>Rechazar</button>
                    </>
                  )}
                </div>
              )):null}
            />
          </div>
        </div>
      )}

      {modalNum && <DetailModal numero={modalNum} onClose={()=>setModalNum(null)} />}
    </div>
  );
}

/* ===================== Admin Users (con filtros) ===================== */
function AdminUsers({ onChange }) {
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ email:'', password:'', role:'TRANSPORTISTA', display_name:'', is_active:true });
  const [msg, setMsg] = useState('');
  const [edit, setEdit] = useState(null);

  // Filtros de la tabla de usuarios
  const [qUser, setQUser] = useState('');     // texto libre: correo, nombre, id
  const [roleF, setRoleF] = useState('');     // rol
  const [activeF, setActiveF] = useState(''); // '', 'SI', 'NO'

  async function cargar() {
    const { data } = await api.get('/usuarios');
    setList(data);
  }
  useEffect(() => { cargar(); }, []);

  function validEmail(e) { return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e); }

  async function crear(e) {
    e.preventDefault();
    if (!form.email || !form.password || !form.display_name) return setMsg('Todos los campos son obligatorios');
    if (!validEmail(form.email)) return setMsg('Correo inválido');
    try {
      await api.post('/usuarios', form);
      setForm({ email:'', password:'', role:'TRANSPORTISTA', display_name:'', is_active:true });
      setMsg('Usuario creado');
      await cargar();
      onChange?.();
    } catch (err) {
      setMsg(err.response?.data?.error || 'Error');
    }
  }

  async function guardarEdicion() {
    if (!validEmail(edit.email)) return setMsg('Correo inválido');
    if (!edit.display_name) return setMsg('Nombre requerido');
    try {
      const payload = {
        email: edit.email,
        display_name: edit.display_name,
        is_active: edit.is_active,
        role: edit.role
      };
      if (edit.password && edit.password.length) payload.password = edit.password;
      await api.patch(`/usuarios/${edit.id}`, payload);
      setEdit(null);
      await cargar();
      onChange?.();
    } catch (err) {
      setMsg(err.response?.data?.error || 'Error');
    }
  }

  // Filtrado en la tabla de usuarios
  const filtered = list.filter(u => {
    const needle = qUser.trim().toLowerCase();
    const passText =
      !needle ||
      String(u.id).includes(needle) ||
      (u.email ?? '').toLowerCase().includes(needle) ||
      (u.display_name ?? '').toLowerCase().includes(needle);

    const passRole = !roleF || u.role === roleF;
    const passActive = !activeF || (u.is_active ? 'SI' : 'NO') === activeF;

    return passText && passRole && passActive;
  });

  return (
    <div className="row">
      <div className="col-md-6">
        {msg && <div className="alert alert-info py-2">{msg}</div>}
        <form onSubmit={crear} noValidate>
          <div className="row g-2">
            <div className="col-12">
              <input className="form-control" placeholder="Correo" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} required type="email"/>
            </div>
            <div className="col-12">
              <input type="password" className="form-control" placeholder="Contraseña" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} required/>
            </div>
            <div className="col-12">
              <input className="form-control" placeholder="Nombre visible (display_name)" value={form.display_name} onChange={e=>setForm({...form, display_name:e.target.value})} required/>
            </div>
            <div className="col-6">
              <select className="form-select" value={form.role} onChange={e=>setForm({...form, role:e.target.value})}>
                <option>TRANSPORTISTA</option>
                <option>AGENTE</option>
                <option>ADMIN</option>
                <option>AUDITOR</option>
              </select>
            </div>
            <div className="col-6 d-flex align-items-center">
              <div className="form-check">
                <input className="form-check-input" type="checkbox" checked={form.is_active} onChange={e=>setForm({...form, is_active:e.target.checked})} id="activeNew"/>
                <label className="form-check-label" htmlFor="activeNew">Activo</label>
              </div>
            </div>
            <div className="col-12">
              <button className="btn btn-primary w-100">Crear usuario</button>
            </div>
          </div>
        </form>
      </div>

      <div className="col-md-6">
        {/* Toolbar de filtro */}
        <div className="row g-2 mb-2">
          <div className="col-7">
            <input
              className="form-control"
              placeholder="Buscar (ID, correo o nombre)..."
              value={qUser}
              onChange={e=>setQUser(e.target.value)}
            />
          </div>
          <div className="col-3">
            <select className="form-select" value={roleF} onChange={e=>setRoleF(e.target.value)}>
              <option value="">Todos los roles</option>
              <option value="TRANSPORTISTA">TRANSPORTISTA</option>
              <option value="AGENTE">AGENTE</option>
              <option value="ADMIN">ADMIN</option>
              <option value="AUDITOR">AUDITOR</option>
            </select>
          </div>
          <div className="col-2">
            <select className="form-select" value={activeF} onChange={e=>setActiveF(e.target.value)}>
              <option value="">Todos</option>
              <option value="SI">Activos</option>
              <option value="NO">Inactivos</option>
            </select>
          </div>
        </div>

        <table className="table table-sm">
          <thead><tr><th>ID</th><th>Correo</th><th>Nombre</th><th>Rol</th><th>Activo</th><th></th></tr></thead>
        <tbody>
          {filtered.map(u=>(
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.email}</td>
              <td>{u.display_name}</td>
              <td>{u.role}</td>
              <td>{u.is_active?'Sí':'No'}</td>
              <td>
                <button className="btn btn-outline-secondary btn-sm" onClick={()=>setEdit({...u})}>
                  Editar
                </button>
              </td>
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr><td colSpan="6" className="text-center text-muted">Sin resultados</td></tr>
          )}
        </tbody>
        </table>
      </div>

      {edit && (
        <div className="modal fade show" style={{display:'block', background:'rgba(0,0,0,.5)'}}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Editar usuario #{edit.id}</h5>
                <button className="btn-close" onClick={()=>setEdit(null)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-2">
                  <label className="form-label">Correo</label>
                  <input className="form-control" type="email" value={edit.email} onChange={e=>setEdit({...edit, email:e.target.value})} required/>
                </div>
                <div className="mb-2">
                  <label className="form-label">Nombre visible</label>
                  <input className="form-control" value={edit.display_name} onChange={e=>setEdit({...edit, display_name:e.target.value})} required/>
                </div>
                <div className="mb-2">
                  <label className="form-label">Contraseña (dejar vacío para no cambiar)</label>
                  <input className="form-control" type="password" value={edit.password||''} onChange={e=>setEdit({...edit, password:e.target.value})} />
                </div>
                <div className="mb-2">
                  <label className="form-label">Rol</label>
                  <select className="form-select" value={edit.role} onChange={e=>setEdit({...edit, role:e.target.value})}>
                    <option>TRANSPORTISTA</option>
                    <option>AGENTE</option>
                    <option>ADMIN</option>
                    <option>AUDITOR</option>
                  </select>
                </div>
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" checked={edit.is_active} onChange={e=>setEdit({...edit, is_active:e.target.checked})} id="activeEdit"/>
                  <label className="form-check-label" htmlFor="activeEdit">Activo</label>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={()=>setEdit(null)}>Cancelar</button>
                <button className="btn btn-primary" onClick={guardarEdicion}>Guardar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
