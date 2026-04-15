import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, vi } from "vitest";
import FinalizarSubproceso from "../../../pages/Trabajador/InicioTrabajador/funciones/FinalizarSubproceso";
import * as storageService from "../../../services/storage";
import * as useSubprocesosHook from "../../../hooks/useSubprocesos";

//generamos los mocks

vi.mock("../../../services/storage.js", () => ({
  subirEvidencia: vi.fn(),
}));

//mockeamos el hook para controlar su comportamiento
vi.mock("../../../hooks/useSubprocesos.js", () => ({
  useFinalizarSubproceso: vi.fn(),
}));

// URL.createObjectURL no existe en jsdom, hay que crearlo
globalThis.URL.createObjectURL = vi.fn(() => "blob:mock-url"); // url falsa

//helper (datos de prueba)

const crearSubprocesoMock = (esUltimaFase = false) => ({
  subproceso: {
    rc_nombre: "Imperial",
    id_nombre_proceso: "CF-043",
    nombre_fase: "Pulidor",
    sub_id_subproceso: "SP-99",
    esUltimaFase,
  },
});

//Setup oor defecto

beforeEach(() => {
  vi.clearAllMocks();

  // devuelve el hook
  useSubprocesosHook.useFinalizarSubproceso.mockReturnValue({
    finalizarSubproceso: vi.fn().mockResolvedValue({ success: true }),
    loading: false,
  });

  storageService.subirEvidencia.mockResolvedValue(undefined);
});

//testsss

describe("Test caja blanca - FinalizarSubproceso Componente", () => {
  // CP-1.1: Camino exitoso — es la ultima fase
  test("CP-1.1: Debe llamar onSuccess con tipo 'finalizado' cuando es la última fase", async () => {
    // ARRANGE

    const onSuccess = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn(); // funcion falsa q no hace nada pero recuerda que la llamaron
    const subproceso = crearSubprocesoMock(true); // true de q es la ultimafase

    render(
      <FinalizarSubproceso
        subproceso={subproceso}
        onClose={onClose}
        onSuccess={onSuccess}
      />,
    );

    //act - se selecciona  un archivo png
    const input = document.querySelector('input[type="file"]');
    const archivoFalso = new File(["foto"], "evidencia.png", {
      type: "image/jpeg",
    });
    fireEvent.change(input, { target: { files: [archivoFalso] } });

    fireEvent.click(screen.getByText("Finalizar"));

    // ASSERT
    await waitFor(() => {
      expect(storageService.subirEvidencia).toHaveBeenCalledOnce();
      expect(onSuccess).toHaveBeenCalledWith(
        expect.objectContaining({ tipo: "finalizado" }),
      );
      expect(onClose).toHaveBeenCalled();
    });
  });

  //CP1.2:Camino exitoso- Fase que no es la ultima
  test("CP-1.2: Debe llamar onSuccess con tipo 'fase' cuando NO es la ultima fase", async () => {
    //Arrange
    const onSuccess = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();
    const subproceso = crearSubprocesoMock(false);

    render(
      <FinalizarSubproceso
        subproceso={subproceso}
        onClose={onClose}
        onSuccess={onSuccess}
      />,
    );

    //ACT

    const input = document.querySelector('input[type="file"]');
    const archivoFalso = new File(["foto"], "evidencia.png", {
      type: "image/jpeg",
    });
    fireEvent.change(input, { target: { files: [archivoFalso] } });
    fireEvent.click(screen.getByText("Finalizar"));

    //assert
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(
        expect.objectContaining({ tipo: "fase" }),
      );
    });
  });

  //CP-1.3 TEST CUANDO NO MANDAS ARCHIVO

  test("CP-1.3:Debe mostrar error y no llamar al servicio si no hay archivo", async () => {
    //ARRANGE
    render(
      <FinalizarSubproceso
        subproceso={crearSubprocesoMock()}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />,
    );

    //act- clickear sin tener un archivo
    fireEvent.click(screen.getByText("Finalizar"));

    //assert
    expect(
      await screen.findByText(/Por favor, selecciona una foto de evidencia/i),
    ).toBeDefined();
    expect(storageService.subirEvidencia).not.toHaveBeenCalled();
  });

  //CP 1.4 TEST CUANDO HAY UN FALLO EN SUBIR EVIDENCIA
  test("CP1.4: Debe manejar el error sin crashear si subirEvidencia falla ", async () => {
    //ARRANGE

    const onSuccess = vi.fn();
    storageService.subirEvidencia.mockRejectedValue(
      new Error("Firebase:Storage no disponible"),
    );
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    render(
      <FinalizarSubproceso
        subproceso={crearSubprocesoMock()}
        onClose={vi.fn()}
        onSuccess={onSuccess}
      />,
    );

    //ACT
    const input = document.querySelector('input[type="file"]');
    const archivoFalso = new File(["foto"], "evidencia.png", {
      type: "image/jpeg",
    });
    fireEvent.change(input, {
      target: { files: [archivoFalso] },
    });
    fireEvent.click(screen.getByText("Finalizar"));

    //assert- el componente no debe llamar onSucces ni q se caiga la app
    await waitFor(() => {
      expect(onSuccess).not.toHaveBeenCalled();
      expect(consoleError).toHaveBeenCalled();
    });
  });

  //CP-1.5: Error  en finalizarSubproceso(error en el hook)
  test("CP-1.5:Debe manejar el error que manda el hook finalizarSubproceso y que no se llame a onSucces", async () => {
    //Arrange - se sobreescribe el mook del hook para que falle
    useSubprocesosHook.useFinalizarSubproceso.mockReturnValue({
      finalizarSubproceso: vi
        .fn()
        .mockRejectedValue(new Error("Error de red al finalizar")),
      loading: false,
    });
    const onSuccess = vi.fn();
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    render(
      <FinalizarSubproceso
        subproceso={crearSubprocesoMock()}
        onClose={vi.fn()}
        onSuccess={onSuccess}
      />,
    );

    //act
    const input = document.querySelector('input[type="file"]');
    const archivoFalso = new File(["foto"], "evidencia.png", {
      type: "image/jpeg",
    });
    fireEvent.change(input, {
      target: { files: [archivoFalso] },
    });
    fireEvent.click(screen.getByText("Finalizar"));

    //assert
    await waitFor(() => {
      expect(onSuccess).not.toHaveBeenCalled();
      expect(consoleError).toHaveBeenCalled();
    });
  });
});
