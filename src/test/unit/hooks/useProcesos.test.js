import * as ProcesosService from "../../../services/procesos";
import { waitFor, renderHook } from "@testing-library/react";
import { describe, expect, vi } from "vitest";
import { act } from "react";

import {
  useDetalleProcesos,
  useProcesosActivos,
  useHistorialProcesos,
  useFaseActualProcesos,
} from "../../../hooks/useProcesos";
vi.mock("../../../services/procesos", () => ({
  obtenerProcesosActivos: vi.fn(),
  obtenerFaseActualProcesos: vi.fn(),
  obtenerHistorialProcesos: vi.fn(),
  obtenerDetallesProcesosGerente: vi.fn(),
}));

describe("Test hook useHistorialProcesos", () => {
  const mockHistorial = [
    {
      id: 1,
      detalle_subprocesos: '[{"nombre": "Pintado"}]', // Caso String JSON
    },
  ];

  test("useHistorialProcesos - Camino Success y Parseo JSON", async () => {
    // Arrange
    ProcesosService.obtenerHistorialProcesos.mockResolvedValue(mockHistorial);

    // Act
    const { result } = renderHook(() => useHistorialProcesos());

    // Assert
    await waitFor(() => {
      // Verificamos que el string se convirtió en objeto
      expect(result.current.historial[0].detalle_subprocesos).toEqual([
        { nombre: "Pintado" },
      ]);
      expect(result.current.loading).toBe(false);
    });
  });

  test("useHistorialProcesos - Camino cuando ya es Array", async () => {
    // Arrange: Caso donde el backend ya manda el array listo
    const mockArray = [{ id: 2, detalle_subprocesos: [] }];
    ProcesosService.obtenerHistorialProcesos.mockResolvedValue(mockArray);

    // Act
    const { result } = renderHook(() => useHistorialProcesos());

    // Assert
    await waitFor(() => {
      expect(
        Array.isArray(result.current.historial[0].detalle_subprocesos),
      ).toBe(true);
    });
  });
});

describe("Test hook useProcesosActivos", () => {
  test("useProcesosActivos - Camino Success y Refetch", async () => {
    // Arrange
    const datosMock = [{ id: 1, nombre: "Proceso A" }];
    ProcesosService.obtenerProcesosActivos.mockResolvedValue(datosMock);

    // Act
    const { result } = renderHook(() => useProcesosActivos());

    // Assert Success
    await waitFor(() => {
      expect(result.current.procesos).toEqual(datosMock);
      expect(result.current.loading).toBe(false);
    });

    // Act Refetch
    await act(async () => {
      await result.current.refetch();
    });

    // Assert Refetch
    expect(ProcesosService.obtenerProcesosActivos).toHaveBeenCalledTimes(2);
  });

  test("useProcesosActivos - Camino Catch (Error)", async () => {
    // Arrange
    ProcesosService.obtenerProcesosActivos.mockRejectedValue(
      new Error("Fallo API"),
    );

    // Act
    const { result } = renderHook(() => useProcesosActivos());

    // Assert
    await waitFor(() => {
      expect(result.current.error).toBe("Fallo API");
      expect(result.current.loading).toBe(false);
    });
  });
});

describe("Test hooks de Detalle y Fase", () => {
  test("useDetalleProcesos - Manejo de datos nulos", async () => {
    // Arrange: Simulamos que la API devuelve null para probar el "|| []"
    ProcesosService.obtenerDetallesProcesosGerente.mockResolvedValue(null);

    // Act
    const { result } = renderHook(() => useDetalleProcesos());

    // Assert
    await waitFor(() => {
      expect(result.current.procesosDetalle).toEqual([]);
      expect(result.current.loading).toBe(false);
    });
  });

  test("useFaseActualProcesos - Camino Finally", async () => {
    // Arrange: Promesa que tarda para ver el loading
    ProcesosService.obtenerFaseActualProcesos.mockReturnValue(
      new Promise((resolve) => setTimeout(() => resolve([]), 50)),
    );

    // Act
    const { result } = renderHook(() => useFaseActualProcesos());

    // Assert
    expect(result.current.loading).toBe(true); // Verificamos estado inicial
    await waitFor(() => {
      expect(result.current.loading).toBe(false); // Verificamos finally
    });
  });
});
