import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, vi, test, beforeEach } from "vitest";
import CrearSubproceso from "../../../pages/Trabajador/InicioTrabajador/funciones/CrearSubproceso";

import { useTrabajadoresPorCargo } from "../../../features/Trabajadores/application/hooks/useTrabajadoresPorCargo";
import { useCrearSubproceso } from "../../../features/subProcesos/application/hooks/useCrearSubProceso";

vi.mock(
  "../../../features/Trabajadores/application/hooks/useTrabajadoresPorCargo",
);
vi.mock("../../../features/subProcesos/application/hooks/useCrearSubProceso");

const aContexto = () => ({
  proceso: { id: 10, codigoCofre: "CF-104", referenciaNombre: "Imperial" },
  fase: {
    siguienteCargoId: 5,
    siguienteFaseOrden: 2,
    siguienteCargoNombre: "Lijado",
  },
  withProcesoId: function (id) {
    this.proceso.id = id;
    return this;
  },
  build: function () {
    return { proceso: this.proceso, fase: this.fase };
  },
});

describe("Test Caja Blanca - Crear Subproceso", () => {
  const mockMutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    useTrabajadoresPorCargo.mockReturnValue({
      trabajadoresPorCargo: [{ id: "1", nombre: "Juana", apellidos: "Rincon" }],
      loading: false,
      errorMessage: null,
    });

    // Mock de la mutación
    useCrearSubproceso.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });
  });

  // CP-1.1: Flujo exitoso
  test("CP-1.1: Debe crear el subproceso y notificar éxito", async () => {
    const onSuccessSpy = vi.fn();
    const onCloseSpy = vi.fn();
    const contexto = aContexto().build();

    mockMutate.mockImplementation((payload, options) => {
      options.onSuccess({ id: "sub-99" });
    });

    render(
      <CrearSubproceso
        contexto={contexto}
        onClose={onCloseSpy}
        onSuccess={onSuccessSpy}
      />,
    );

    // Act
    const select = screen.getByLabelText(/Trabajador asignado/i);
    fireEvent.change(select, { target: { value: "1" } });
    fireEvent.click(screen.getByRole("button", { name: /Iniciar fase/i }));

    // Assert
    // En el test CP-1.1, cambia el expect por este:
    await waitFor(() => {
      expect(onSuccessSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          tipo: "nuevaFase",
          nombreTrabajador: "Juana Rincon",
          codigo: "CF-104",
          fase: "Lijado",
          nombre: "Imperial",
        }),
      );
      expect(onCloseSpy).toHaveBeenCalled();
    });
  });

  // CP-1.2: validar  campo obligatorio
  test("CP-1.2: No debe llamar a la API si no se selecciona trabajador", async () => {
    render(
      <CrearSubproceso
        contexto={aContexto().build()}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Iniciar fase/i }));

    expect(
      await screen.findByText(
        /Por favor, selecciona una referencia de trabajador/i,
      ),
    ).toBeInTheDocument();
    expect(mockMutate).not.toHaveBeenCalled();
  });

  // CP-1.3: Error de red o servidor
  test("CP-1.3: Debe mostrar alerta si la mutate falla", async () => {
    mockMutate.mockImplementation((payload, options) => {
      options.onError(new Error("Servidor caído"));
    });

    render(
      <CrearSubproceso
        contexto={aContexto().build()}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByLabelText(/Trabajador asignado/i), {
      target: { value: "1" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Iniciar fase/i }));

    expect(await screen.findByText(/Servidor caído/i)).toBeInTheDocument();
  });

  // CP-1.4: Estado de carga del Hook
  test("CP-1.4: Debe mostrar mensaje de carga mientras llegan los trabajadores", () => {
    useTrabajadoresPorCargo.mockReturnValue({
      trabajadoresPorCargo: [],
      loading: true,
      errorMessage: null,
    });

    render(
      <CrearSubproceso
        contexto={aContexto().build()}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />,
    );

    expect(screen.getByText(/Cargando trabajadores/i)).toBeInTheDocument();
  });
});
