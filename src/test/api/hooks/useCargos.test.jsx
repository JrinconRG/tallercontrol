import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi, beforeEach } from "vitest";
import PropTypes from "prop-types";
import { useCargos } from "../../../features/cargos/application/hooks/useCargos";
import { cargoRepository } from "../../../features/cargos/infrastructure/cargoRepository";

vi.mock("../../../features/cargos/infrastructure/cargoRepository", () => ({
  cargoRepository: { getCargos: vi.fn() },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.propTypes = { children: PropTypes.node.isRequired };
  return Wrapper;
};

describe("useCargos Hook", () => {
  beforeEach(() => vi.clearAllMocks());

  it("Debe retornar la lista de cargos y manejar el estado de carga", async () => {
    const mockCargos = [
      { id: 1, nombre: "Admin" },
      { id: 2, nombre: "Operario" },
    ];
    vi.mocked(cargoRepository.getCargos).mockResolvedValue(mockCargos);

    const { result } = renderHook(() => useCargos(), {
      wrapper: createWrapper(),
    });

    expect(result.current.loading).to.be.true;
    await waitFor(() => expect(result.current.loading).to.be.false);

    expect(result.current.cargos).to.be.an("array").with.lengthOf(2);
    expect(result.current.cargos).to.deep.equal(mockCargos);
    expect(result.current.error).to.be.null;
  });

  it("Debe retornar mensaje de error personalizado cuando falla la API", async () => {
    vi.mocked(cargoRepository.getCargos).mockRejectedValue(
      new Error("Conexión fallida"),
    );

    const { result } = renderHook(() => useCargos(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.loading).to.be.false);

    expect(result.current.error).to.not.be.null;
    expect(result.current.errorMessage).to.equal("Conexión fallida");
    expect(result.current.cargos).to.be.an("array").and.empty;
  });
});
