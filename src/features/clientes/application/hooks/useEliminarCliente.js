// application/hooks/useEliminarCliente.js
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ClienteRepository } from "../../infrastructure/clienteRepository";
export const useEliminarCliente = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ClienteRepository.deleteCliente,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientes-activos"] });
    },
  });
};
