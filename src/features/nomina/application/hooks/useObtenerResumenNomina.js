import { useQuery } from "@tanstack/react-query";
import { NominaRepository } from "../../infrastructure/nominaRepository";

export const useGetResumenNomina = (fechaInicio, fechaFin) => {
  const query = useQuery({
    queryKey: ["resumen-nomina", fechaInicio, fechaFin],
    queryFn: () => NominaRepository.getResumen(fechaInicio, fechaFin),
    enabled: !!fechaInicio && !!fechaFin, // Solo ejecuta la consulta si ambas fechas están disponibles
    staleTime: 0, // No cachear resultados, siempre obtener datos frescos
    refetchOnWindowFocus: false, // No refetch al enfocar la ventana
  });

  return {
    resumenNomina: fechaInicio && fechaFin ? (query.data ?? null) : null, 
    loading: query.isLoading,
    error: query.error,
    errorMessage: query.error?.message,
    refetch: query.refetch,
  };
};
