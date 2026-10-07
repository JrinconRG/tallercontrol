// domain/entities/NominaTarea.js
export class NominaTarea {
  constructor({
    trabajadorId,
    codigoCofre,
    referencia,
    color,
    cargo,
    valor,
    fechaFin,
    dia,
  }) {
    this.trabajadorId = trabajadorId;
    this.codigoCofre = codigoCofre;
    this.referencia = referencia;
    this.color = color;
    this.cargo = cargo;
    this.valor = Number(valor) || 0;
    this.fechaFin = fechaFin;
    this.dia = dia;
  }
}
