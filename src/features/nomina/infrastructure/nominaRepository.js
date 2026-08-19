import {
  nominaResumen,
  nominaDetallePreview,
  reporteTrabajadorNomina,
  generarNomina,
  nominaDetalleGenerada,
  obtenerHistorialNominas,
} from "../service/nominaService";
import { DetalleNominaGeneradaMapper } from "../domain/mappers/DetalleNominaGeneradaMapper";
import { ResumenNominaMapper } from "../domain/mappers/ResumenNominaMapper";
import { DetalleNominaPreviewMapper } from "../domain/mappers/DetalleNominaPreviewMapper";
import { ReporteTrabajadorNominaMapper } from "../domain/mappers/ReporteTrabajadorNominaMapper";
import { toNomina } from "../domain/mappers/GenerarNominaMapper";
export const NominaRepository = {
  async getNomina(fechaInicio, fechaFin, generadaPor, ajustes) {
    const data = await generarNomina(
      fechaInicio,
      fechaFin,
      generadaPor,
      null, // empresaId is not provided here, you may want to adjust this if needed
      ajustes,
    );
    return data.map(toNomina);
  },

  async getDetalleGenerada(nominaId) {
    const data = await nominaDetalleGenerada(nominaId);
    return data.map(DetalleNominaGeneradaMapper);
  },

  async getResumen(fechaInicio, fechaFin) {
    const data = await nominaResumen(fechaInicio, fechaFin);
    return ResumenNominaMapper(data);
  },

  async getDetallePreview(fechaInicio, fechaFin) {
    const data = await nominaDetallePreview(fechaInicio, fechaFin);
    return data.map(DetalleNominaPreviewMapper);
  },

  async getReporteTrabajador(
    trabajadorId,
    fechaInicio,
    fechaFin,
    incluirPendientes,
  ) {
    const data = await reporteTrabajadorNomina(
      trabajadorId,
      fechaInicio,
      fechaFin,
      incluirPendientes,
    );
    return data.map(ReporteTrabajadorNominaMapper);
  },
  async getHistorialNominas() {
    const rawData = await obtenerHistorialNominas();
    return rawData.map(toNomina);
  },
};
