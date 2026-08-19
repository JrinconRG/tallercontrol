export const DetalleNominaPreviewMapper = (data) => ({
  trabajadorId: data?.trabajador_id ?? null,
  nombre: data?.nombre ?? "",
  documento: data?.documento ?? "",
  tareasPeriodo: data?.tareas_periodo ?? 0,
  pagoPeriodo: data?.pago_base_periodo ?? 0,
  tareasPendientes: data?.tareas_pendientes ?? 0,
  valorPendientes: data?.valor_pendientes ?? 0,
  totalTareas: data?.total_tareas ?? 0,
  pagoTotal: data?.pago_base_total ?? 0,
});
