import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ProcesoRepository } from "../../infrastructure/procesoRepository";

export const useValidarSiguienteFase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ procesoId, cargoId }) =>
      ProcesoRepository.getvalidarSiguienteFase(procesoId, cargoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["procesos-activos"] });
    },
  });
};
