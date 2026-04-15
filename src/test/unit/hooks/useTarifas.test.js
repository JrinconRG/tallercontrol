import * as TarifasService from "../../../services/tarifas";
import { useObtenerTarifas, useCrearTarifas } from "../../../hooks/useTarifas";
import { waitFor, renderHook } from "@testing-library/react";
import { describe, expect, vi } from "vitest";
import { act } from "react";

vi.mock("../../../services/tarifas", () => ({
  matrizPrecios: vi.fn(),
  crearTarifa: vi.fn(),
}));

describe("Test hook useObtenerTarifas", () => {
  const mockMatriz = {
    cargos: [{ id: 1, nombre: "Pintor" }],
    referencias: [{ id: 10, nombre: "Cofre" }],
    precios: { "1-10": 5000 },
  };

  test("useObtenerTarifas - Camino Guard Clause (sin trabajadorId)", () => {
    // Act
    const { result } = renderHook(() => useObtenerTarifas(null));

    // Assert
    expect(result.current.cargos).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(TarifasService.matrizPrecios).not.toHaveBeenCalled();
  });

  test("useObtenerTarifas - Camino Success con datos", async () => {
    // Arrange
    TarifasService.matrizPrecios.mockResolvedValue(mockMatriz);

    // Act
    const { result } = renderHook(() => useObtenerTarifas(123));

    // Assert
    await waitFor(() => {
      expect(result.current.cargos).toEqual(mockMatriz.cargos);
      expect(result.current.precios).toEqual(mockMatriz.precios);
      expect(result.current.loading).toBe(false);
    });
  });

  test("useObtenerTarifas - Camino Success con campos nulos (cobertura ||)", async () => {
    // Arrange: Simulamos que el JSON viene vacío
    TarifasService.matrizPrecios.mockResolvedValue({});

    // Act
    const { result } = renderHook(() => useObtenerTarifas(123));

    // Assert
    await waitFor(() => {
      expect(result.current.cargos).toEqual([]);
      expect(result.current.referencias).toEqual([]);
      expect(result.current.precios).toEqual({});
    });
  });

  test("useObtenerTarifas - Camino Catch (Error)", async () => {
    // Arrange
    TarifasService.matrizPrecios.mockRejectedValue(
      new Error("Error de matriz"),
    );

    // Act
    const { result } = renderHook(() => useObtenerTarifas(123));

    // Assert
    await waitFor(() => {
      expect(result.current.error).toBe("Error de matriz");
      expect(result.current.loading).toBe(false);
    });
  });
});

describe("Test hook useCrearTarifas", () => {
  test("useCrearTarifas - Camino Guard Clause (faltan parámetros)", async () => {
    // Act
    const { result } = renderHook(() => useCrearTarifas());

    await act(async () => {
      await result.current.crearPrecio(null, 1, 5000); // Falta el primer ID
    });

    // Assert
    expect(result.current.loading).toBe(false);
    expect(TarifasService.crearTarifa).not.toHaveBeenCalled();
  });

  test("useCrearTarifas - Camino Success", async () => {
    // Arrange
    TarifasService.crearTarifa.mockResolvedValue({ success: true });

    // Act
    const { result } = renderHook(() => useCrearTarifas());

    await act(async () => {
      await result.current.crearPrecio(1, 10, 5000);
    });

    // Assert
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(TarifasService.crearTarifa).toHaveBeenCalledWith(1, 10, 5000);
  });

  test("useCrearTarifas - Camino Catch (Error)", async () => {
    // Arrange
    TarifasService.crearTarifa.mockRejectedValue(new Error("No se pudo crear"));

    // Act
    const { result } = renderHook(() => useCrearTarifas());

    await act(async () => {
      await result.current.crearPrecio(1, 10, 5000);
    });

    // Assert
    expect(result.current.error).toBe("No se pudo crear");
    expect(result.current.loading).toBe(false);
  });
});
