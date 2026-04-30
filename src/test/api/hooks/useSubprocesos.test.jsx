import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi, beforeEach } from "vitest";
import PropTypes from "prop-types";
import { useCrearSubproceso } from "../../../features/subProcesos/application/hooks/useCrearSubProceso";
import { useFinalizarSubProceso } from "../../../features/subProcesos/application/hooks/useFinalizarSubProceso";
import { useObtenerHistorialSubprocesosPendientes } from "../../../features/subProcesos/application/hooks/useObtenerHistorialSubprocesosPendientes";
import { useObtenerInfoSubprocesoActual } from "../../../features/subProcesos/application/hooks/useObtenerInformacionSubprocesoActual";

import { subProcesosRepository } from "../../../features/subProcesos/infrastructure/subProcesosRepository";

vi.mock(
  "../../../features/subProcesos/infrastructure/subProcesosRepository",
  () => ({
    subProcesosRepository: {
      createSubproceso: vi.fn(),
      finishSubproceso: vi.fn(),
      obtenerHistorialSubprocesosPendientes: vi.fn(),
      getInfoSubprocesoActual: vi.fn(),
    },
  }),
);

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
  Wrapper.propTypes = { children: PropTypes.node.isRequired };
  return { Wrapper, queryClient };
};

describe("Hooks de Dominio: Subprocesos", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("useCrearSubproceso", () => {
    it("Caso 1: Debe crear subproceso con los IDs correctos (Happy Path)", async () => {
      const { Wrapper } = createWrapper();
      const params = { cargoId: 1, procesoId: 2, trabajadorId: 3 };
      vi.mocked(subProcesosRepository.createSubproceso).mockResolvedValue({
        id: 100,
      });

      const { result } = renderHook(() => useCrearSubproceso(), {
        wrapper: Wrapper,
      });
      await result.current.mutateAsync(params);

      expect(subProcesosRepository.createSubproceso).toHaveBeenCalledWith(
        1,
        2,
        3,
      );
    });

    it("Caso 2: Debe invalidar 'informacion-subProceso-actual' tras éxito", async () => {
      const { Wrapper, queryClient } = createWrapper();
      const spy = vi.spyOn(queryClient, "invalidateQueries");
      vi.mocked(subProcesosRepository.createSubproceso).mockResolvedValue({});

      const { result } = renderHook(() => useCrearSubproceso(), {
        wrapper: Wrapper,
      });
      await result.current.mutateAsync({});

      expect(spy).toHaveBeenCalledWith({
        queryKey: ["informacion-subProceso-actual"],
      });
    });

    it("Caso 3: Debe fallar si el repositorio arroja una excepción", async () => {
      const { Wrapper } = createWrapper();
      vi.mocked(subProcesosRepository.createSubproceso).mockRejectedValue(
        new Error("Error DB"),
      );

      const { result } = renderHook(() => useCrearSubproceso(), {
        wrapper: Wrapper,
      });

      await expect(result.current.mutateAsync({})).rejects.toThrow("Error DB");
    });
  });

  // --- 2. useFinalizarSubProceso ---
  describe("useFinalizarSubProceso", () => {
    it("Caso 1: Debe enviar los datos de finalización correctamente", async () => {
      const { Wrapper } = createWrapper();
      const datos = { subprocesoId: 50, observacion: "OK" };
      vi.mocked(subProcesosRepository.finishSubproceso).mockResolvedValue(true);

      const { result } = renderHook(() => useFinalizarSubProceso(), {
        wrapper: Wrapper,
      });
      await result.current.mutateAsync(datos);

      expect(subProcesosRepository.finishSubproceso).toHaveBeenCalledWith(
        datos,
      );
    });

    it("Caso 2: Debe invalidar AMBAS queries (actual y historial) al finalizar", async () => {
      const { Wrapper, queryClient } = createWrapper();
      const spy = vi.spyOn(queryClient, "invalidateQueries");
      vi.mocked(subProcesosRepository.finishSubproceso).mockResolvedValue({});

      const { result } = renderHook(() => useFinalizarSubProceso(), {
        wrapper: Wrapper,
      });
      await result.current.mutateAsync({});

      expect(spy).toHaveBeenCalledWith({
        queryKey: ["informacion-subProceso-actual"],
      });
      expect(spy).toHaveBeenCalledWith({
        queryKey: ["historial-subprocesos-pendientes"],
      });
    });

    it("Caso 3: Debe registrar el estado 'isError' cuando la mutación falla", async () => {
      const { Wrapper } = createWrapper();
      vi.mocked(subProcesosRepository.finishSubproceso).mockRejectedValue(
        new Error("API Down"),
      );

      const { result } = renderHook(() => useFinalizarSubProceso(), {
        wrapper: Wrapper,
      });

      try {
        await result.current.mutateAsync({});
      } catch (e) {
        /* ignore */
      }

      await waitFor(() => expect(result.current.isError).to.be.true);
    });
  });

  // --- 3. useObtenerHistorialSubprocesosPendientes ---
  describe("useObtenerHistorialSubprocesosPendientes", () => {
    it("Caso 1: Debe retornar el historial vacío por defecto", async () => {
      vi.mocked(
        subProcesosRepository.obtenerHistorialSubprocesosPendientes,
      ).mockResolvedValue([]);
      const { result } = renderHook(
        () => useObtenerHistorialSubprocesosPendientes(),
        { wrapper: createWrapper().Wrapper },
      );

      await waitFor(() => expect(result.current.loading).to.be.false);
      expect(result.current.historialSubprocesosPendientes).to.be.an("array")
        .and.empty;
    });

    it("Caso 2: Debe mapear los datos del historial correctamente", async () => {
      const mockHistorial = [{ id: 1, estado: "Pendiente" }];
      vi.mocked(
        subProcesosRepository.obtenerHistorialSubprocesosPendientes,
      ).mockResolvedValue(mockHistorial);

      const { result } = renderHook(
        () => useObtenerHistorialSubprocesosPendientes(),
        { wrapper: createWrapper().Wrapper },
      );

      await waitFor(() =>
        expect(result.current.historialSubprocesosPendientes).to.have.lengthOf(
          1,
        ),
      );
      expect(result.current.historialSubprocesosPendientes[0].estado).to.equal(
        "Pendiente",
      );
    });

    it("Caso 3: Debe exponer la propiedad 'errorMessage' ante fallos", async () => {
      vi.mocked(
        subProcesosRepository.obtenerHistorialSubprocesosPendientes,
      ).mockRejectedValue(new Error("Timeout"));
      const { result } = renderHook(
        () => useObtenerHistorialSubprocesosPendientes(),
        { wrapper: createWrapper().Wrapper },
      );

      await waitFor(() => expect(result.current.loading).to.be.false);
      expect(result.current.errorMessage).to.equal("Timeout");
    });
  });

  // --- 4. useObtenerInfoSubprocesoActual ---
  describe("useObtenerInfoSubprocesoActual", () => {
    it("Caso 1: Debe cargar la información del subproceso actual", async () => {
      const mockInfo = { id: 5, nombre: "Proceso A" };
      vi.mocked(
        subProcesosRepository.getInfoSubprocesoActual,
      ).mockResolvedValue(mockInfo);

      const { result } = renderHook(() => useObtenerInfoSubprocesoActual(), {
        wrapper: createWrapper().Wrapper,
      });

      await waitFor(() => expect(result.current.loading).to.be.false);
      expect(result.current.informacionSubProcesoActual).to.deep.equal(
        mockInfo,
      );
    });

    it("Caso 2: Debe manejar el estado de loading inicial", () => {
      const { result } = renderHook(() => useObtenerInfoSubprocesoActual(), {
        wrapper: createWrapper().Wrapper,
      });
      expect(result.current.loading).to.be.true;
    });

    it("Caso 3: Debe retornar un array vacío si la data es null (coalescencia)", async () => {
      vi.mocked(
        subProcesosRepository.getInfoSubprocesoActual,
      ).mockResolvedValue(null);
      const { result } = renderHook(() => useObtenerInfoSubprocesoActual(), {
        wrapper: createWrapper().Wrapper,
      });

      await waitFor(() => expect(result.current.loading).to.be.false);
      expect(result.current.informacionSubProcesoActual).to.be.an("array").and
        .empty;
    });
  });
});
