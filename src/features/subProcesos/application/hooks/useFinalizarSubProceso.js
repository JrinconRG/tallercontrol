import { useMutation, useQueryClient } from "@tanstack/react-query";
import { subProcesosRepository } from "../../infrastructure/subProcesosRepository";

export const useFinalizarSubProceso = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (datos) => subProcesosRepository.finishSubproceso(datos),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["informacion-subProceso-actual"],
      });
      queryClient.invalidateQueries({
        queryKey: ["historial-subprocesos-pendientes"],
      });
    },
  });
};
