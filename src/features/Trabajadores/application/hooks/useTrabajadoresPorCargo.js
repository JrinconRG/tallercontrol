import { trabajadorRepository } from "../../infrastructure/trabajadorRepository";
import { useQuery } from "@tanstack/react-query";

export const useTrabajadoresPorCargo = (cargoId, referenciaId) => {
  const query = useQuery({
    queryKey: ["trabajadores-por-cargo", cargoId, referenciaId],
    queryFn: () =>
      trabajadorRepository.getTrabajadoresPorCargo(cargoId, referenciaId),
    enabled: !!cargoId && !!referenciaId,
    staleTime: 30 * 1000, // 30 segundos
    gcTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false,
  });
  return {
    trabajadoresPorCargo: query.data ?? [],
    loading: query.isLoading,
    error: query.error,
    errorMessage: query.error?.message,
    refetch: query.refetch,
  };
};
