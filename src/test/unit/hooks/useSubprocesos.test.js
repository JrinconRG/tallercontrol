import { waitFor, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, vi } from "vitest";
import * as StorageService from "../../../services/storage";

import { useImagenes } from "../../../hooks/useSubprocesos";
//generamos los mocks
vi.mock("../../../services/subprocesos", () => ({
  finalizarSubproceso: vi.fn(),
  crearSubproceso: vi.fn(),
  getInformacionSubprocesoActual: vi.fn(),
  getHistorialSubprocesosTrabajadorNoPagado: vi.fn(),
  obtenerSubprocesosTrabajador: vi.fn(),
}));

vi.mock("../../../services/storage", () => ({
  getImageUrl: vi.fn(),
}));

//setUp por defecto
beforeEach(() => {
  vi.clearAllMocks();
  vi.resetAllMocks();
});

describe("Test hook useImagenes", () => {
  test("useImagenes - Camino sin paths (Guard Clause)", async () => {
    // Act
    const { result } = renderHook(() => useImagenes(null));

    // Assert
    expect(result.current.urls).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  test("useImagenes - Camino Success con un solo path (String)", async () => {
    // Arrange
    const mockUrl = "http://imagen.com/1.jpg";
    StorageService.getImageUrl.mockResolvedValue(mockUrl);

    // Act
    const { result } = renderHook(() => useImagenes("ruta/unica.jpg"));

    // Assert
    await waitFor(() => {
      expect(result.current.urls).toEqual([mockUrl]);
      expect(result.current.url).toBe(mockUrl);
      expect(result.current.loading).toBe(false);
    });
  });

  test("useImagenes - Camino Success con array de paths", async () => {
    // 1. Arrange
    const mockPaths = ["p1.jpg", "p2.jpg"];
    const mockUrls = ["url1.jpg", "url2.jpg"];

    // IMPORTANTE: Reseteamos el mock específico para este test
    // y hacemos que devuelva una URL diferente cada vez que se llame.
    StorageService.getImageUrl
      .mockReset()
      .mockResolvedValueOnce(mockUrls[0])
      .mockResolvedValueOnce(mockUrls[1]);

    // 2. Act
    const { result } = renderHook(() => useImagenes(mockPaths));

    // 3. Assert
    // Usamos waitFor para que React procese el micro-task de la promesa
    await waitFor(() => {
      // Si esto falla con "true", es porque la promesa de arriba no se resolvió
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.urls).toEqual(mockUrls);
    expect(result.current.url).toBe(mockUrls[0]);
    expect(StorageService.getImageUrl).toHaveBeenCalledTimes(2);
  });
});
