import { useMutation, useQueryClient } from "@tanstack/react-query";
import { trabajadorRepository } from "../../infrastructure/trabajadorRepository";

export const useEliminarTrabajador = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: trabajadorRepository.deleteEmpleado,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["informacion-empleados"] }),
        queryClient.invalidateQueries({ queryKey: ["trabajadores-select"] }),
        queryClient.invalidateQueries({ queryKey: ["trabajadores-por-cargo"] }),
      ]);
    },
  });
};
