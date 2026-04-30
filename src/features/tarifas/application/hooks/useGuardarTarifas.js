import { useMutation, useQueryClient } from "@tanstack/react-query";
import { tarifaRepository } from "../../infrastructure/tarifasRepository";

export const useGuardarTarifas = (trabajadorId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cambios) => tarifaRepository.guardarCambios(cambios),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tarifas", trabajadorId] });
    },
  });
};
