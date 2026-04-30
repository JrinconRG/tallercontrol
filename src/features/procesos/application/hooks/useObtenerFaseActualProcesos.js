import { ProcesoRepository } from "../../infrastructure/procesoRepository";
import { useQuery } from "@tanstack/react-query";

export const useObtenerFaseActualProcesos = () => {
  const query = useQuery({
    queryKey: ["fase-actual-procesos"],
    queryFn: () => ProcesoRepository.getFaseActual(),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false,
  });

  return {
    faseActualProcesos: query.data ?? [],
    loading: query.isLoading,
    error: query.error,
    errorMessage: query.error?.message,
    refetch: query.refetch,
  };
};
