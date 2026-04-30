import { useMutation, useQueryClient } from "@tanstack/react-query";
import { subProcesosRepository } from "../../infrastructure/subProcesosRepository";

export const useCrearSubproceso = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cargoId, procesoId, trabajadorId }) =>
      subProcesosRepository.createSubproceso(cargoId, procesoId, trabajadorId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["informacion-subProceso-actual"],
      });
    },
  });
};
