import { query } from '../db.js';
import { ducaSchema } from '../validation/duca.schema.js';

export async function recepcion(req,res){
  const ip = req.ip;
  const { error, value } = ducaSchema.validate(req.body, { abortEarly:false });
  if(error){
    await query(
      'INSERT INTO bitacora_registro(usuario, ip_origen, operacion, resultado, numero_declaracion) VALUES ($1,$2,$3,$4,$5)',
      [req.user?.email||'anon', ip, 'Recepción DUCA', 'Fallo', req.body?.duca?.numeroDocumento||null]
    );
    return res.status(400).json({error:'Validación fallida', detalles:error.details.map(d=>d.message)});
  }
  const d = value.duca;
  try{
    const nombreConductor = d?.transporte?.conductor?.nombreConductor || null;
    if(!nombreConductor){
      return res.status(400).json({error:'nombreConductor es obligatorio para la recepción (regla de negocio)'});
    }
    const trow = await query(
      'SELECT u.* FROM users u JOIN roles r ON r.id=u.role_id WHERE r.name=\'TRANSPORTISTA\' AND u.display_name=$1 AND u.is_active=true',
      [nombreConductor]
    );
    if(!trow.rowCount){
      await query(
        'INSERT INTO bitacora_registro(usuario, ip_origen, operacion, resultado, numero_declaracion) VALUES ($1,$2,$3,$4,$5)',
        [req.user?.email||'externo', ip, 'Recepción DUCA', 'Transportista no existe', d.numeroDocumento]
      );
      return res.status(409).json({error:'Transportista no existe o inactivo'});
    }
    const transportistaId = trow.rows[0].id;

    const exists = await query('SELECT 1 FROM declaraciones WHERE numero_documento=$1',[d.numeroDocumento]);
    if(exists.rowCount) return res.status(409).json({error:'DUCA ya registrada'});

    const ins = await query(
      `INSERT INTO declaraciones(
        numero_documento, fecha_emision, pais_emisor, tipo_operacion,
        medio_transporte, placa_vehiculo, nombre_conductor, licencia_conductor, pais_licencia,
        aduana_salida, aduana_entrada, pais_destino, km_aproximados,
        numero_items, valor_factura, gastos_transporte, seguro, otros_gastos,
        valor_aduana_total, moneda, resultado_codigo, resultado_descripcion,
        estado_documento, firma_electronica, raw_json, transportista_id
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,'PENDIENTE',$23,$24,$25)
      RETURNING id`,
      [
        d.numeroDocumento, d.fechaEmision, d.paisEmisor, d.tipoOperacion,
        d.transporte.medioTransporte, d.transporte.placaVehiculo,
        nombreConductor, d?.transporte?.conductor?.licenciaConductor ?? null, d?.transporte?.conductor?.paisLicencia ?? null,
        d.transporte.ruta.aduanaSalida, d.transporte.ruta.aduanaEntrada, d.transporte.ruta.paisDestino, d.transporte.ruta.kilometrosAproximados ?? null,
        d.mercancias.numeroItems, d.valores.valorFactura, d.valores.gastosTransporte ?? null, d.valores.seguro ?? null, d.valores.otrosGastos ?? null,
        d.valores.valorAduanaTotal, d.valores.moneda, d?.resultadoSelectivo?.codigo ?? null, d?.resultadoSelectivo?.descripcion ?? null,
        d.firmaElectronica, JSON.stringify(d), transportistaId
      ]
    );

    const decId = ins.rows[0].id;
    for (const item of d.mercancias.items){
      await query(
        'INSERT INTO mercancias(declaracion_id, linea, descripcion, cantidad, unidad_medida, valor_unitario, pais_origen) VALUES ($1,$2,$3,$4,$5,$6,$7)',
        [decId, item.linea, item.descripcion, item.cantidad, item.unidadMedida, item.valorUnitario, item.paisOrigen]
      );
    }

    await query(
      'INSERT INTO bitacora_registro(usuario, ip_origen, operacion, resultado, numero_declaracion) VALUES ($1,$2,$3,$4,$5)',
      [trow.rows[0].email, ip, 'Registro declaración', 'Éxito', d.numeroDocumento]
    );

    res.status(201).json({message:'Declaración registrada correctamente', numero: d.numeroDocumento});
  }catch(e){
    console.error(e);
    await query(
      'INSERT INTO bitacora_registro(usuario, ip_origen, operacion, resultado, numero_declaracion) VALUES ($1,$2,$3,$4,$5)',
      [req.user?.email||'externo', ip, 'Registro declaración', 'Fallo', req.body?.duca?.numeroDocumento||null]
    );
    res.status(500).json({error:'Error de servidor'});
  }
}
