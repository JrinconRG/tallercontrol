import { supabase } from "../../../lib/supabase";
export const obtenerCargos = async () => {
  const { data, error } = await supabase.from("vw_cargos_activos").select("*");
  if (error) throw error;
  return data;
};
