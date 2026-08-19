import { useQuery } from "@tanstack/react-query";
import { NominaRepository } from "../../infrastructure/nominaRepository";

export const useGetDetalleNominaPreview = (fechaInicio, fechaFin) => {
  const query = useQuery({
    queryKey: ["detalle-nomina-preview", fechaInicio, fechaFin],
    queryFn: () => NominaRepository.getDetallePreview(fechaInicio, fechaFin),
    enabled: !!fechaInicio && !!fechaFin, // Solo ejecuta la consulta si ambas fechas están disponibles
    staleTime: 0, // No cachear resultados, siempre obtener datos frescos
    refetchOnWindowFocus: false, // No refetch al enfocar la ventana
  });
  return {
    detalleNominaPreview: fechaInicio && fechaFin ? (query.data ?? []) : [],
    loading: query.isLoading,
    error: query.error,
    errorMessage: query.error?.message,
    refetch: query.refetch,
  };
};
