// application/hooks/useObtenerClientes.js
import { useQuery } from "@tanstack/react-query";
import { ClienteRepository } from "../../infrastructure/clienteRepository";

export const useObtenerClientes = () => {
  const query = useQuery({
    queryKey: ["clientes-activos"],
    queryFn: () => ClienteRepository.getClientesActivos(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  return {
    clientes: query.data ?? [],
    loading: query.isLoading,
    error: query.error,
    errorMessage: query.error?.message,
    refetch: query.refetch,
  };
};
