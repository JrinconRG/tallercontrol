import { SubProceso } from "../entities/SubProceso";

export const historialSubprocesosNoPagadoMapper = (row) => {
  const parsearFotos = (dato) => {
    if (!dato) return [];
    if (typeof dato === "object") return dato;

    // Si el string no empieza por [ o {, asumimos que es un path de imagen directo
    if (typeof dato === "string" && !dato.startsWith("[")) {
      return [dato];
    }

    try {
      return JSON.parse(dato);
    } catch {
      // Si aun así falla, devolvemos el dato original
      return [dato];
    }
  };
  return new SubProceso({
    id: row.sub_id_subproceso,
    idProceso: row.sub_proceso_id,
    trabajadorId: row.trabajador_id,
    trabajadoNombreCompleto: row.trabajador_nombre,
    trabajadorDocumento: row.t_numero_de_documento,
    codigoCofre: row.pro_codigo_cofre,
    referenciaId: row.referencia_codigo,
    referenciaNombre: row.referencia_nombre,
    cargoNombre: row.cargo_nombre,
    fechaInicio: row.sub_fecha_inicio,
    fechaFin: row.sub_fecha_fin,
    duracion: row.duracion_reloj,
    estado: row.sub_estado,
    pagado: row.sub_pagado,
    valor: row.valor_pagar,
    fotosEvidencia: parsearFotos(row.sub_fotos_evidencia),
  });
};
