import { useMutation, useQueryClient } from "@tanstack/react-query";
import { NominaRepository } from "../../infrastructure/nominaRepository";

export const useGenerarNomina = () => {
  const mutation = useMutation({
    mutationFn: ({ fechaInicio, fechaFin, generadaPor, ajustes }) =>
      NominaRepository.getNomina(fechaInicio, fechaFin, generadaPor, ajustes),
    onSuccess: () => {
      useQueryClient.invalidateQueries({ queryKey: ["historialNominas"] });
      useQueryClient.invalidateQueries({ queryKey: ["detalleNominaGenerada"] });
      useQueryClient.invalidateQueries({ queryKey: ["historial-procesos"] });
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
