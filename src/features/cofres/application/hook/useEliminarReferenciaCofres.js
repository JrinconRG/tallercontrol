import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CofreRepository } from "../../infrastructure/cofreRepository";

export const useEliminarReferenciaCofres = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (referenciaId) =>
      CofreRepository.deleteReferencia(referenciaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["referencias-cofres"] });
    },
  });
  return mutation;
};
