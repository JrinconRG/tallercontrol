import {
  nominaResumen,
  nominaDetallePreview,
  reporteTrabajadorNomina,
  generarNomina,
  nominaDetalleGenerada,
  obtenerHistorialNominas,
  nominaDetalleTareas,
} from "../service/nominaService";
import { NominaTareaMapper } from "../domain/mappers/NominaTareaMapper";

import { DetalleNominaGeneradaMapper } from "../domain/mappers/DetalleNominaGeneradaMapper";
import { ResumenNominaMapper } from "../domain/mappers/ResumenNominaMapper";
import { DetalleNominaPreviewMapper } from "../domain/mappers/DetalleNominaPreviewMapper";
import { ReporteTrabajadorNominaMapper } from "../domain/mappers/ReporteTrabajadorNominaMapper";
import { toNomina } from "../domain/mappers/GenerarNominaMapper";
import { mapSupabaseError } from "../../../shared/errors/mapSupabaseError";
import { nominaErrorMap } from "./errors/nominaErrorMap";
export const NominaRepository = {
  async getNomina(fechaInicio, fechaFin, generadaPor, ajustes) {
    try {
      const data = await generarNomina(
        fechaInicio,
        fechaFin,
        generadaPor,
        null,
        ajustes,
      );
      return data.map(toNomina);
    } catch (error) {
      throw mapSupabaseError(error, nominaErrorMap);
    }
  },

  async getDetalleGenerada(nominaId) {
    try {
      const data = await nominaDetalleGenerada(nominaId);
      return data.map(DetalleNominaGeneradaMapper);
    } catch (error) {
      throw mapSupabaseError(error, nominaErrorMap);
    }
  },

  async getResumen(fechaInicio, fechaFin) {
    try {
      const data = await nominaResumen(fechaInicio, fechaFin);
      return ResumenNominaMapper(data);
    } catch (error) {
      throw mapSupabaseError(error, nominaErrorMap);
    }
  },

  async getDetallePreview(fechaInicio, fechaFin) {
    try {
      const data = await nominaDetallePreview(fechaInicio, fechaFin);
      return data.map(DetalleNominaPreviewMapper);
    } catch (error) {
      throw mapSupabaseError(error, nominaErrorMap);
    }
  },

  async getReporteTrabajador(
    trabajadorId,
    fechaInicio,
    fechaFin,
    incluirPendientes,
  ) {
    try {
      const data = await reporteTrabajadorNomina(
        trabajadorId,
        fechaInicio,
        fechaFin,
        incluirPendientes,
      );
      return data.map(ReporteTrabajadorNominaMapper);
    } catch (error) {
      throw mapSupabaseError(error, nominaErrorMap);
    }
  },
  async getTareasNomina(nominaId) {
    try {
      const data = await nominaDetalleTareas(nominaId);
      return data.map(NominaTareaMapper);
    } catch (error) {
      throw mapSupabaseError(error, nominaErrorMap);
    }
  },
  async getHistorialNominas() {
    try {
      const rawData = await obtenerHistorialNominas();
      return rawData.map(toNomina);
    } catch (error) {
      throw mapSupabaseError(error, nominaErrorMap);
    }
  },
};
