import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi, beforeEach } from "vitest";
import PropTypes from "prop-types";
import { useObtenerReferenciasCofres } from "../../../features/cofres/application/hook/useObtenerReferenciasCofres";
import { CofreRepository } from "../../../features/cofres/infrastructure/cofreRepository";

vi.mock("../../../features/cofres/infrastructure/cofreRepository", () => ({
  CofreRepository: { getReferencias: vi.fn() },
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

describe("useObtenerReferenciasCofres Hook", () => {
  beforeEach(() => vi.clearAllMocks());

  it("Debe cargar las referencias de cofres exitosamente", async () => {
    const mockRefs = [{ id: 10, nombre: "Cofre Roble" }];
    vi.mocked(CofreRepository.getReferencias).mockResolvedValue(mockRefs);

    const { result } = renderHook(() => useObtenerReferenciasCofres(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.loading).to.be.false);

    expect(result.current.referencias).to.have.lengthOf(1);
    expect(result.current.referencias[0].nombre).to.equal("Cofre Roble");
  });

  it("Debe exponer la función refetch para recargar datos manualmente", () => {
    const { result } = renderHook(() => useObtenerReferenciasCofres(), {
      wrapper: createWrapper(),
    });
    expect(result.current.refetch).to.be.a("function");
  });
});
