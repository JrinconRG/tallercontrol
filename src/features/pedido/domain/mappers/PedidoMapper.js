import { Pedido } from "../entities/Pedido";

export const pedidoMapper = (data) => {
  if (!data) return null;

  return new Pedido({
    id: data.ped_id ?? data.id,
    clienteId: data.ped_cliente_id ?? data.cliente_id ?? data.clienteId,
    fecha: data.ped_fecha ?? data.fecha,
    totalCofres: data.ped_total_cofres ?? data.total_cofres ?? data.totalCofres,
    estado: data.ped_estado ?? data.estado,
    creadoPor: data.ped_creado_por ?? data.creado_por_id ?? data.creadoPor,
    empresaId: data.ped_empresa_id ?? data.empresa_id ?? data.empresaId,
    // Propiedades mapeadas desde la vista vw_pedidos_detalle
    clienteNombre: data.cliente_nombre ?? "Sin cliente",
    clienteCelular: data.cliente_celular ?? "N/A",
    creadoPorNombre: data.creado_por_nombre ?? "Sistema",
    cofres: data.cofres_detalle || [],
  });
};
