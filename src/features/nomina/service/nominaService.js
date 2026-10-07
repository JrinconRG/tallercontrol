import { supabase } from "../../../lib/supabase";

export async function nominaResumen(fechaInicio, fechaFin) {
  const { data, error } = await supabase.rpc("sp_resumen_nomina", {
    p_fecha_inicio: fechaInicio,
    p_fecha_fin: fechaFin,
  });

  if (error) {
    throw error;
  }
  return data; //devuelve un json total_procesos, total_valor, total_trabajadores,tiene_pendientes_anteriores
}

export async function nominaDetalleGenerada(nominaId) {
  const { data, error } = await supabase.rpc("sp_detalle_nomina_generada", {
    p_nomina_id: nominaId,
  });

  if (error) {
    throw error;
  }
  return data;
}

export async function nominaDetallePreview(fechaInicio, fechaFin) {
  const { data, error } = await supabase.rpc("sp_detalle_nomina_preview", {
    p_fecha_inicio: fechaInicio,
    p_fecha_fin: fechaFin,
  });

  if (error) {
    throw error;
  }
  return data; //devuelve un json trabajador_id,nombre,documento,tareas_periodo,pago_base_periodo,tareas_pendientes,valor_pendientes,total_tareas,pago_base_total
}

export async function obtenerHistorialNominas() {
  const { data, error } = await supabase
    .from("vista_historial_nominas")
    .select("*");

  if (error) {
    throw error;
  }
  return data;
}

export async function reporteTrabajadorNomina(
  trabajadorId,
  fechaInicio,
  fechaFin,
  incluirPendientes,
) {
  const { data, error } = await supabase.rpc("sp_reporte_trabajador", {
    p_trabajador_id: trabajadorId,
    p_fecha_desde: fechaInicio,
    p_fecha_hasta: fechaFin,
    p_incluir_pendientes: incluirPendientes,
  });

  if (error) {
    throw error;
  }
  return data; //devuelve un json con subproceso_id, codigo_cofre, referencia_nombre, fecha_inicio,duracion_minutos, estado, valor_calculado, pagado
}

export async function nominaDetalleTareas(nominaId) {
  const { data, error } = await supabase.rpc("fn_nomina_tareas", {
    p_nomina_id: nominaId,
  });

  if (error) {
    throw error;
  }
  return data;
}

export async function generarNomina(
  fechaInicio,
  fechaFin,
  generadaPor,
  empresaId,
  ajustes,
) {
  const { data, error } = await supabase.rpc("sp_generar_nomina", {
    p_fecha_inicio: fechaInicio,
    p_fecha_fin: fechaFin,
    p_generada_por: generadaPor,
    p_ajustes: ajustes ?? [],
  });
  if (error) {
    throw error;
  }
  return data; // devuelve nomina id, total_ trabajadore, total
}
