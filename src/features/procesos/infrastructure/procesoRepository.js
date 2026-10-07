import {
  obtenerProcesosActivos,
  obtenerHistorialProcesos,
  crearProceso,
  validarSiguienteFase, //listo
  obtenerFaseActualProcesos,
  obtenerDetallesProcesosGerente,
  obtenerProcesosSinAsignar,
  obtenerColores,
} from "../services/procesosService";

import { mapColor } from "../domain/mappers/colorMapper";
import { procesoSinAsignarMapper } from "../domain/mappers/procesoSinAsignarMapper";
import { procesoMapper } from "../domain/mappers/procesoMapper";
import { historialProcesosMapper } from "../domain/mappers/historialMapper";
import { dashboardMapper } from "../domain/mappers/dashboardMapper";
import { faseActualMapper } from "../domain/mappers/faseActualMapper";
import { mapSupabaseError } from "../../../shared/errors/mapSupabaseError";

export const ProcesoRepository = {
  async getActivos() {
    try {
      const data = await obtenerProcesosActivos();
      return (data || []).map(procesoMapper);
    } catch (error) {
      throw mapSupabaseError(error);
    }
  },

  async crear(referenciaId, colorId) {
    try {
      return await crearProceso(referenciaId, colorId);
    } catch (error) {
      throw mapSupabaseError(error);
    }
  },
  async getColores() {
    try {
      const data = await obtenerColores();
      return (data || []).map(mapColor);
    } catch (error) {
      throw mapSupabaseError(error);
    }
  },

  async getvalidarSiguienteFase(procesoId, cargoId) {
    try {
      return await validarSiguienteFase(procesoId, cargoId);
    } catch (error) {
      throw mapSupabaseError(error);
    }
  },

  async getHistorial() {
    try {
      const data = await obtenerHistorialProcesos();
      return historialProcesosMapper(data || []);
    } catch (error) {
      throw mapSupabaseError(error);
    }
  },

  async getDetallesProcesosGerente() {
    try {
      const data = await obtenerDetallesProcesosGerente();
      return dashboardMapper(data || []);
    } catch (error) {
      throw mapSupabaseError(error);
    }
  },

  async getFaseActual() {
    try {
      const data = await obtenerFaseActualProcesos();
      return (data || []).map(faseActualMapper);
    } catch (error) {
      throw mapSupabaseError(error);
    }
  },

  async getProcesosSinAsignar() {
    try {
      const data = await obtenerProcesosSinAsignar();
      return (data || []).map(procesoSinAsignarMapper);
    } catch (error) {
      throw mapSupabaseError(error);
    }
  },
};
