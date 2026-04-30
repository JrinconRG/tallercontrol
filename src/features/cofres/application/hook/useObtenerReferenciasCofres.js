import { useQuery } from "@tanstack/react-query";

import { CofreRepository } from "../../infrastructure/cofreRepository";

export const useObtenerReferenciasCofres = () => {
  const query = useQuery({
    queryKey: ["referencias-cofres"],
    queryFn: () => CofreRepository.getReferencias(),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false,
  });

  return {
    referencias: query.data ?? [],
    loading: query.isLoading,
    error: query.error,
    errorMessage: query.error?.message,
    refetch: query.refetch,
  };
};
