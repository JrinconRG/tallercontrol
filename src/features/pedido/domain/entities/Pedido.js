export class Pedido {
  constructor({
    id,
    clienteId,
    fecha,
    totalCofres,
    estado,
    creadoPor,
    empresaId,
  }) {
    this.id = id;
    this.clienteId = clienteId;
    this.fecha = fecha;
    this.totalCofres = totalCofres;
    this.estado = estado;
    this.creadoPor = creadoPor;
    this.empresaId = empresaId;
  }
}
