import { subProcesosRepository } from "../../infrastructure/subProcesosRepository";
import { useQuery } from "@tanstack/react-query";

export const useObtenerHistorialSubprocesosPendientes = () => {
  const query = useQuery({
    queryKey: ["historial-subprocesos-pendientes"],
    queryFn: () =>
      subProcesosRepository.obtenerHistorialSubprocesosPendientes(),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false,
  });

  return {
    historialSubprocesosPendientes: query.data ?? [],
    loading: query.isLoading,
    error: query.error,
    errorMessage: query.error?.message,
    refetch: query.refetch,
  };
};
