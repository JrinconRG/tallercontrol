import { waitFor, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, vi } from "vitest";
import * as TrabajadoresService from "../../../services/trabajadores";
import { act } from "react";
import {
  useTrabajadoresPorCargo,
  useTrabajadoresSelect,
  useEmpleadosConCargos,
} from "../../../hooks/useTrabajadores";

//generamos los mocks
vi.mock("../../../services/trabajadores", () => ({
  obtenerTrabajadoresPorCargo: vi.fn(),
  getInformacionEmpleados: vi.fn(),
  getTrabajadoresSelect: vi.fn(),
}));

//setUp por defecto
beforeEach(() => {
  vi.clearAllMocks();
});

//helper (datos de useTrabajadoresPorCargo)
const dataTrabajadoresPorCargo = () => ({
  cargo_id: 12,
  t_id: 13,
  t_nombre: "Carlos",
  t_apellidos: "Perez",
});

describe("Test hook useTrabajadoresPorCargo", () => {
  test("useTrabajadoresPorCargo - Camino correcto", async () => {
    //arrange
    TrabajadoresService.obtenerTrabajadoresPorCargo.mockResolvedValue([
      dataTrabajadoresPorCargo(),
    ]);

    //act
    const { result } = renderHook(() => useTrabajadoresPorCargo(13));

    //assert
    await waitFor(() => {
      expect(result.current.trabajadores.length).toBe(1);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
    });
  });

  //Caso cuando no hay CargoId
  test("useTrabajadoresPorCargo - Camino sin cargoId", async () => {
    //arrange
    const cargoIdInvalido = null;
    //act
    const { result } = renderHook(() =>
      useTrabajadoresPorCargo(cargoIdInvalido),
    );

    //assert
    expect(result.current.trabajadores).toEqual([]);
    expect(result.current.loading).toBe(false);

    //se verifica que nunca se llamo al servie
    expect(
      TrabajadoresService.obtenerTrabajadoresPorCargo,
    ).not.toHaveBeenCalled();
  });
  //Camino con error el del catch
  test("useTrabajadoresPorCargo - Camino con error del service", async () => {
    //Arrange
    const mensajeError = "Error al conectar con el servidorr";
    TrabajadoresService.obtenerTrabajadoresPorCargo.mockRejectedValue(
      new Error(mensajeError),
    );

    //act
    const { result } = renderHook(() => useTrabajadoresPorCargo(12));

    //asser
    await waitFor(() => {
      expect(result.current.error).toBe(mensajeError);
      expect(result.current.loading).toBe(false);
      expect(result.current.trabajadores).toEqual([]);
    });
  });

  test("useTrabajadoresPorCargo - Debe manejar el finally (loading) false", async () => {
    // Sin setTimeout, sin fake timers — mockResolvedValue resuelve inmediatamente
    TrabajadoresService.obtenerTrabajadoresPorCargo.mockResolvedValue([]);

    const { result } = renderHook(() => useTrabajadoresPorCargo(12));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });
});

//helper (datos de useTrabajadoresSelect)
const dataTrabajadoresSelect = () => [
  {
    t_id: 17,
    trabajador_nombre_completo: "Laura Gomez",
  },
];

describe("Test hook useTrabajadoresSelect", () => {
  //Camino bie
  // camino catch
  test("useTrabajadoresSelect - Camino Catch", async () => {
    //arrange
    const mensajeError = "Error en la red";
    TrabajadoresService.getTrabajadoresSelect.mockRejectedValue(
      new Error(mensajeError),
    );

    //act
    const { result } = renderHook(() => useTrabajadoresSelect());

    //assert

    await waitFor(() => {
      expect(result.current.error).toBe(mensajeError);
      expect(result.current.loading).toBe(false);
    });
  });
  //test camino finally
  test("useTrabajadoresSelect - camino finally ", async () => {
    //arrange
    TrabajadoresService.getTrabajadoresSelect.mockReturnValue(
      new Promise((resolve) => setTimeout(() => resolve([]), 50)),
    );
    // Act
    const { result } = renderHook(() => useTrabajadoresSelect(12));
    //deberia estar cargargando assert
    expect(result.current.loading).toBe(true);
    //espera y se false
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });
  test("useTrabajadoresSelect - Camino Success con datos nulos", async () => {
    // Arrangeel service responde null
    TrabajadoresService.getTrabajadoresSelect.mockResolvedValue(null);

    // Act
    const { result } = renderHook(() => useTrabajadoresSelect());

    // Assert
    await waitFor(() => {
      expect(result.current.trabajadores).toEqual([]);
      expect(result.current.loading).toBe(false);
    });
  });
});

//helper (datos de useEmpleadosConCargos)
const dataEmpleadosdosConCargos = () => [
  {
    t_id: 17,
    nombre_completo: "Laura Gomez",
    t_numero_de_documento: "1001",
    t_celular: "3011111111",
    cargos: [{ id: 14, nombre: "Pintor" }],
  },
];
describe("Test hook useEmpleadosConCargos", () => {
  test(" useEmpleadosConCargos - Camino Success", async () => {
    //arrange

    TrabajadoresService.getInformacionEmpleados.mockResolvedValue(
      dataEmpleadosdosConCargos(),
    );

    //act
    const { result } = renderHook(() => useEmpleadosConCargos());

    //assert
    await waitFor(() => {
      expect(result.current.empleados).toEqual(dataEmpleadosdosConCargos());
      expect(result.current.loading).toBe(false);
    });

    //verificamos q si se llamo a la q es
    expect(TrabajadoresService.getInformacionEmpleados).toHaveBeenCalledTimes(
      1,
    );
  });

  // camino catch
  test("useEmpleadosConCargos - Camino Catch", async () => {
    //arrange
    const mensajeError = "Error en la red";
    TrabajadoresService.getInformacionEmpleados.mockRejectedValue(
      new Error(mensajeError),
    );

    //act
    const { result } = renderHook(() => useEmpleadosConCargos());

    //assert

    await waitFor(() => {
      expect(result.current.error).toBe(mensajeError);
      expect(result.current.loading).toBe(false);
    });
  });
  //test camino finally
  test("useEmpleadosConCargos - camino finally ", async () => {
    //arrange
    TrabajadoresService.getInformacionEmpleados.mockReturnValue(
      new Promise((resolve) => setTimeout(() => resolve([]), 50)),
    );
    // Act

    const { result } = renderHook(() => useEmpleadosConCargos(17));

    //deberia estar cargargando assert
    expect(result.current.loading).toBe(true);
    //espera y se falsea
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });
  test("useEmpleadosConCargos - Camino Success con datos nulos", async () => {
    // Arrangeel service responde null
    TrabajadoresService.getInformacionEmpleados.mockResolvedValue(null);

    // Act
    const { result } = renderHook(() => useEmpleadosConCargos());

    // Assert
    await waitFor(() => {
      expect(result.current.empleados).toEqual([]);
      expect(result.current.loading).toBe(false);
    });
  });

  test("useEmpleadosConCargos - Camino Refetch", async () => {
    //  Arrange
    TrabajadoresService.getInformacionEmpleados.mockResolvedValue(
      dataEmpleadosdosConCargos(),
    );

    // 2. Act
    const { result } = renderHook(() => useEmpleadosConCargos());

    // Esperamos a que cargue la primera vez
    await waitFor(() => expect(result.current.loading).toBe(false));

    // Llamamos al refetch
    await act(async () => {
      await result.current.refetch();
    });

    // 3. Assert
    // Verificamos que el servicio se lllamo las dos veces cuando se monto y el refetch
    expect(TrabajadoresService.getInformacionEmpleados).toHaveBeenCalledTimes(
      2,
    );
    expect(result.current.empleados).toEqual(dataEmpleadosdosConCargos());
  });
});
