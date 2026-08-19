import { useQuery } from "@tanstack/react-query";
import { NominaRepository } from "../../infrastructure/nominaRepository";

export const useGetHistorialNominas = () => {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["historialNominas"],
    queryFn: NominaRepository.getHistorialNominas,
    staleTime: 1000 * 60 * 5, // Guarda en caché durante 5 minutos
  });

  return {
    nominasHistoricas: data ?? [],
    loading: isLoading,
    isError,
    error,
    refetch,
  };
};
