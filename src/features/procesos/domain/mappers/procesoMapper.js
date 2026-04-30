import { Proceso } from "../entities/Proceso";

export const procesoMapper = (row) => {
  return new Proceso({
    id: row.pro_id_proceso,
    codigoCofre: row.pro_codigo_cofre,
    referenciaId: row.pro_referencia_id,
    estado: row.pro_estado,
    fechaInicio: row.pro_fecha_inicio,
    fechaFin: row.pro_fecha_fin,
    pagado: row.pro_pagado,
    referenciaCodigoNombre: row.rc_codigo,
    referenciaNombre: row.rc_nombre,
    totalFases: row.total_a_realizar,
    fasesCompletadas: row.total_finalizadas,
  });
};
