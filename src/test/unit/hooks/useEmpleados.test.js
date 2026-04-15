import { renderHook, act } from "@testing-library/react";
import { beforeEach, describe, expect, vi } from "vitest";
import * as EmpleadosService from "../../../services/empleados";
import { useCrearEmpleado } from "../../../hooks/useEmpleados";

// generamos el mock del servicio
vi.mock("../../../services/empleados", () => ({
  crearEmpleado: vi.fn(),
}));

// setUp por defecto
beforeEach(() => {
  vi.clearAllMocks();
  vi.resetAllMocks();
});

describe("Test hook useCrearEmpleado", () => {
  test("useCrearEmpleado - Estado inicial: loading false y error null", () => {
    // Arrange & Act
    const { result } = renderHook(() => useCrearEmpleado());

    // Assert
    // Antes de llamar a crearEmpleadoHook, el hook no debe estar cargando ni tener error
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  test("useCrearEmpleado - Camino Success: retorna true y limpia el error", async () => {
    // Arrange
    EmpleadosService.crearEmpleado.mockResolvedValue();

    const { result } = renderHook(() => useCrearEmpleado());

    // Act
    let respuesta;
    await act(async () => {
      respuesta = await result.current.crearEmpleadoHook(
        "Juan",
        "Pérez",
        "1234567890",
        "3001234567",
      );
    });

    // Assert
    expect(respuesta).toBe(true);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);

    // verificamos que se llamó al servicio con los parámetros correctos
    expect(EmpleadosService.crearEmpleado).toHaveBeenCalledWith(
      "Juan",
      "Pérez",
      "1234567890",
      "3001234567",
    );
    expect(EmpleadosService.crearEmpleado).toHaveBeenCalledTimes(1);
  });

  test("useCrearEmpleado - Camino Catch: guarda el mensaje del servidor (error.response.data.message)", async () => {
    // Arrange
    // Simulamos un error HTTP donde el servidor devuelve su propio mensaje
    const errorDelServidor = {
      response: { data: { message: "El número de documento ya existe" } },
      message: "Request failed with status code 400",
    };
    EmpleadosService.crearEmpleado.mockRejectedValue(errorDelServidor);

    const { result } = renderHook(() => useCrearEmpleado());

    // Act
    // El hook hace throw del error, así que lo capturamos para que el test no explote
    await act(async () => {
      await result.current
        .crearEmpleadoHook("Juan", "Pérez", "1234567890", "3001234567")
        .catch(() => {});
    });

    // Assert
    // Debe priorizar el mensaje que viene del servidor
    expect(result.current.error).toBe("El número de documento ya existe");
    expect(result.current.loading).toBe(false);
  });

  test("useCrearEmpleado - Camino Catch: usa error.message cuando NO hay respuesta del servidor", async () => {
    // Arrange
    // Simulamos un error de red (sin response), por eso el fallback es error.message
    const errorDeRed = new Error("Network Error");
    EmpleadosService.crearEmpleado.mockRejectedValue(errorDeRed);

    const { result } = renderHook(() => useCrearEmpleado());

    // Act
    await act(async () => {
      await result.current
        .crearEmpleadoHook("Juan", "Pérez", "1234567890", "3001234567")
        .catch(() => {});
    });

    // Assert
    // Al no haber error.response, cae en el fallback error.message
    expect(result.current.error).toBe("Network Error");
    expect(result.current.loading).toBe(false);
  });

  test("useCrearEmpleado - Camino Catch: relanza el error para que el llamador lo pueda manejar", async () => {
    // Arrange
    // Esta rama verifica que el hook hace throw, es decir que quien llame
    // a crearEmpleadoHook también puede reaccionar al error (ej: mostrar un modal)
    const errorDeRed = new Error("Network Error");
    EmpleadosService.crearEmpleado.mockRejectedValue(errorDeRed);

    const { result } = renderHook(() => useCrearEmpleado());

    // Act & Assert
    await act(async () => {
      await expect(
        result.current.crearEmpleadoHook("Juan", "Pérez", "1234567890", "300"),
      ).rejects.toThrow("Network Error");
    });
  });

  test("useCrearEmpleado - Camino Finally: loading es true durante la llamada y false al terminar", async () => {
    // Arrange
    // Usamos una promesa que tarda 50ms para poder "atrapar" el estado de loading=true
    EmpleadosService.crearEmpleado.mockReturnValue(
      new Promise((resolve) => setTimeout(() => resolve(), 50)),
    );

    const { result } = renderHook(() => useCrearEmpleado());

    // Act — lanzamos sin await para poder inspeccionar el estado mientras carga
    let promesa;
    act(() => {
      promesa = result.current.crearEmpleadoHook(
        "Juan",
        "Pérez",
        "1234567890",
        "3001234567",
      );
    });

    // Assert — mientras la promesa no resolvió, loading debe ser true
    expect(result.current.loading).toBe(true);

    // Esperamos a que termine
    await act(async () => {
      await promesa.catch(() => {});
    });

    // Assert — el finally siempre apaga el loading, haya éxito o error
    expect(result.current.loading).toBe(false);
  });
});
