export class Pedido {
  constructor({
    id,
    clienteId,
    fecha,
    totalCofres,
    estado,
    creadoPor,
    empresaId,
    clienteNombre,
    clienteCelular,
    creadoPorNombre,
    cofres,
  }) {
    this.id = id;
    this.clienteId = clienteId;
    this.fecha = fecha;
    this.totalCofres = totalCofres;
    this.estado = estado;
    this.creadoPor = creadoPor;
    this.empresaId = empresaId;
    this.clienteNombre = clienteNombre;
    this.clienteCelular = clienteCelular;
    this.creadoPorNombre = creadoPorNombre;
    this.cofres = cofres;
  }
}
