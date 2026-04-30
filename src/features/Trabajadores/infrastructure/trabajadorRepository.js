import {
  obtenerTrabajadoresPorCargo,
  getTrabajadoresSelect,
  getInformacionEmpleados,
  asignarCargo,
  designarCargo,
  crearEmpleado,
} from "../services/trabajadorService";

import { trabajadorConCargosMapper } from "../domain/mappers/trabajadorConCargosMapper";
import { trabajadorSelectMapper } from "../domain/mappers/trabajadorSelectMapper";
import { trabajadorPorCargoMapper } from "../domain/mappers/trabajadorPorCargosMapper";
import { trabajadorCreadoMapper } from "../domain/mappers/trabajadorCreadoMapper";

export const trabajadorRepository = {
  async getTrabajadoresPorCargo(cargoId) {
    const data = await obtenerTrabajadoresPorCargo(cargoId);
    return (data || []).map(trabajadorPorCargoMapper);
  },

  async getTrabajadorSelect() {
    const data = await getTrabajadoresSelect();
    return (data || []).map(trabajadorSelectMapper);
  },

  async getInfoEmpleados() {
    const data = await getInformacionEmpleados();
    return (data || []).map(trabajadorConCargosMapper);
  },

  async createEmpleado(trabajadorData) {
    const data = await crearEmpleado(trabajadorData);
    return trabajadorCreadoMapper(data);
  },
  async assignCargo(data) {
    return await asignarCargo(data);
  },

  async removeCargo(data) {
    return await designarCargo(data);
  },
};
