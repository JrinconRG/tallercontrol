import { supabase } from "../../../lib/supabase";
export const getMatrizPrecios = async (trabajadorId) => {
  const { data, error } = await supabase.rpc("sp_matriz_precios_json", {
    p_trabajador_id: trabajadorId,
  });
  if (error) throw error;
  return data;
};

export const crearTarifa = async (trabajadorCargoId, cofreId, valor) => {
  const { error } = await supabase.rpc("sp_crear_precio", {
    p_trabajador_cargo_id: trabajadorCargoId,
    p_cofre_id: cofreId,
    p_valor: valor,
  });
  if (error) throw error;
};
