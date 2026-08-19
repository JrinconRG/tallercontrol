import { supabase } from "../../../lib/supabase";

export async function obtenerReferenciasCofre() {
  const { data, error } = await supabase
    .from("vw_referencias_cofre")
    .select("*")
    .order("rc_nombre");

  if (error) {
    throw error;
  }

  return data;
}

export async function crearReferenciaCofre({ codigo, nombre, descripcion }) {
  const { data, error } = await supabase.rpc("sp_crear_referencia_cofre", {
    p_codigo: codigo,
    p_nombre: nombre,
    p_descripcion: descripcion ?? null,
  });
  if (error) {
    throw error;
  }

  return data; //tipo fila  rc_id
}

export async function eliminarReferenciaCofre(referenciaId) {
  const { error } = await supabase.rpc("sp_eliminar_referencia_cofre", {
    p_referencia_id: referenciaId,
  });
  if (error) {
    throw error;
  }
}
