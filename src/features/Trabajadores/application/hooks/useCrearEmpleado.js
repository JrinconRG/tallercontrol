import { useMutation, useQueryClient } from "@tanstack/react-query";
import { trabajadorRepository } from "../../infrastructure/trabajadorRepository";

export const useCrearTrabajador = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (datos) => trabajadorRepository.createEmpleado(datos),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["informacion-empleados"] });
    },
  });
};
