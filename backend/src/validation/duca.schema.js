import Joi from 'joi';

export const ducaSchema = Joi.object({
  duca: Joi.object({
    numeroDocumento: Joi.string().max(20).required(),
    fechaEmision: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
    paisEmisor: Joi.string().max(2).required(),
    tipoOperacion: Joi.string().max(20).required(),
    exportador: Joi.object({
      idExportador: Joi.string().max(15).required(),
      nombreExportador: Joi.string().max(100).required(),
      direccionExportador: Joi.string().max(120).allow('', null),
      contactoExportador: Joi.object({
        telefono: Joi.string().max(15).allow('', null),
        email: Joi.string().email().max(60).allow('', null)
      }).allow(null)
    }).required(),
    importador: Joi.object({
      idImportador: Joi.string().max(15).required(),
      nombreImportador: Joi.string().max(100).required(),
      direccionImportador: Joi.string().max(120).allow('', null),
      contactoImportador: Joi.object({
        telefono: Joi.string().max(15).allow('', null),
        email: Joi.string().email().max(60).allow('', null)
      }).allow(null)
    }).required(),
    transporte: Joi.object({
      medioTransporte: Joi.string().max(20).required(),
      placaVehiculo: Joi.string().max(10).required(),
      conductor: Joi.object({
        nombreConductor: Joi.string().max(80).allow('', null),
        licenciaConductor: Joi.string().max(20).allow('', null),
        paisLicencia: Joi.string().max(2).allow('', null)
      }).allow(null),
      ruta: Joi.object({
        aduanaSalida: Joi.string().max(50).required(),
        aduanaEntrada: Joi.string().max(50).required(),
        paisDestino: Joi.string().max(2).required(),
        kilometrosAproximados: Joi.number().integer().max(999999).allow(null)
      }).required()
    }).required(),
    mercancias: Joi.object({
      numeroItems: Joi.number().integer().required(),
      items: Joi.array().items(Joi.object({
        linea: Joi.number().integer().required(),
        descripcion: Joi.string().max(120).required(),
        cantidad: Joi.number().integer().required(),
        unidadMedida: Joi.string().max(10).required(),
        valorUnitario: Joi.number().precision(2).required(),
        paisOrigen: Joi.string().max(2).required()
      })).required()
    }).required(),
    valores: Joi.object({
      valorFactura: Joi.number().precision(2).required(),
      gastosTransporte: Joi.number().precision(2).allow(null),
      seguro: Joi.number().precision(2).allow(null),
      otrosGastos: Joi.number().precision(2).allow(null),
      valorAduanaTotal: Joi.number().precision(2).required(),
      moneda: Joi.string().max(3).required()
    }).required(),
    resultadoSelectivo: Joi.object({
      codigo: Joi.string().max(1).allow(null),
      descripcion: Joi.string().max(60).allow(null)
    }).allow(null),
    estadoDocumento: Joi.string().max(20).required(),
    firmaElectronica: Joi.string().max(64).required()
  }).required()
});
