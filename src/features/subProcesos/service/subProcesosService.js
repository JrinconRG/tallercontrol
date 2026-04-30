import { supabase } from "../../../lib/supabase";

export const getHistorialSubprocesosTrabajadorNoPagado = async () => {
  const { data, error } = await supabase
    .from("vw_historial_subprocesos_pendientes")
    .select("*");
  if (error) throw error;
  return data;
};

export const getInformacionSubprocesoActual = async () => {
  const { data, error } = await supabase
    .from("vw_informacion_subproceso_actual")
    .select("*");
  if (error) throw error;
  return data;
};

export async function crearSubproceso(cargoId, procesoId, trabajadorId) {
  const { error } = await supabase.rpc("sp_crear_subproceso", {
    p_cargo_id: cargoId,
    p_proceso_id: procesoId,
    p_trabajador_id: trabajadorId,
  });
  if (error) throw error;
  return true;
}

export async function finalizarSubproceso(datos) {
  // Verificación de seguridad: extraemos las propiedades del objeto 'datos'
  const { p_foto_path, p_sub_id_subproceso } = datos;

  console.log("Enviando a RPC:", { p_foto_path, p_sub_id_subproceso }); // Para que veas en consola qué viaja

  const { data, error } = await supabase.rpc("sp_finalizar_subproceso", {
    p_foto_path: p_foto_path,
    p_sub_id_subproceso: p_sub_id_subproceso,
  });

  if (error) {
    console.error("Error detallado de Supabase:", error);
    throw error;
  }
  return data;
}
