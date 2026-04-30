import {
  getHistorialSubprocesosTrabajadorNoPagado,
  getInformacionSubprocesoActual,
  crearSubproceso,
  finalizarSubproceso,
} from "../service/subProcesosService";

import { historialSubprocesosNoPagadoMapper } from "../domain/mappers/historialSubprocesosNoPagadoMapper";
import { infoSubprocesoActualMapper } from "../domain/mappers/infoSubprocesoActual";

export const subProcesosRepository = {
  async createSubproceso(cargoId, procesoId, trabajadorId) {
    return await crearSubproceso(cargoId, procesoId, trabajadorId);
  },

  async finishSubproceso(data) {
    return await finalizarSubproceso(data);
  },

  obtenerHistorialSubprocesosPendientes: async () => {
    try {
      const data = await getHistorialSubprocesosTrabajadorNoPagado();
      console.log("Datos brutos:", data);
      return (data || []).map(historialSubprocesosNoPagadoMapper);
    } catch (error) {
      throw new Error(`Error al procesar el historial: ${error.message}`);
    }
  },

  async getInfoSubprocesoActual() {
    const data = await getInformacionSubprocesoActual();
    return (data || []).map(infoSubprocesoActualMapper);
  },
};
