export class Nomina {
  constructor({
    nominaId,
    fechaInicio,
    fechaFin,
    fechaGeneracion,
    totalTrabajadores,
    totalPago,
    estado,
    generadaPor,
    generadaPorNombre,
  }) {
    this.nominaId = nominaId;
    this.fechaInicio = fechaInicio;
    this.fechaFin = fechaFin;
    this.fechaGeneracion = fechaGeneracion;
    this.totalTrabajadores = totalTrabajadores;
    this.totalPago = totalPago;
    this.estado = estado;
    this.generadaPor = generadaPor;
    this.generadaPorNombre = generadaPorNombre;
  }
}
