import { useMutation, useQueryClient } from "@tanstack/react-query";
import { trabajadorRepository } from "../../infrastructure/trabajadorRepository";

export const useEliminarTrabajador = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: trabajadorRepository.deleteEmpleado,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [
          "informacion-empleados",
          "trabajadores-select",
          "trabajadores-por-cargo",
        ],
      });
    },
  });
};
