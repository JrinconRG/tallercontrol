import { useQuery } from "@tanstack/react-query";
import { NominaRepository } from "../../infrastructure/nominaRepository";

export const useGetDetalleNominaGenerada = (nominaId) => {
  console.log("hook ejecutado con nominaId:", nominaId);

  const query = useQuery({
    queryKey: ["detalle-nomina-generada", nominaId],
    queryFn: () => {
      console.log("queryFn ejecutada con nominaId:", nominaId);
      return NominaRepository.getDetalleGenerada(nominaId);
    },
    enabled: !!nominaId,
    staleTime: Infinity,
  });

  console.log("query.status:", query.status, "query.data:", query.data);
  console.log("query.error:", query.error);

  return {
    detalleNominaGenerada: query.data ?? null,
    loading: query.isLoading || query.isFetching,
    error: query.error,
    errorMessage: query.error?.message,
  };
};
