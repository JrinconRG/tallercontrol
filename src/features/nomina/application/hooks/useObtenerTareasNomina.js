// application/hooks/useObtenerTareasNomina.js
import { useQuery } from "@tanstack/react-query";
import { NominaRepository } from "../../infrastructure/nominaRepository";

export const useGetTareasNomina = (nominaId) => {
  const query = useQuery({
    queryKey: ["tareas-nomina", nominaId],
    queryFn: () => NominaRepository.getTareasNomina(nominaId),
    enabled: !!nominaId,
    staleTime: Infinity,
  });

  return {
    tareasNomina: query.data ?? [],
    loading: query.isLoading || query.isFetching,
    error: query.error,
    errorMessage: query.error?.message,
  };
};
