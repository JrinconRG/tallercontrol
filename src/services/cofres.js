import { supabase } from "../lib/supabase";

export async function obtenerReferenciasCofre() {
  const { data, error } = await supabase
    .from("vw_referencias_cofre")
    .select("*")
    .order("rc_nombre");

  if (error) {
    console.error("Error cargando referencias:", error);
    throw error;
  }

  return data;
}
