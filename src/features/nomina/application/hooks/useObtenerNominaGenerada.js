import { useQuery } from "@tanstack/react-query";
import { NominaRepository } from "../../infrastructure/nominaRepository";

export const useGetDetalleNominaGenerada = (nominaId) => {
  const query = useQuery({
    queryKey: ["detalle-nomina-generada", nominaId],
    queryFn: () => {
      return NominaRepository.getDetalleGenerada(nominaId);
    },
    enabled: !!nominaId,
    staleTime: Infinity,
  });

  return {
    detalleNominaGenerada: query.data ?? null,
    loading: query.isLoading || query.isFetching,
    error: query.error,
    errorMessage: query.error?.message,
  };
};
