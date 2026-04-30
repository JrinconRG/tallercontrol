import { trabajadorRepository } from "../../infrastructure/trabajadorRepository";
import { useQuery } from "@tanstack/react-query";

export const useTrabajadoresSelect = () => {
  const query = useQuery({
    queryKey: ["trabajadores-select"],
    queryFn: () => trabajadorRepository.getTrabajadorSelect(),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false,
  });
  return {
    trabajadoresSelect: query.data ?? [],
    loading: query.isLoading,
    error: query.error,
    errorMessage:
      query.error?.message || "Error al cargar trabajadores para select",
    refetch: query.refetch,
  };
};
