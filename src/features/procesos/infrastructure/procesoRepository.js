import {
  obtenerProcesosActivos,
  obtenerHistorialProcesos,
  crearProceso,
  validarSiguienteFase, //listo
  obtenerFaseActualProcesos,
  obtenerDetallesProcesosGerente,
} from "../services/procesosService";

import { procesoMapper } from "../domain/mappers/procesoMapper";
import { historialProcesosMapper } from "../domain/mappers/historialMapper";
import { dashboardMapper } from "../domain/mappers/dashboardMapper";
import { faseActualMapper } from "../domain/mappers/faseActualMapper";

export const ProcesoRepository = {
  async getActivos() {
    const data = await obtenerProcesosActivos();
    return (data || []).map(procesoMapper);
  },

  async crear(referenciaId) {
    return await crearProceso(referenciaId);
  },

  async getvalidarSiguienteFase(procesoId, cargoId) {
    return await validarSiguienteFase(procesoId, cargoId);
  },

  async getHistorial() {
    const data = await obtenerHistorialProcesos();
    return historialProcesosMapper(data || []);
  },

  async getDetallesProcesosGerente() {
    const data = await obtenerDetallesProcesosGerente();
    return dashboardMapper(data || []);
  },

  async getFaseActual() {
    const data = await obtenerFaseActualProcesos();
    return (data || []).map(faseActualMapper);
  },
};
