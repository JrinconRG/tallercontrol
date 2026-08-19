import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CofreRepository } from "../../infrastructure/cofreRepository";

export const useCrearReferenciaCofre = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ codigo, nombre, descripcion }) =>
      CofreRepository.createReferencia({ codigo, nombre, descripcion }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["referencias-cofres"] });
    },
  });
};
