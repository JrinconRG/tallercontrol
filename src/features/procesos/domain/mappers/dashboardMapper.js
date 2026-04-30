import { Proceso } from "../entities/Proceso";
import { SubProceso } from "../../../subProcesos/domain/entities/SubProceso";

export const dashboardMapper = (data) => {
  const items = Array.isArray(data) ? data : [data];

  return items.map((item) => {
    const fasesParsed =
      typeof item.fases === "string" ? JSON.parse(item.fases) : item.fases;
    return new Proceso({
      id: item.pro_id_proceso,
      codigoCofre: item.pro_codigo_cofre,
      estado: item.pro_estado,
      referenciaNombre: item.rc_nombre,
      referenciaCodigoNombre: item.rc_codigo,
      fechaInicio: item.pro_fecha_inicio,
      faseActual: item.fase_actual,
      detalleSubprocesos: (fasesParsed || []).map((sub, index) => {
        let fotos = [];
        if (Array.isArray(sub.foto)) {
          fotos = sub.foto;
        } else if (sub.foto) {
          fotos = [sub.foto];
        }
        return new SubProceso({
          id: sub.sub_id || `fase-${item.pro_id_proceso}-${index}`,
          idProceso: item.pro_id_proceso,
          cargoNombre: sub.fase,
          ordenProceso: sub.orden,
          valor: sub.valor,
          fechaInicio: sub.fecha_inicio,
          fechaFin: sub.fecha_fin,
          duracion: sub.duracion,
          fotosEvidencia: fotos,
          estado: sub.estado?.toLowerCase(),
          trabajadorNombreCompleto: sub.trabajador,
        });
      }),
    });
  });
};
