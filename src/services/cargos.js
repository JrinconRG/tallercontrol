import { supabase } from "../lib/supabase";

export async function crearCargoTrabajador(cargoId, trabajadorId) {
  const { error } = await supabase.rpc("sp_agregar_cargo_trabajador", {
    p_trabajador_id: trabajadorId,
    p_cargo_id: cargoId,
  });

  if (error) {
    console.error("Error creando cargo para trabajador:", error);
    throw error;
  }

  return true;
}

export async function eliminarCargoTrabajador(cargoId, trabajadorId) {
  const { error } = await supabase.rpc("sp_eliminar_cargo_trabajador", {
    p_trabajador_id: trabajadorId,
    p_cargo_id: cargoId,
  });

  if (error) {
    console.error("Error eliminando cargo para trabajador:", error);
    throw error;
  }

  return true;
}

export async function obtenerCargos() {
  const { data, error } = await supabase.from("vw_cargos_activos").select("*");
  if (error) {
    throw error;
  }
  return data;
}
