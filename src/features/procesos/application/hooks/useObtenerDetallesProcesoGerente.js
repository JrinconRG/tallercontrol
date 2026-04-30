import { ProcesoRepository } from "../../infrastructure/procesoRepository";
import { useQuery } from "@tanstack/react-query";

export const useGetDetallesProcesoGerente = () => {
  const query = useQuery({
    queryKey: ["procesos-gerente"],
    queryFn: () => ProcesoRepository.getDetallesProcesosGerente(),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false,
  });

  return {
    detallesProcesoGerente: query.data ?? [],
    loading: query.isLoading,
    error: query.error,
    errorMessage: query.error?.message,
    refetch: query.refetch,
  };
};
