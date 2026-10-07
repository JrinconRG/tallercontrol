import { supabase } from "../../../lib/supabase";

export async function obtenerProcesosActivos() {
  const { data, error } = await supabase
    .from("vw_procesos_activos")
    .select("*")
    .in("pro_estado", ["activo", "en_proceso"])
    .order("pro_fecha_inicio", { ascending: true });

  if (error) {
    throw error;
  }

  return data;
}

export async function obtenerHistorialProcesos() {
  const { data, error } = await supabase
    .from("vw_historial_trabajador")
    .select("*")

    .order("pro_fecha_fin", { ascending: false }); // false = Los más nuevos primero

  if (error) {
    throw error;
  }

  return data;
}

export async function crearProceso(referenciaId, colorId) {
  const { data, error } = await supabase.rpc("sp_crear_proceso", {
    p_referencia_id: referenciaId,
    p_color_id: colorId,
  });

  if (error) {
    throw error;
  }

  return data; // devuelve pro_id
}

export async function obtenerFaseActualProcesos() {
  const { data, error } = await supabase.from("vw_fase_actual").select("*");

  if (error) {
    throw error;
  }

  return data;
}

export async function validarSiguienteFase(procesoId, cargoId) {
  const { data, error } = await supabase.rpc("sp_validar_siguiente_fase", {
    p_proceso_id: procesoId,
    p_cargo_id: cargoId,
  });

  if (error) {
    throw error;
  }

  return data; // true | false
}

export async function obtenerDetallesProcesosGerente() {
  const { data, error } = await supabase
    .from("vista_dashboard_gerente")
    .select(
      "pro_id_proceso, pro_codigo_cofre, pro_estado, pro_fecha_inicio, rc_nombre, rc_codigo, fase_actual, fases , color_nombre, color_hex",
    );

  if (error) {
    throw error;
  }

  return data;
}

export async function obtenerProcesosSinAsignar() {
  const { data, error } = await supabase
    .from("vw_procesos_terminados_sin_asignar")
    .select("*");

  if (error) {
    throw error;
  }

  return data;
}

export async function obtenerColores() {
  const { data, error } = await supabase.from("vw_colores").select("*");
  if (error) {
    throw error;
  }
  return data;
}
