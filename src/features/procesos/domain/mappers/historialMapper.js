import { Proceso } from "../entities/Proceso";
import { SubProceso } from "../../../subProcesos/domain/entities/SubProceso";

export const historialProcesosMapper = (data) => {
  // Manejamos si viene un solo objeto o un array
  const items = Array.isArray(data) ? data : [data];

  return items.map((item) => {
    return new Proceso({
      id: item.pro_id_proceso,
      codigoCofre: item.pro_codigo_cofre,
      estado: item.pro_estado,
      fechaInicio: item.pro_fecha_inicio,
      fechaFin: item.pro_fecha_fin,
      referenciaNombre: item.rc_nombre,
      referenciaCodigoNombre: item.rc_codigo,
      totalAcumulado: item.total_acumulado,
      detalleSubprocesos: item.detalle_subprocesos.map(
        (sub) =>
          new SubProceso({
            id: sub.sub_id,
            idProceso: sub.proceso_id,
            trabajadorNombreCompleto: sub.trabajador,
            cargoNombre: sub.fase,
            ordenProceso: sub.orden,
            valor: sub.valor,
            fechaInicio: sub.fecha_inicio,
            fechaFin: sub.fecha_fin,
            duracion: sub.duracion,
            fotosEvidencia: sub.foto,
            // Asumimos estado por la fecha_fin si el JSON no lo trae
            estado: sub.fecha_fin ? "finalizado" : "en_proceso",
          }),
      ),
    });
  });
};
