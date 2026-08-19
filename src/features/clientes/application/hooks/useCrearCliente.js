// application/hooks/useCrearCliente.js
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ClienteRepository } from "../../infrastructure/clienteRepository";

export const useCrearCliente = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ClienteRepository.createCliente,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientes-activos"] });
    },
  });
};
