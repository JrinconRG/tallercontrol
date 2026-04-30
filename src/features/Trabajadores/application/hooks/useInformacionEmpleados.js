import { trabajadorRepository } from "../../infrastructure/trabajadorRepository";
import { useQuery } from "@tanstack/react-query";

export const useInformacionEmpleados = () => {
  const query = useQuery({
    queryKey: ["informacion-empleados"],
    queryFn: trabajadorRepository.getInfoEmpleados,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false,
  });
  return {
    empleados: query.data ?? [],
    loading: query.isLoading,
    error: query.error ?? null,
    errorMessage:
      query.error?.message || "Error al cargar información de empleados",
  };
};
