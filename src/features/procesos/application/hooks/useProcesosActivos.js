import { useQuery } from "@tanstack/react-query";

import { ProcesoRepository } from "../../infrastructure/procesoRepository";

export const useProcesosActivos = () => {
  const query = useQuery({
    queryKey: ["procesos-activos"],
    queryFn: ProcesoRepository.getActivos,
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false,
  });
  return {
    procesos: query.data ?? [],
    loading: query.isLoading,
    error: query.error?.message || "Error al cargar procesos activos",
    refetch: query.refetch,
  };
};
