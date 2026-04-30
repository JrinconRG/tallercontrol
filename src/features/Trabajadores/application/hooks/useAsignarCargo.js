import { useMutation, useQueryClient } from "@tanstack/react-query";
import { trabajadorRepository } from "../../infrastructure/trabajadorRepository";

export const useAsignarCargo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => trabajadorRepository.assignCargo(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["informacion-empleados"] });
    },
  });
};
