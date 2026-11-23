import { useMutation, useQueryClient } from "@tanstack/react-query";

import { trabajadorRepository } from "../../infrastructure/trabajadorRepository";

export const useDesignarCargos = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => trabajadorRepository.removeCargo(data),
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
