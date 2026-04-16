import { waitFor, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, vi } from "vitest";
import * as SubprocesosService from "../../../services/subprocesos";
import * as StorageService from "../../../services/storage";

import {
  useHistorialSubprocesosTrabajadorNoPagado,
  useSubprocesoActual,
  useCrearSubproceso,
  useFinalizarSubproceso,
  useImagenes,
} from "../../../hooks/useSubprocesos";
import { act } from "react";
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

const dataHistorialSubprocesosTrabajadorNoPagadoMock = () => [
  {
    sub_id_subproceso: 9,
    sub_proceso_id: 5,
    trabajador_id: 12,
    trabajador_nombre: "Julián Ramírez",
    t_numero_de_documento: "1006",
    pro_codigo_cofre: "CF-012",
    referencia_codigo: "106",
    referencia_nombre: "Tapa cruz",
    cargo_nombre: "Pulidor",
    sub_fecha_inicio: "2026-01-21 00:24:33.579113",
    sub_fecha_fin: "2026-02-03 22:22:27.025876",
    sub_duracion_min: null,
    duracion_reloj: "0m",
    valor_pagar: "120000.00",
    sub_estado: "finalizado",
    sub_pagado: false,
    sub_fotos_evidencia: [
      "cofre_Tapa cruz/proceso_CF-012/subproceso_Pulidor.jpg",
    ],
  },
];

describe("Test hook useHistorialSubprocesosTrabajadorNoPagado", () => {
  test(" useHistorialSubprocesosTrabajadorNoPagado - Camino Success", async () => {
    //arrange

    SubprocesosService.getHistorialSubprocesosTrabajadorNoPagado.mockResolvedValue(
      dataHistorialSubprocesosTrabajadorNoPagadoMock(),
    );

    //act
    const { result } = renderHook(() =>
      useHistorialSubprocesosTrabajadorNoPagado(),
    );

    //assert
    await waitFor(() => {
      expect(result.current.historialSubProcesos).toEqual(
        dataHistorialSubprocesosTrabajadorNoPagadoMock(),
      );
      expect(result.current.loading).toBe(false);
    });

    //verificamos q si se llamo a la q es
    expect(
      SubprocesosService.getHistorialSubprocesosTrabajadorNoPagado,
    ).toHaveBeenCalledTimes(1);
  });

  // camino catch
  test("useHistorialSubprocesosTrabajadorNoPagado - Camino Catch", async () => {
    //arrange
    const mensajeError = "Error en la red";
    SubprocesosService.getHistorialSubprocesosTrabajadorNoPagado.mockRejectedValue(
      new Error(mensajeError),
    );

    //act
    const { result } = renderHook(() =>
      useHistorialSubprocesosTrabajadorNoPagado(),
    );

    //assert

    await waitFor(() => {
      expect(result.current.error).toBe(mensajeError);
      expect(result.current.loading).toBe(false);
    });
  });

  test("useHistorialSubprocesosTrabajadorNoPagado - Camino Success con datos nulos", async () => {
    // Arrange
    SubprocesosService.getHistorialSubprocesosTrabajadorNoPagado.mockResolvedValue(
      null,
    );

    // Act
    const { result } = renderHook(() =>
      useHistorialSubprocesosTrabajadorNoPagado(),
    );

    // Assert
    await waitFor(() => {
      expect(result.current.historialSubProcesos).toEqual([]);
      expect(result.current.loading).toBe(false);
    });
  });

  test("useHistorialSubprocesosTrabajadorNoPagado - Camino Refetch", async () => {
    //  Arrange
    SubprocesosService.getHistorialSubprocesosTrabajadorNoPagado.mockResolvedValue(
      dataHistorialSubprocesosTrabajadorNoPagadoMock(),
    );

    // 2. Act
    const { result } = renderHook(() =>
      useHistorialSubprocesosTrabajadorNoPagado(),
    );

    // Esperamos a que cargue la primera vez
    await waitFor(() => expect(result.current.loading).toBe(false));

    // Llamamos al refetch
    await act(async () => {
      await result.current.refetch();
    });

    // 3. Assert
    // Verificamos que el servicio se lllamo las dos veces cuando se monto y el refetch
    expect(
      SubprocesosService.getHistorialSubprocesosTrabajadorNoPagado,
    ).toHaveBeenCalledTimes(2);
    expect(result.current.historialSubProcesos).toEqual(
      dataHistorialSubprocesosTrabajadorNoPagadoMock(),
    );
  });
});

//helper (datos de useSubprocesoActual)

const dataSubprocesoActualHook = () => [
  {
    sub_id_subproceso: 17,
    sub_proceso_id: 7,
    sub_fecha_inicio: "2026-02-19 19:40:32.226238",
    sub_estado: "EN_PROCESO",
    trabajador_id: 22,
    t_nombre: "Julián Ramírez",
    cargo_id: 11,
    c_nombre: "Pulidor",
    c_orden_proceso: 1,
  },
];

describe("Test hook useSubprocesoActual", () => {
  test(" useSubprocesoActual - Camino Success", async () => {
    //arrange

    SubprocesosService.getInformacionSubprocesoActual.mockResolvedValue(
      dataSubprocesoActualHook(),
    );

    //act
    const { result } = renderHook(() => useSubprocesoActual());

    //assert
    await waitFor(() => {
      expect(result.current.data).toEqual(dataSubprocesoActualHook());
      expect(result.current.loading).toBe(false);
    });

    //verificamos q si se llamo a la q es
    expect(
      SubprocesosService.getInformacionSubprocesoActual,
    ).toHaveBeenCalledTimes(1);
  });

  // camino catch
  test("useSubprocesoActual - Camino Catch", async () => {
    //arrange
    const mensajeError = "Error en la red";
    SubprocesosService.getInformacionSubprocesoActual.mockRejectedValue(
      new Error(mensajeError),
    );

    //act
    const { result } = renderHook(() => useSubprocesoActual());

    //assert

    await waitFor(() => {
      expect(result.current.error).toBe(mensajeError);
      expect(result.current.loading).toBe(false);
    });
  });

  //test camino finally
  test("useSubprocesoActual - camino finally ", async () => {
    //arrange
    SubprocesosService.getInformacionSubprocesoActual.mockReturnValue(
      new Promise((resolve) => setTimeout(() => resolve([]), 50)),
    );
    // Act

    const { result } = renderHook(() => useSubprocesoActual());

    //deberia estar cargargando assert
    expect(result.current.loading).toBe(true);
    //espera y se falsea
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  test("useSubprocesoActual - Camino Success con datos nulos", async () => {
    // Arrange
    SubprocesosService.getInformacionSubprocesoActual.mockResolvedValue(null);

    // Act
    const { result } = renderHook(() => useSubprocesoActual());

    // Assert
    await waitFor(() => {
      expect(result.current.data).toEqual([]);
      expect(result.current.loading).toBe(false);
    });
  });

  test("useSubprocesoActual - Camino Refetch", async () => {
    //  Arrange
    SubprocesosService.getInformacionSubprocesoActual.mockResolvedValue(
      dataSubprocesoActualHook(),
    );

    // 2. Act
    const { result } = renderHook(() => useSubprocesoActual());

    // Esperamos a que cargue la primera vez
    await waitFor(() => expect(result.current.loading).toBe(false));

    // Llamamos al refetch
    await act(async () => {
      await result.current.refetch();
    });

    // 3. Assert
    // Verificamos que el servicio se lllamo las dos veces cuando se monto y el refetch
    expect(
      SubprocesosService.getInformacionSubprocesoActual,
    ).toHaveBeenCalledTimes(2);
    expect(result.current.data).toEqual(dataSubprocesoActualHook());
  });
});

describe("Test hook useCrearSubproceso", () => {
  test("useCrearSubproceso - Camino Success", async () => {
    // Arrange
    SubprocesosService.crearSubproceso.mockResolvedValue({ id: 1 });

    // Act
    const { result } = renderHook(() => useCrearSubproceso());

    let respuesta;
    await act(async () => {
      respuesta = await result.current.crearSubprocesohook(1, 11, 22);
    });

    // Assert
    expect(respuesta.success).toBe(true);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(SubprocesosService.crearSubproceso).toHaveBeenCalledWith(1, 11, 22);
  });

  test("useCrearSubproceso - Camino Catch", async () => {
    // Arrange
    const mensajeError = "No se pudo crear";
    SubprocesosService.crearSubproceso.mockRejectedValue(
      new Error(mensajeError),
    );

    // Act
    const { result } = renderHook(() => useCrearSubproceso());

    let respuesta;
    await act(async () => {
      respuesta = await result.current.crearSubprocesohook(1, 11, 22);
    });

    // Assert
    expect(respuesta.success).toBe(false);
    expect(result.current.error).toBe(mensajeError);
    expect(result.current.loading).toBe(false);
  });
});

describe("Test hook useFinalizarSubproceso", () => {
  test("useFinalizarSubproceso - Camino Success", async () => {
    // Arrange
    SubprocesosService.finalizarSubproceso.mockResolvedValue(true);

    // Act
    const { result } = renderHook(() => useFinalizarSubproceso());

    let respuesta;
    await act(async () => {
      respuesta = await result.current.finalizarSubproceso("ruta/foto.jpg", 17);
    });

    // Assert
    expect(respuesta.success).toBe(true);
    expect(result.current.loading).toBe(false);
    expect(SubprocesosService.finalizarSubproceso).toHaveBeenCalledWith(
      "ruta/foto.jpg",
      17,
    );
  });

  test("useFinalizarSubproceso - Camino Catch", async () => {
    // Arrange
    SubprocesosService.finalizarSubproceso.mockRejectedValue(
      new Error("Error al finalizar"),
    );

    // Act
    const { result } = renderHook(() => useFinalizarSubproceso());

    let respuesta;
    await act(async () => {
      respuesta = await result.current.finalizarSubproceso("ruta/foto.jpg", 17);
    });

    // Assert
    expect(respuesta.success).toBe(false);
    expect(result.current.error).toBe("Error al finalizar");
  });
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
