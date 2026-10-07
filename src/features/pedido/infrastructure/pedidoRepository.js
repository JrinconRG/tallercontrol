import { asignarPedido, obtenerPedidos } from "../service/pedidoService";
import { pedidosErrorMap } from "./errors/pedidosErrorMap";
import { mapSupabaseError } from "../../../shared/errors/mapSupabaseError";
import { pedidoMapper } from "../domain/mappers/PedidoMapper";
export const PedidoRepository = {
  async asignarPedido({ clienteId, procesoIds, creadoPor }) {
    try {
      const pedidoId = await asignarPedido({
        clienteId,
        procesoIds,
        creadoPor,
      });
      return pedidoId;
    } catch (error) {
      throw mapSupabaseError(error, pedidosErrorMap);
    }
  },

  async getPedidos() {
    try {
      const data = await obtenerPedidos();

      return (data || []).map((pedido) => pedidoMapper(pedido));
    } catch (error) {
      throw mapSupabaseError(error, pedidosErrorMap);
    }
  },
};
