import { ProcesoRepository } from "../../infrastructure/procesoRepository";
import { useQuery } from "@tanstack/react-query";

export const useGetProcesosSinAsignar = () => {
  const query = useQuery({
    queryKey: ["procesos-sin-asignar"],
    queryFn: () => ProcesoRepository.getProcesosSinAsignar(),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false,
  });

  return {
    procesosSinAsignar: query.data ?? [],
    loading: query.isLoading,
    error: query.error,
    errorMessage: query.error?.message,
    refetch: query.refetch,
  };
};
