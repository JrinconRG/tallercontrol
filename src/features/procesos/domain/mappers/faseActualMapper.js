import { Proceso } from "../entities/Proceso";

export const faseActualMapper = (row) => {
  return new Proceso({
    id: row.pro_id_proceso,
    codigoCofre: row.pro_codigo_cofre,
    estado: row.pro_estado,
    fechaInicio: row.pro_fecha_inicio,
    ultimaFaseOrden: row.ultima_fase_orden,
    siguienteFaseOrden: row.siguiente_fase_orden,
    siguienteCargoId: row.siguiente_cargo_id,
    siguienteCargoNombre: row.siguiente_cargo_nombre,
    totalFases: row.total_fases,
    fasesCompletadas: row.fases_completadas,
  });
};
