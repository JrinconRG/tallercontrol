import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PedidoRepository } from "../../infrastructure/pedidoRepository";

export const useAsignarPedido = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ clienteId, procesoIds, creadoPor }) =>
      PedidoRepository.asignarPedido({ clienteId, procesoIds, creadoPor }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["procesos-sin-asignar"] });
      queryClient.invalidateQueries({ queryKey: ["pedidos"] });
    },
  });
};
