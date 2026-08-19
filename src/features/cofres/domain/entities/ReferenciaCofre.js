// src/features/cofres/domain/entities/ReferenciaCofre.js
export class ReferenciaCofre {
  constructor({ id, codigo, nombre, descripcion, activo }) {
    this.id = id;
    this.codigo = codigo;
    this.nombre = nombre;
    this.descripcion = descripcion || "Sin descripción";
    this.activo = activo;
  }

  getNombreCompleto() {
    return `${this.codigo} - ${this.nombre}`;
  }
}
