// domain/entities/NominaDetalle.js
export class NominaDetalle {
  constructor({
    nominaDetalleId,
    nominaId,
    trabajadorId,
    nombre,
    documento,
    valorBase,
    bonificacion,
    deduccion,
    transporte,
    seguridadSocial,
    observaciones,
    totalPagar,
  }) {
    this.nominaDetalleId = nominaDetalleId;
    this.nominaId = nominaId;
    this.trabajadorId = trabajadorId;
    this.nombre = nombre;
    this.documento = documento;

    this.valorBase = Number(valorBase) || 0;
    this.bonificacion = Number(bonificacion) || 0;
    this.deduccion = Number(deduccion) || 0;
    this.transporte = Number(transporte) || 0;
    this.seguridadSocial = Number(seguridadSocial) || 0;
    this.observaciones = observaciones ?? "";
    this.totalPagar = Number(totalPagar) || 0;
  }
}
