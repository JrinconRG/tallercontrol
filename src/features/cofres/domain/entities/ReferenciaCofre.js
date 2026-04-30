// src/features/cofres/domain/entities/ReferenciaCofre.js
export class ReferenciaCofre {
  constructor({ id, codigo, nombre, descripcion }) {
    this.id = id;
    this.codigo = codigo;
    this.nombre = nombre;
    this.descripcion = descripcion || "Sin descripción";
  }

  getNombreCompleto() {
    return `${this.codigo} - ${this.nombre}`;
  }
}
