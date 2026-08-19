export const ReporteTrabajadorNominaMapper = (data) => ({
  subprocesoId: data?.subproceso_id ?? null,
  nombreCompleto: data?.nombre_trabajador ?? "",
  codigoCofre: data?.codigo_cofre ?? "",
  faseNombre: data?.fase ?? "",
  referenciaNombre: data?.referencia_nombre ?? "",
  fechaInicio: data?.fecha_inicio ?? null,
  fechaFin: data?.fecha_fin ?? null,
  duracionMinutos: data?.duracion_minutos ?? 0,
  duracionReloj: data?.duracion_reloj ?? "00:00",
  estado: data?.estado ?? "",
  valorCalculado: data?.valor_calculado ?? 0,
  pagado: data?.pagado ?? false,
});
