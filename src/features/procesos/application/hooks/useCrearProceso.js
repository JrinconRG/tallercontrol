import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ProcesoRepository } from "../../infrastructure/procesoRepository";

export const useCrearProceso = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ referenciaId, colorId }) =>
      ProcesoRepository.crear(referenciaId, colorId),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["procesos-activos"] });
    },
  });
};
