import { supabase } from "../../../lib/supabase";

export async function asignarPedido({
  clienteId,
  fecha,
  totalCofres,
  estado,
  creadoPor,
  empresaId,
}) {
  const { data, error } = await supabase.rpc("sp_asignar_pedido", {
    p_cliente_id: clienteId,
    p_fecha: fecha,
    p_total_cofres: totalCofres,
    p_estado: estado,
    p_creado_por: creadoPor,
    p_empresa_id: empresaId,
  });

  if (error) {
    throw error;
  }
  return data;
}
