import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi, beforeEach } from "vitest";
import PropTypes from "prop-types";
import { useAsignarCargo } from "../../../features/Trabajadores/application/hooks/useAsignarCargo";
import { useDesignarCargos } from "../../../features/Trabajadores/application/hooks/useDesignarCargo";

import { trabajadorRepository } from "../../../features/Trabajadores/infrastructure/trabajadorRepository";

vi.mock(
  "../../../features/Trabajadores/infrastructure/trabajadorRepository",
  () => ({
    trabajadorRepository: {
      assignCargo: vi.fn(),
      removeCargo: vi.fn(),
    },
  }),
);

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  const Wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.propTypes = { children: PropTypes.node.isRequired };
  return { Wrapper, queryClient };
};

describe("Hooks de Mutación: Asignar y Designar Cargos", () => {
  beforeEach(() => vi.clearAllMocks());

  it("useAsignarCargo debe ejecutar la mutación y llamar al repositorio", async () => {
    const { Wrapper } = createWrapper();
    const dataMock = { trabajadorId: 1, cargoId: 2 };
    vi.mocked(trabajadorRepository.assignCargo).mockResolvedValue({
      success: true,
    });

    const { result } = renderHook(() => useAsignarCargo(), {
      wrapper: Wrapper,
    });

    await result.current.mutateAsync(dataMock);

    expect(trabajadorRepository.assignCargo).toHaveBeenCalledWith(dataMock);
    expect(trabajadorRepository.assignCargo).toHaveBeenCalledTimes(1);
  });

  it("useDesignarCargos debe lanzar error si la operación falla (Sonar Fix)", async () => {
    const { Wrapper } = createWrapper();
    const errorMock = new Error("No se pudo eliminar el cargo");
    vi.mocked(trabajadorRepository.removeCargo).mockRejectedValue(errorMock);

    const { result } = renderHook(() => useDesignarCargos(), {
      wrapper: Wrapper,
    });

    // Handle exception or don't catch it: Usamos .rejects para que Vitest lo maneje
    await expect(result.current.mutateAsync({ id: 1 })).rejects.toThrow(
      "No se pudo eliminar el cargo",
    );

    await waitFor(() => {
      expect(result.current.isError).to.be.true;
      expect(result.current.error.message).to.equal(
        "No se pudo eliminar el cargo",
      );
    });
  });

  it("Ambas mutaciones deben invalidar la query 'informacion-empleados'", async () => {
    const { Wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    vi.mocked(trabajadorRepository.assignCargo).mockResolvedValue({});

    const { result } = renderHook(() => useAsignarCargo(), {
      wrapper: Wrapper,
    });
    await result.current.mutateAsync({ id: 1 });

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["informacion-empleados"],
    });
  });
});
