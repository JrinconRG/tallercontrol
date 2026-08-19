import { supabase } from "../../../lib/supabase";
export async function asignarPedido({ clienteId, procesoIds, creadoPor }) {
  const { data, error } = await supabase.rpc("sp_asignar_pedido", {
    p_cliente_id: clienteId,
    p_proceso_ids: procesoIds,
    p_creado_por: creadoPor,
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function obtenerPedidos() {
  const { data, error } = await supabase.from("vw_pedidos_detalle").select("*");

  if (error) {
    throw error;
  }
  return data;
}
