import { useQuery } from "@tanstack/react-query";
import { NominaRepository } from "../../infrastructure/nominaRepository";

export const useGetReporteTrabajadorNomina = (
  trabajadorId,
  fechaInicio,
  fechaFin,
  incluirPendientes,
) => {
  const query = useQuery({
    queryKey: [
      "reporte-trabajador-nomina",
      trabajadorId,
      fechaInicio,
      fechaFin,
      incluirPendientes,
    ],
    queryFn: () =>
      NominaRepository.getReporteTrabajador(
        trabajadorId,
        fechaInicio,
        fechaFin,
        incluirPendientes,
      ),
    enabled: !!trabajadorId && !!fechaInicio && !!fechaFin, // Solo ejecuta la consulta si el trabajadorId y ambas fechas están disponibles
    staleTime: 0, // No cachear resultados, siempre obtener datos frescos
    refetchOnWindowFocus: false, // No refetch al enfocar la ventana
  });

  return {
    reporteTrabajadorNomina:
      trabajadorId && fechaInicio && fechaFin ? (query.data ?? []) : [],
    loading: query.isLoading,
    error: query.error,
    errorMessage: query.error?.message,
    refetch: query.refetch,
  };
};
