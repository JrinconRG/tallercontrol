import { Pedido } from "../../domain/entities/Pedido";

export class PedidoMapper {
  static toDomain(raw) {
    if (!raw) return null;
    return new Pedido({
      id: raw.ped_id ?? raw.id,
      clienteId: raw.ped_cliente_id ?? raw.cliente_id,
      fecha: raw.ped_fecha ?? raw.fecha,
      totalCofres: raw.ped_total_cofres ?? raw.total_cofres,
      estado: raw.ped_estado ?? raw.estado,
      creadoPor: raw.ped_creado_por ?? raw.creado_por,
      empresaId: raw.ped_empresa_id ?? raw.empresa_id,
    });
  }

  static toPersistence(pedido) {
    return {
      ped_cliente_id: pedido.clienteId,
      ped_fecha: pedido.fecha,
      ped_total_cofres: pedido.totalCofres,
      ped_estado: pedido.estado,
      ped_creado_por: pedido.creadoPor,
      ped_empresa_id: pedido.empresaId,
    };
  }
}
