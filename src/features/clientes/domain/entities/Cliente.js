export class Cliente {
  constructor({ id, nombre, celular, direccion, activo }) {
    this.id = id;
    this.nombre = nombre;
    this.celular = celular;
    this.direccion = direccion;
    this.activo = activo;
  }
  tieneCelular() {
    return Boolean(this.celular);
  }

  getCelularMostrar() {
    return this.celular || "Sin celular registrado";
  }

  getDireccionMostrar() {
    return this.direccion || "Sin dirección registrada";
  }
}
