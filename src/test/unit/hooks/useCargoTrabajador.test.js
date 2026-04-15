import * as CargosService from "../../../services/cargos";
import { renderHook } from "@testing-library/react";
import { describe, expect, vi } from "vitest";
import { act } from "react";
import {
  useCrearCargoTrabajador,
  useEliminarCargoTrabajador,
} from "../../../hooks/useCargoTrabajador";

vi.mock("../../../services/cargos", () => ({
  crearCargoTrabajador: vi.fn(),
  eliminarCargoTrabajador: vi.fn(),
}));

describe("Test hook useCrearCargoTrabajador", () => {
  test("useCrearCargoTrabajador - Camino Success", async () => {
    // Arrange
    CargosService.crearCargoTrabajador.mockResolvedValue(true);

    // Act
    const { result } = renderHook(() => useCrearCargoTrabajador());
    let respuesta;
    await act(async () => {
      respuesta = await result.current.crearCargoTrabajadorHook(1, 22);
    });

    // Assert
    expect(respuesta).toBe(true);
    expect(result.current.loading).toBe(false);
    expect(CargosService.crearCargoTrabajador).toHaveBeenCalledWith(1, 22);
  });

  test("useCrearCargoTrabajador - Camino Catch (Error de Servidor)", async () => {
    // 1. Arrange
    const mensajeEsperado = "El trabajador ya tiene este cargo";
    const errorServidor = {
      response: { data: { message: mensajeEsperado } },
    };
    CargosService.crearCargoTrabajador.mockRejectedValue(errorServidor);

    const { result } = renderHook(() => useCrearCargoTrabajador());

    // 2. Act
    await act(async () => {
      try {
        await result.current.crearCargoTrabajadorHook(1, 22);
      } catch (err) {
        expect(err.response.data.message).toBe(mensajeEsperado);
      }
    });

    // 3. Assert
    expect(result.current.error).toBe(mensajeEsperado);
    expect(result.current.loading).toBe(false);
  });
});

describe("Test hook useEliminarCargoTrabajador", () => {
  test("useEliminarCargoTrabajador - Camino Success", async () => {
    // Arrange
    CargosService.eliminarCargoTrabajador.mockResolvedValue(true);

    // Act
    const { result } = renderHook(() => useEliminarCargoTrabajador());
    let respuesta;
    await act(async () => {
      respuesta = await result.current.eliminarCargoTrabajadorHook(1, 22);
    });

    // Assert
    expect(respuesta).toBe(true);
    expect(result.current.loading).toBe(false);
  });

  test("useEliminarCargoTrabajador - Camino Catch ", async () => {
    // Arrange
    const mensajeError = "Fallo de red";
    CargosService.eliminarCargoTrabajador.mockRejectedValue(
      new Error(mensajeError),
    );

    const { result } = renderHook(() => useEliminarCargoTrabajador());

    // Act
    await act(async () => {
      try {
        await result.current.eliminarCargoTrabajadorHook(1, 22);
      } catch (error_) {
        expect(error_.message).toBe(mensajeError);
      }
    });

    // Assert
    expect(result.current.error).toBe(mensajeError);
    expect(result.current.loading).toBe(false);
  });
});
