import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import CrearProceso from "../../../pages/Trabajador/InicioTrabajador/funciones/CrearProceso";
import * as procesosService from "../../../services/procesos";

vi.mock("../../../services/cofres", () => ({
  obtenerReferenciasCofre: vi.fn(() =>
    Promise.resolve([{ rc_id: 1, rc_nombre: "Imperial", rc_codigo: "104" }]),
  ),
}));

vi.mock("../../../services/procesos");

beforeEach(() => {
  // Esto limpia el historial de llamadas de todos los mocks
  vi.clearAllMocks();
});

describe("Test Caja Blanca - Crear Proceso", () => {
  //Test 1: CP-1.1 Camino exitoso

  test("Cp-1.1 Debe crear el proceso exitosamente", async () => {
    //Arrange(organizar)
    const onSuccess = vi.fn();
    const onClose = vi.fn();
    procesosService.crearProceso.mockResolvedValue({ referenciaId: 1 });
    render(<CrearProceso onClose={onClose} onSuccess={onSuccess} />);

    //act(actuar)
    // 1. Esperamos que carguen las referencias y seleccionamos una
    const select = await screen.findByRole("combobox");
    fireEvent.change(select, { target: { value: "1" } });

    // 2. Click en el botón
    fireEvent.click(screen.getByText("Crear Proceso"));

    //assert(afirmar)
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });

  //Test 2 : el camino de validacion(usuario no selecciono referenciaId)
  test("CP-1.2: Debe mostrar error si no hay referencia seleccionada", async () => {
    // 1. Renderizamos de cero (limpio)
    render(<CrearProceso onSuccess={vi.fn()} onClose={vi.fn()} />);

    // 2. ACT: Asegúrate de que NO estamos cambiando el select.
    // Vamos directo al botón.
    const boton = screen.getByText("Crear Proceso");
    fireEvent.click(boton);

    // 3. ASSERT
    // Aquí es donde fallaba: confirmamos que el error sale
    // y que la API NO se tocó.
    expect(
      await screen.findByText(/Por favor, selecciona una referencia/i),
    ).toBeDefined();
    expect(procesosService.crearProceso).not.toHaveBeenCalled();
  });

  //Test 3: El Camino del Error (Fallo de Servidor)
  test("CP-1.3: Debe mostrar mensaje de error si la API falla", async () => {
    // ARRANGE
    procesosService.crearProceso.mockRejectedValue(
      new Error("Hubo un fallo en el servidor. Intenta de nuevo."),
    );
    render(<CrearProceso onSuccess={vi.fn()} onClose={vi.fn()} />);

    // ACT
    const select = await screen.findByRole("combobox");
    fireEvent.change(select, { target: { value: "1" } });
    fireEvent.click(screen.getByText("Crear Proceso"));

    // ASSERT
    const errorMsg = await screen.findByText(/Hubo un fallo en el servidor/i);
    expect(errorMsg).toBeDefined();
  });
});
