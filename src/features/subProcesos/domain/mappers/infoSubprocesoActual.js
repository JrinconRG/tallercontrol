import { SubProceso } from "../entities/SubProceso";

export const infoSubprocesoActualMapper = (row) => {
  return new SubProceso({
    id: row.sub_id_subproceso,
    idProceso: row.sub_proceso_id,
    fechaInicio: row.sub_fecha_inicio,
    estado: row.sub_estado,
    trabajadorId: row.trabajador_id,
    trabajadorNombreCompleto: row.t_nombre,
    cargoId: row.cargo_id,
    cargoNombre: row.c_nombre,
    ordenProceso: row.c_orden_proceso,
  });
};
