import {
  getHistorialSubprocesosTrabajadorNoPagado,
  getInformacionSubprocesoActual,
  crearSubproceso,
  finalizarSubproceso,
} from "../service/subProcesosService";

import { historialSubprocesosNoPagadoMapper } from "../domain/mappers/historialSubprocesosNoPagadoMapper";
import { infoSubprocesoActualMapper } from "../domain/mappers/infoSubprocesoActual";
import { mapSupabaseError } from "../../../shared/errors/mapSupabaseError";

export const subProcesosRepository = {
  async createSubproceso(cargoId, procesoId, trabajadorId) {
    try {
      return await crearSubproceso(cargoId, procesoId, trabajadorId);
    } catch (error) {
      throw mapSupabaseError(error);
    }
  },

  async finishSubproceso(data) {
    try {
      return await finalizarSubproceso(data);
    } catch (error) {
      throw mapSupabaseError(error);
    }
  },

  obtenerHistorialSubprocesosPendientes: async () => {
    try {
      const data = await getHistorialSubprocesosTrabajadorNoPagado();
      return (data || []).map(historialSubprocesosNoPagadoMapper);
    } catch (error) {
      throw mapSupabaseError(error);
    }
  },

  async getInfoSubprocesoActual() {
    try {
      const data = await getInformacionSubprocesoActual();
      return (data || []).map(infoSubprocesoActualMapper);
    } catch (error) {
      throw mapSupabaseError(error);
    }
  },
};
