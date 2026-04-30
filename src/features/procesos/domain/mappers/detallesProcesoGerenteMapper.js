export const procesoGerenteMapper = (raw) =>
  new Proceso({
    id: raw.pro_id_proceso,
    codigoCofre: raw.pro_codigo_cofre,
    estado: raw.pro_estado,
    fechaInicio: raw.pro_fecha_inicio,
    referenciaNombre: raw.rc_nombre,
    referenciaCode: raw.rc_codigo,
    faseActual: raw.fase_actual,
    fases: raw.fases ? JSON.parse(raw.fases) : [], // ← viene como string JSON
  });
