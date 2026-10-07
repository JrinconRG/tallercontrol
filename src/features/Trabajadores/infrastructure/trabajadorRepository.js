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
import { mapSupabaseError } from "../../../shared/errors/mapSupabaseError";

export const trabajadorRepository = {
  async getTrabajadoresPorCargo(cargoId) {
    try {
      const data = await obtenerTrabajadoresPorCargo(cargoId);
      return (data || []).map(trabajadorPorCargoMapper);
    } catch (error) {
      throw mapSupabaseError(error);
    }
  },

  async getTrabajadorSelect() {
    try {
      const data = await getTrabajadoresSelect();
      return (data || []).map(trabajadorSelectMapper);
    } catch (error) {
      throw mapSupabaseError(error);
    }
  },

  async getInfoEmpleados() {
    try {
      const data = await getInformacionEmpleados();
      return (data || []).map(trabajadorConCargosMapper);
    } catch (error) {
      throw mapSupabaseError(error);
    }
  },

  async createEmpleado(trabajadorData) {
    try {
      const data = await crearEmpleado(trabajadorData);
      return trabajadorCreadoMapper(data);
    } catch (error) {
      throw mapSupabaseError(error);
    }
  },
  async assignCargo(data) {
    try {
      return await asignarCargo(data);
    } catch (error) {
      throw mapSupabaseError(error);
    }
  },

  async removeCargo(data) {
    try {
      return await designarCargo(data);
    } catch (error) {
      throw mapSupabaseError(error);
    }
  },
};
