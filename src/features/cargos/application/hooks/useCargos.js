import { useQuery } from "@tanstack/react-query";
import { cargoRepository } from "../../infrastructure/cargoRepository";

export const useCargos = () => {
  const query = useQuery({
    queryKey: ["cargos"],
    queryFn: () => cargoRepository.getCargos(),
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  return {
    cargos: query.data ?? [],
    loading: query.isLoading,
    error: query.error,
    errorMessage: query.error?.message || "Error al cargar los cargos",
  };
};
