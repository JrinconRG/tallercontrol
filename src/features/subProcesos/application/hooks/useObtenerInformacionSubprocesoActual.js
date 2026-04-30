import { subProcesosRepository } from "../../infrastructure/subProcesosRepository";
import { useQuery } from "@tanstack/react-query";

export const useObtenerInfoSubprocesoActual = () => {
  const query = useQuery({
    queryKey: ["informacion-subProceso-actual"],
    queryFn: () => subProcesosRepository.getInfoSubprocesoActual(),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false,
  });
  return {
    informacionSubProcesoActual: query.data ?? [],
    loading: query.isLoading,
    error: query.error,
    errorMessage: query.error?.message,
    refetch: query.refetch,
  };
};
