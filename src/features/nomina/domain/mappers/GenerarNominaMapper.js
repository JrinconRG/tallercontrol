import { Nomina } from "../entities/Nomina";

export function toNomina(raw) {
  return new Nomina({
    nominaId: raw.nomina_id,
    fechaInicio: raw.fecha_inicio,
    fechaFin: raw.fecha_fin,
    fechaGeneracion: raw.fecha_generacion,
    totalTrabajadores: raw.total_trabajadores,
    totalPago: raw.total_pago,
    estado: raw.estado,
    generadaPor: raw.generada_por,
    generadaPorNombre: raw.generado_por_nombre ?? "",
  });
}
