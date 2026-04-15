import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, vi } from "vitest";
import CrearSubproceso from "../../../pages/Trabajador/InicioTrabajador/funciones/CrearSubproceso";
import * as useTrabajadoresHook from "../../../hooks/useTrabajadores";
import * as useSubprocesosHook from "../../../hooks/useSubprocesos";

//generamos los mocks
vi.mock("../../../hooks/useTrabajadores", () => ({
  useTrabajadoresPorCargo: vi.fn(),
}));

vi.mock("../../../hooks/useSubprocesos", () => ({
  useCrearSubproceso: vi.fn(),
}));

//helper (datos de prueba)
const crearContextoMock = () => ({
  proceso: {
    pro_codigo_cofre: "CF-99",
    pro_id_proceso: "P-001",
    rc_nombre: "Imperial",
  },
  fase: {
    siguiente_cargo_id: "12",
    siguiente_fase_orden: "2",
    siguiente_cargo_nombre: "Tapizador",
  },
});

const trabajadoresMock = [
  { t_id: "1", t_nombre: "Carlos", t_apellidos: "Pérez" },
  { t_id: "2", t_nombre: "Ana", t_apellidos: "Gómez" },
];

//setUp por defecto
beforeEach(() => {
  vi.clearAllMocks();

  // devuelve el hook
  useSubprocesosHook.useCrearSubproceso.mockReturnValue({
    crearSubprocesohook: vi.fn().mockResolvedValue({ success: true }),
    loading: false,
  });

  useTrabajadoresHook.useTrabajadoresPorCargo.mockReturnValue({
    trabajadores: trabajadoresMock,
    loading: false,
    error: null,
  });
});

//testsss

describe("Test caja blanca - CrearSubproceso Componente", () => {
  //CP1.1 Camino exitoso
  test("CP-1.1 Camino exitoso debe llamar a onClose y a OnSucces", async () => {
    //Arrange
    const onClose = vi.fn();
    const onSuccess = vi.fn();

    render(
      <CrearSubproceso
        contexto={crearContextoMock()}
        onClose={onClose}
        onSuccess={onSuccess}
      />,
    );

    //act
    //seleccionar trabajador
    const select = screen.getByLabelText(/Trabajador asignado/i);

    // disparamos cambio en el select con el id del trabajador (t_id"1")
    fireEvent.change(select, { target: { value: "1" } });

    const botonFinalizar = screen.getByRole("button", {
      name: /Iniciar fase/i,
    });

    fireEvent.click(botonFinalizar);

    // ASSERT
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(
        expect.objectContaining({ tipo: "nuevaFase" }),
      );
      expect(onClose).toHaveBeenCalled();
    });
  });

  //CP-1.2  camino de error no SE SELECCIONA EL TRABAJADOR
  test("CP-1.2  No se selecciona trabajador debe mostrar error y no llamar nada ", async () => {
    //arrange
    const onSuccess = vi.fn();
    const onClose = vi.fn();

    render(
      <CrearSubproceso
        contexto={crearContextoMock()}
        onClose={onClose}
        onSuccess={onSuccess}
      />,
    );

    const select = screen.getByLabelText(/Trabajador asignado/i);
    expect(select.value).toBe("");

    // act
    const botonFinalizar = screen.getByRole("button", {
      name: /Iniciar fase/i,
    });

    fireEvent.click(botonFinalizar);

    //assert
    await waitFor(() => {
      expect(
        screen.getByText(/Por favor, selecciona una referencia/i),
      ).toBeInTheDocument();
      expect(onSuccess).not.toHaveBeenCalled();
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  //CP-1.3 Error de conexion error de supabase
  test("CP-1.3 Error al llamar crearSubproceso no debe llamar a onSucces ni a onclose", async () => {
    //arrange

    // Sobreescribimos el beforeEach para que el hook lance un error
    useSubprocesosHook.useCrearSubproceso.mockReturnValue({
      crearSubprocesohook: vi.fn().mockRejectedValue(new Error("Error de red")),
      loading: false,
    });
    // Silenciamos el console.error para que no ensucie la consola
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const onSuccess = vi.fn();
    const onClose = vi.fn();

    render(
      <CrearSubproceso
        contexto={crearContextoMock()}
        onClose={onClose}
        onSuccess={onSuccess}
      />,
    );

    //act
    const select = screen.getByLabelText(/Trabajador asignado/i);
    fireEvent.change(select, { target: { value: "1" } });
    const botonFinalizar = screen.getByRole("button", {
      name: /Iniciar fase/i,
    });

    fireEvent.click(botonFinalizar);

    //assert
    await waitFor(() => {
      expect(
        screen.getByText(/Ocurrió un error inesperado en el sistema/i),
      ).toBeInTheDocument();
      expect(consoleError).toHaveBeenCalled();
      expect(onSuccess).not.toHaveBeenCalled();
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  //CP-1.4 MOSTRAR CUANDO el success es false meterce al else
  test("CP-1.4 Debe mostrar el error del hook si success es false y no llamar nada", async () => {
    //arrange
    // El hook NO lanza excepción, simplemente retorna success: false
    useSubprocesosHook.useCrearSubproceso.mockReturnValue({
      crearSubprocesohook: vi.fn().mockResolvedValue({
        success: false,
        error: "No se pudo crear el subproceso.",
      }),
      loading: false,
    });
    const onSuccess = vi.fn();
    const onClose = vi.fn();

    render(
      <CrearSubproceso
        contexto={crearContextoMock()}
        onClose={onClose}
        onSuccess={onSuccess}
      />,
    );
    // ACT
    const select = screen.getByLabelText(/Trabajador asignado/i);
    fireEvent.change(select, { target: { value: "1" } });

    const botonFinalizar = screen.getByRole("button", {
      name: /Iniciar fase/i,
    });

    fireEvent.click(botonFinalizar);

    // ASSERT
    await waitFor(() => {
      expect(
        screen.getByText(/No se pudo crear el subproceso/i),
      ).toBeInTheDocument();
      expect(onSuccess).not.toHaveBeenCalled();
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  //CP-1.5 Cuando los trabajadores no cargan
  test("CP-1.5 Debe mostrar error si el hook de trabajadores falla al cargar", async () => {
    // ARRANGE
    // Sobreescribimos el beforeEach para simular error al cargar trabajadores
    useTrabajadoresHook.useTrabajadoresPorCargo.mockReturnValue({
      trabajadores: [],
      loading: false,
      error: "No se pudieron cargar los trabajadores.",
    });
    const onSuccess = vi.fn();
    const onClose = vi.fn();
    render(
      <CrearSubproceso
        contexto={crearContextoMock()}
        onClose={onClose}
        onSuccess={onSuccess}
      />,
    );
    //act- el error se muestra al renderizar no hay accion
    //assert
    //el select no debe aparecer
    expect(
      screen.queryByLabelText(/Trabajador asignado/i),
    ).not.toBeInTheDocument();
    // El mensaje de error SÍ debe aparecer
    expect(
      screen.getByText(/No se pudieron cargar los trabajadores/i),
    ).toBeInTheDocument();
  });
});

//CP
