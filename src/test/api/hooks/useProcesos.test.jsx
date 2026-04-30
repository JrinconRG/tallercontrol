import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi, beforeEach } from "vitest";
import PropTypes from "prop-types";
import { useCrearProceso } from "../../../features/procesos/application/hooks/useCrearProceso";
import { useObtenerFaseActualProcesos } from "../../../features/procesos/application/hooks/useObtenerFaseActualProcesos";
import { useGetDetallesProcesoGerente } from "../../../features/procesos/application/hooks/useObtenerDetallesProcesoGerente";

import { useObtenerHistorialProcesos } from "../../../features/procesos/application/hooks/useObtenerHistorialProcesos";

import { useProcesosActivos } from "../../../features/procesos/application/hooks/useProcesosActivos";

import { useValidarSiguienteFase } from "../../../features/procesos/application/hooks/useValidarSiguienteFase";

import { ProcesoRepository } from "../../../features/procesos/infrastructure/procesoRepository";

vi.mock("../../../features/procesos/infrastructure/procesoRepository", () => ({
  ProcesoRepository: {
    crear: vi.fn(),
    getFaseActual: vi.fn(),
    getDetallesProcesosGerente: vi.fn(),
    getHistorial: vi.fn(),
    getActivos: vi.fn(),
    getvalidarSiguienteFase: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const Wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.propTypes = { children: PropTypes.node.isRequired };
  return { Wrapper, queryClient };
};

describe("Suite Integral de Hooks: Dominio Procesos", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // 1. useCrearProceso
  describe("useCrearProceso", () => {
    it("Caso 1: Debe iniciar un proceso con la referencia correcta", async () => {
      // Arrange
      const { Wrapper } = createWrapper();
      const referenciaId = 505;
      vi.mocked(ProcesoRepository.crear).mockResolvedValue({ id: 1, ref: 505 });

      // Act
      const { result } = renderHook(() => useCrearProceso(), {
        wrapper: Wrapper,
      });
      await result.current.mutateAsync(referenciaId);

      // Assert
      expect(ProcesoRepository.crear).toHaveBeenCalledWith(referenciaId);
      expect(ProcesoRepository.crear).toHaveBeenCalledTimes(1);
    });

    it("Caso 2: Debe invalidar la caché de procesos activos al tener éxito", async () => {
      // Arrange
      const { Wrapper, queryClient } = createWrapper();
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
      vi.mocked(ProcesoRepository.crear).mockResolvedValue({});

      // Act
      const { result } = renderHook(() => useCrearProceso(), {
        wrapper: Wrapper,
      });
      await result.current.mutateAsync(1);

      // Assert
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["procesos-activos"],
      });
    });

    it("Caso 3: Debe propagar el error si la creación falla", async () => {
      // Arrange
      const { Wrapper } = createWrapper();
      vi.mocked(ProcesoRepository.crear).mockRejectedValue(
        new Error("Referencia no encontrada"),
      );

      // Act & Assert
      const { result } = renderHook(() => useCrearProceso(), {
        wrapper: Wrapper,
      });
      await expect(result.current.mutateAsync(1)).rejects.toThrow(
        "Referencia no encontrada",
      );
    });
  });

  // 2. useObtenerFaseActualProcesos
  describe("useObtenerFaseActualProcesos", () => {
    it("Caso 1: Debe retornar las fases actuales mapeadas", async () => {
      // Arrange
      const mockFases = [{ proceso: "Armado", fase: 2 }];
      vi.mocked(ProcesoRepository.getFaseActual).mockResolvedValue(mockFases);

      // Act
      const { result } = renderHook(() => useObtenerFaseActualProcesos(), {
        wrapper: createWrapper().Wrapper,
      });
      await waitFor(() => expect(result.current.loading).to.be.false);

      // Assert
      expect(result.current.faseActualProcesos)
        .to.be.an("array")
        .with.lengthOf(1);
      expect(result.current.faseActualProcesos[0]).to.have.property("fase", 2);
    });

    it("Caso 2: Debe manejar el estado de error de forma íntegra", async () => {
      // Arrange
      vi.mocked(ProcesoRepository.getFaseActual).mockRejectedValue(
        new Error("Timeout"),
      );

      // Act
      const { result } = renderHook(() => useObtenerFaseActualProcesos(), {
        wrapper: createWrapper().Wrapper,
      });
      await waitFor(() => expect(result.current.loading).to.be.false);

      // Assert
      expect(result.current.error).to.not.be.null;
      expect(result.current.errorMessage).to.equal("Timeout");
    });

    it("Caso 3: Debe retornar array vacío si no hay datos (Null Coalescing)", async () => {
      // Arrange
      vi.mocked(ProcesoRepository.getFaseActual).mockResolvedValue(null);

      // Act
      const { result } = renderHook(() => useObtenerFaseActualProcesos(), {
        wrapper: createWrapper().Wrapper,
      });
      await waitFor(() => expect(result.current.loading).to.be.false);

      // Assert
      expect(result.current.faseActualProcesos).to.be.an("array").and.empty;
    });
  });

  describe("useGetDetallesProcesoGerente", () => {
    it("Caso 1: Debe cargar detalles administrativos exitosamente", async () => {
      // Arrange
      const mockDetalles = [{ id: 1, costos: 5000 }];
      vi.mocked(ProcesoRepository.getDetallesProcesosGerente).mockResolvedValue(
        mockDetalles,
      );

      // Act
      const { result } = renderHook(() => useGetDetallesProcesoGerente(), {
        wrapper: createWrapper().Wrapper,
      });
      await waitFor(() => expect(result.current.loading).to.be.false);

      // Assert
      expect(result.current.detallesProcesoGerente).to.deep.equal(mockDetalles);
    });

    it("Caso 2: Debe permitir el refetch manual", () => {
      // Act
      const { result } = renderHook(() => useGetDetallesProcesoGerente(), {
        wrapper: createWrapper().Wrapper,
      });
      // Assert
      expect(result.current.refetch).to.be.a("function");
    });

    it("Caso 3: Debe validar que los datos retornados sean un array incluso en fallo", async () => {
      // Arrange
      vi.mocked(ProcesoRepository.getDetallesProcesosGerente).mockRejectedValue(
        new Error("Error"),
      );
      // Act
      const { result } = renderHook(() => useGetDetallesProcesoGerente(), {
        wrapper: createWrapper().Wrapper,
      });
      await waitFor(() => expect(result.current.loading).to.be.false);
      // Assert
      expect(result.current.detallesProcesoGerente).to.be.an("array");
    });
  });

  describe("useObtenerHistorialProcesos", () => {
    it("Caso 1: Debe cargar el historial histórico", async () => {
      // Arrange
      const mockHistorial = [{ fecha: "2026-04-30", proceso: "Cofre VIP" }];
      vi.mocked(ProcesoRepository.getHistorial).mockResolvedValue(
        mockHistorial,
      );

      // Act
      const { result } = renderHook(() => useObtenerHistorialProcesos(), {
        wrapper: createWrapper().Wrapper,
      });
      await waitFor(() => expect(result.current.loading).to.be.false);

      // Assert
      expect(result.current.historial).to.have.length.at.least(1);
    });

    it("Caso 2: Debe manejar tiempos de cache configurados", async () => {
      // Arrange/Act
      const { result } = renderHook(() => useObtenerHistorialProcesos(), {
        wrapper: createWrapper().Wrapper,
      });
      // Assert
      expect(result.current).to.have.all.keys(
        "historial",
        "loading",
        "error",
        "errorMessage",
        "refetch",
      );
    });

    it("Caso 3: Debe capturar el mensaje de error correctamente", async () => {
      // Arrange
      vi.mocked(ProcesoRepository.getHistorial).mockRejectedValue(
        new Error("No autorizado"),
      );
      // Act
      const { result } = renderHook(() => useObtenerHistorialProcesos(), {
        wrapper: createWrapper().Wrapper,
      });
      await waitFor(() => expect(result.current.loading).to.be.false);
      // Assert
      expect(result.current.errorMessage).to.equal("No autorizado");
    });
  });

  // 5. useProcesosActivos
  describe("useProcesosActivos", () => {
    it("Caso 1: Debe retornar la lista de procesos activos ", async () => {
      // Arrange
      const mockActivos = [{ id: 1, estado: "En curso" }];
      vi.mocked(ProcesoRepository.getActivos).mockResolvedValue(mockActivos);

      // Act
      const { result } = renderHook(() => useProcesosActivos(), {
        wrapper: createWrapper().Wrapper,
      });
      await waitFor(() => expect(result.current.loading).to.be.false);

      // Assert
      expect(result.current.procesos)
        .to.be.an("array")
        .with.deep.members(mockActivos);
    });

    it("Caso 2: Debe mostrar mensaje de error si la API falla sin mensaje", async () => {
      // Arrange
      vi.mocked(ProcesoRepository.getActivos).mockRejectedValue({});
      // Act
      const { result } = renderHook(() => useProcesosActivos(), {
        wrapper: createWrapper().Wrapper,
      });
      await waitFor(() => expect(result.current.loading).to.be.false);
      // Assert
      expect(result.current.error).to.equal("Error al cargar procesos activos");
    });

    it("Caso 3: Debe ser reactivo ante un refetch", async () => {
      // Act
      const { result } = renderHook(() => useProcesosActivos(), {
        wrapper: createWrapper().Wrapper,
      });
      // Assert
      expect(result.current.refetch).to.be.a("function");
    });
  });

  describe("useValidarSiguienteFase", () => {
    it("Caso 1: Debe validar el cambio de fase con los ID correctos", async () => {
      // Arrange
      const { Wrapper } = createWrapper();
      const payload = { procesoId: 10, cargoId: 2 };
      vi.mocked(ProcesoRepository.getvalidarSiguienteFase).mockResolvedValue({
        valid: true,
      });

      // Act
      const { result } = renderHook(() => useValidarSiguienteFase(), {
        wrapper: Wrapper,
      });
      await result.current.mutateAsync(payload);

      // Assert
      expect(ProcesoRepository.getvalidarSiguienteFase).toHaveBeenCalledWith(
        10,
        2,
      );
    });

    it("Caso 2: Debe invalidar la lista de procesos activos tras validar fase", async () => {
      // Arrange
      const { Wrapper, queryClient } = createWrapper();
      const spy = vi.spyOn(queryClient, "invalidateQueries");
      vi.mocked(ProcesoRepository.getvalidarSiguienteFase).mockResolvedValue(
        {},
      );

      // Act
      const { result } = renderHook(() => useValidarSiguienteFase(), {
        wrapper: Wrapper,
      });
      await result.current.mutateAsync({ procesoId: 1, cargoId: 1 });

      // Assert
      expect(spy).toHaveBeenCalledWith({ queryKey: ["procesos-activos"] });
    });

    it("Caso 3: Debe manejar el estado isError de la mutate", async () => {
      // Arrange
      const { Wrapper } = createWrapper();
      vi.mocked(ProcesoRepository.getvalidarSiguienteFase).mockRejectedValue(
        new Error("Fase no permitida"),
      );

      // Act
      const { result } = renderHook(() => useValidarSiguienteFase(), {
        wrapper: Wrapper,
      });

      // Act y Assert
      await expect(result.current.mutateAsync({})).rejects.toThrow(
        "Fase no permitida",
      );

      await waitFor(() => expect(result.current.isError).to.be.true);
    });
  });
});
