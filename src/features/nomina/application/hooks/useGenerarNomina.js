import { useMutation, useQueryClient } from "@tanstack/react-query";
import { NominaRepository } from "../../infrastructure/nominaRepository";

export const useGenerarNomina = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({ fechaInicio, fechaFin, generadaPor, ajustes }) =>
      NominaRepository.getNomina(fechaInicio, fechaFin, generadaPor, ajustes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["historialNominas"] });
      queryClient.invalidateQueries({ queryKey: ["detalleNominaGenerada"] });
      queryClient.invalidateQueries({ queryKey: ["historial-procesos"] });
    },
  });

  return {
    generarNomina: mutation.mutateAsync,
    nomina: mutation.data ?? null,
    loading: mutation.isPending || mutation.isLoading,
    error: mutation.error,
    errorMessage: mutation.error?.message,
  };
};
