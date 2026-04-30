import { trabajadorRepository } from "../../infrastructure/trabajadorRepository";
import { useQuery } from "@tanstack/react-query";

export const useTrabajadoresPorCargo = (cargoId) => {
  const query = useQuery({
    queryKey: ["trabajadores-por-cargo", cargoId],
    queryFn: () => trabajadorRepository.getTrabajadoresPorCargo(cargoId),
    enabled: !!cargoId, // solo ejecuta si cargoId es válido
    staleTime: 5 * 60 * 1000, // 5 minutos
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
