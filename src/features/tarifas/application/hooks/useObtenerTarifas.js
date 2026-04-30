import { useQuery } from "@tanstack/react-query";
import { tarifaRepository } from "../../infrastructure/tarifasRepository";

export const useObtenerTarifas = (trabajadorId) => {
  const query = useQuery({
    queryKey: ["tarifas", trabajadorId],
    queryFn: () => tarifaRepository.getMatrizPrecios(trabajadorId),
    enabled: !!trabajadorId, // solo ejecuta si hay trabajadorId
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false,
  });

  return {
    cargos: query.data?.cargos || [],
    referencias: query.data?.referencias || [],
    precios: query.data?.precios || {},
    loading: query.isLoading,
    error: query.error,
    errorMessage: query.error?.message || "Error al cargar tarifas",
  };
};
