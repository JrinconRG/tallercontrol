import { Cargo } from "../../../cargos/domain/entities/Cargo";

export class Trabajador {
  constructor({ id, nombre, apellidos, documento, celular, cargos = [] }) {
    this.id = id;
    this.nombre = nombre;
    this.apellidos = apellidos;
    this.documento = documento;
    this.celular = celular;
    this.cargos = cargos.map((cargo) => new Cargo(cargo));
  }
  nombreCompleto() {
    if (this.nombre && this.apellidos) {
      return `${this.nombre} ${this.apellidos}`;
    }
    return this.nombre || this.apellidos || "Sin nombre";
  }

  tieneMultipleCargos() {
    return this.cargos.length > 1;
  }
}
