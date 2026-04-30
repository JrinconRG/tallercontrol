import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useGuardarTarifas } from "../../../features/tarifas/application/hooks/useGuardarTarifas";
import { useObtenerTarifas } from "../../../features/tarifas/application/hooks/useObtenerTarifas";

import { tarifaRepository } from "../../../features/tarifas/infrastructure/tarifasRepository";
import PropTypes from "prop-types";

vi.mock("../../../features/tarifas/infrastructure/tarifasRepository", () => ({
  tarifaRepository: {
    getMatrizPrecios: vi.fn(),
    guardarCambios: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const Wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  Wrapper.propTypes = {
    children: PropTypes.node.isRequired,
  };

  return Wrapper;
};
describe("Hooks de Tarifas - Suite de Pruebas de Calidad", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("useObtenerTarifas", () => {
    it("Debe retornar la estructura completa de datos al cargar exitosamente", async () => {
      // Arrange
      const mockData = {
        cargos: [{ id: 1, nombre: "Soldador" }],
        referencias: [{ id: 101, nombre: "Cofre Madera" }],
        precios: { "1-101": 15000 },
      };
      vi.mocked(tarifaRepository.getMatrizPrecios).mockResolvedValue(mockData);

      // Act
      const { result } = renderHook(() => useObtenerTarifas(21), {
        wrapper: createWrapper(),
      });

      expect(result.current.loading).to.be.true;
      expect(result.current.cargos).to.be.an("array").and.empty;

      await waitFor(() => expect(result.current.loading).to.be.false);

      // Assert
      expect(result.current.cargos).to.have.lengthOf(1);
      expect(result.current.cargos[0]).to.include({
        id: 1,
        nombre: "Soldador",
      });
      expect(result.current.referencias[0].nombre).to.equal("Cofre Madera");
      expect(result.current.precios).to.have.property("1-101", 15000);
      expect(result.current.error).to.be.null;
    });

    it("Debe manejar el estado de error de forma íntegra", async () => {
      // Arrange
      const apiError = new Error("Falla de conexión a Supabase");
      vi.mocked(tarifaRepository.getMatrizPrecios).mockRejectedValue(apiError);

      // Act
      const { result } = renderHook(() => useObtenerTarifas(21), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.loading).to.be.false);

      // Assert
      expect(result.current.error).to.not.be.null;
      expect(result.current.error).to.be.instanceOf(Error);
      expect(result.current.errorMessage).to.equal(
        "Falla de conexión a Supabase",
      );

      expect(result.current.cargos).to.be.an("array");
    });
  });

  describe("useGuardarTarifas", () => {
    it("Debe ejecutar la mute y validar q se envian bien los parametros ", async () => {
      // Arrange
      const cambiosMock = { 1: 5000, 2: 8000 };
      vi.mocked(tarifaRepository.guardarCambios).mockResolvedValue({
        status: 200,
      });

      const { result } = renderHook(() => useGuardarTarifas(21), {
        wrapper: createWrapper(),
      });

      // Act
      await result.current.mutateAsync(cambiosMock);

      // Assert
      expect(tarifaRepository.guardarCambios).toHaveBeenCalledTimes(1);
      expect(tarifaRepository.guardarCambios).toHaveBeenCalledWith(cambiosMock);
    });

    it("Debe manejar excepciones en la mutacion sin capturas vacias", async () => {
      // Arrange
      const exception = new Error("DB Constraint Error");
      vi.mocked(tarifaRepository.guardarCambios).mockRejectedValue(exception);

      const { result } = renderHook(() => useGuardarTarifas(1), {
        wrapper: createWrapper(),
      });

      // Act & Assert (Sonar: No dejar el catch vacío o manejarlo explícitamente)
      await expect(result.current.mutateAsync({})).rejects.toThrow(
        "DB Constraint Error",
      );

      await waitFor(() => {
        expect(result.current.isError).to.be.true;
        expect(result.current.error.message).to.equal("DB Constraint Error");
      });
    });
  });
});
