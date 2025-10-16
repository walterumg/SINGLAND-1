import { query } from '../db.js';

export async function listDeclaraciones(req,res){
  const role = req.user.role;
  if(role==='TRANSPORTISTA' || role==='AUDITOR'){
    const rows = (await query(
      'SELECT d.numero_documento, d.estado_documento, d.fecha_emision, d.pais_emisor, d.tipo_operacion, d.valor_aduana_total FROM declaraciones d WHERE ($1=\'TRANSPORTISTA\' AND d.transportista_id=$2) OR ($1=\'AUDITOR\') ORDER BY d.id DESC',
      [role, req.user.id]
    )).rows;
    for(const r of rows){
      await query('INSERT INTO bitacora_consultas(usuario, ip_origen, operacion, resultado, numero_declaracion) VALUES ($1,$2,$3,$4,$5)',
        [req.user.email, req.ip, 'Consulta Declaracion', null, r.numero_documento]);
    }
    return res.json(rows);
  }
  const rows = (await query(
    'SELECT d.numero_documento, d.estado_documento, d.fecha_emision, d.pais_emisor, d.tipo_operacion, d.valor_aduana_total, u.display_name AS transportista FROM declaraciones d LEFT JOIN users u ON u.id=d.transportista_id ORDER BY d.id DESC LIMIT 500'
  )).rows;
  res.json(rows);
}

export async function getDeclaracion(req,res){
  const { numero } = req.params;
  const dec = await query('SELECT * FROM declaraciones WHERE numero_documento=$1',[numero]);
  if(!dec.rowCount) return res.status(404).json({error:'No existe'});

  const role = req.user.role;
  if(role==='TRANSPORTISTA'){
    if(dec.rows[0].transportista_id !== req.user.id){
      return res.status(403).json({error:'No autorizado'});
    }
  }

  const merc = await query('SELECT linea, descripcion, cantidad, unidad_medida, valor_unitario, pais_origen FROM mercancias WHERE declaracion_id=$1 ORDER BY linea',[dec.rows[0].id]);
  res.json({
    declaracion: {
      numeroDocumento: dec.rows[0].numero_documento,
      fechaEmision: dec.rows[0].fecha_emision,
      paisEmisor: dec.rows[0].pais_emisor,
      tipoOperacion: dec.rows[0].tipo_operacion,
      medioTransporte: dec.rows[0].medio_transporte,
      placaVehiculo: dec.rows[0].placa_vehiculo,
      nombreConductor: dec.rows[0].nombre_conductor,
      licenciaConductor: dec.rows[0].licencia_conductor,
      paisLicencia: dec.rows[0].pais_licencia,
      aduanaSalida: dec.rows[0].aduana_salida,
      aduanaEntrada: dec.rows[0].aduana_entrada,
      paisDestino: dec.rows[0].pais_destino,
      kmAproximados: dec.rows[0].km_aproximados,
      numeroItems: dec.rows[0].numero_items,
      valorFactura: dec.rows[0].valor_factura,
      gastosTransporte: dec.rows[0].gastos_transporte,
      seguro: dec.rows[0].seguro,
      otrosGastos: dec.rows[0].otros_gastos,
      valorAduanaTotal: dec.rows[0].valor_aduana_total,
      moneda: dec.rows[0].moneda,
      resultadoCodigo: dec.rows[0].resultado_codigo,
      resultadoDescripcion: dec.rows[0].resultado_descripcion,
      estadoDocumento: dec.rows[0].estado_documento,
      firmaElectronica: dec.rows[0].firma_electronica
    },
    mercancias: merc.rows,
    raw: dec.rows[0].raw_json
  });
}

export async function getEstados(req,res){
  return listDeclaraciones(req,res);
}

export async function cambiarEstado(req,res){
  const { numero } = req.params;
  const { nuevoEstado } = req.body;
  if(req.user.role!=='AGENTE' && req.user.role!=='ADMIN'){
    return res.status(403).json({error:'No autorizado'});
  }
  if(!['VALIDADA','RECHAZADA'].includes(nuevoEstado)){
    return res.status(400).json({error:'Estado inválido'});
  }
  const cur = await query('SELECT estado_documento FROM declaraciones WHERE numero_documento=$1',[numero]);
  if(!cur.rowCount) return res.status(404).json({error:'No existe la declaración'});
  if(cur.rows[0].estado_documento !== 'PENDIENTE'){
    return res.status(409).json({error:'La declaración ya fue resuelta y no puede cambiarse'});
  }
  await query('UPDATE declaraciones SET estado_documento=$1 WHERE numero_documento=$2',[nuevoEstado, numero]);
  await query('INSERT INTO bitacora_validacion(usuario, ip_origen, operacion, resultado, numero_declaracion) VALUES ($1,$2,$3,$4,$5)',
    [req.user.email, req.ip, 'Validación', nuevoEstado, numero]);
  res.json({message:'Estado actualizado', numero, estado:nuevoEstado});
}
