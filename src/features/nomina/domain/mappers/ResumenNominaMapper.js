export const ResumenNominaMapper = (data) => ({
  totalProcesos: data?.total_procesos ?? 0,
  totalValor: data?.total_valor ?? 0,
  totalTrabajadores: data?.total_trabajadores ?? 0,
  tienePendientesAnteriores: data?.tiene_pendientes_anteriores ?? false,
  totalPendientesTareas: data?.total_pendientes_tareas ?? 0,
  totalPendientesValor: data?.total_pendientes_valor ?? 0,
});
