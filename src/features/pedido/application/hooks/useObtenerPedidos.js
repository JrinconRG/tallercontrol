import { useQuery } from "@tanstack/react-query";
import { PedidoRepository } from "../../infrastructure/pedidoRepository";

export const useObtenerPedidos = () => {
  const {
    data: pedidos = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["pedidos"],
    queryFn: PedidoRepository.getPedidos,
  });

  return {
    pedidos,
    loading: isLoading,
    error: isError,
    errorMessage: error?.message || null,
  };
};
