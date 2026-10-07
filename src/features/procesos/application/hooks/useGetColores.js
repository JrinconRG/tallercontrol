import { ProcesoRepository } from "../../infrastructure/procesoRepository";
import { useQuery } from "@tanstack/react-query";

export const useGetColores = () => {
  const query = useQuery({
    queryKey: ["colores"],
    queryFn: () => ProcesoRepository.getColores(),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false,
  });

  return {
    colores: query.data ?? [],
    loading: query.isLoading,
    error: query.error,
    errorMessage: query.error?.message,
    refetch: query.refetch,
  };
};
