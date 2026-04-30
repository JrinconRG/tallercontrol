export class Cargo {
  constructor({ id, nombre }) {
    this.id = id;
    this.nombre = nombre;
  }

  esIgualA(otroCargo) {
    return this.id === otroCargo.id;
  }

  toString() {
    return this.nombre;
  }
}
