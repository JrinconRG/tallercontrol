import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, vi, test, beforeEach } from "vitest";
import CrearProceso from "../../../pages/Trabajador/InicioTrabajador/funciones/CrearProceso";

import { useObtenerReferenciasCofres } from "../../../features/cofres/application/hook/useObtenerReferenciasCofres";
import { useCrearProceso } from "../../../features/procesos/application/hooks/useCrearProceso";

vi.mock(
  "../../../features/cofres/application/hook/useObtenerReferenciasCofres",
);
vi.mock("../../../features/procesos/application/hooks/useCrearProceso");

describe("Test Caja Blanca - Crear Proceso", () => {
  const mockEjecutarCrearProceso = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Configuración por defecto de los hooks
    useObtenerReferenciasCofres.mockReturnValue({
      referencias: [{ id: 1, nombre: "Imperial", codigo: "104" }],
      loading: false,
    });

    useCrearProceso.mockReturnValue({
      mutate: mockEjecutarCrearProceso,
      isPending: false,
    });
  });

  // Test 1: CP-1.1 Camino exitoso
  test("Cp-1.1 Debe crear el proceso exitosamente", async () => {
    const onSuccess = vi.fn();
    const onClose = vi.fn();

    // Simulamos que la mutación llama al callback onSuccess que pasaste en el componente
    mockEjecutarCrearProceso.mockImplementation((id, options) => {
      options.onSuccess({ codigo: "PROC-001" });
    });

    render(<CrearProceso onClose={onClose} onSuccess={onSuccess} />);

    const select = await screen.findByRole("combobox");
    fireEvent.change(select, { target: { value: "1" } });

    fireEvent.click(screen.getByRole("button", { name: /Crear Proceso/i }));

    await waitFor(() => {
      // Verificamos que se llamó a onSuccess con el formato que espera tu componente
      expect(onSuccess).toHaveBeenCalledWith(
        expect.objectContaining({
          tipo: "creado",
          codigo: "PROC-001",
          nombre: "Imperial",
        }),
      );
      expect(onClose).toHaveBeenCalled();
    });
  });

  // Test 2: } no selecciono referenciaId)
  test("CP-1.2: Debe mostrar error si no hay referencia seleccionada", async () => {
    render(<CrearProceso onSuccess={vi.fn()} onClose={vi.fn()} />);

    const boton = screen.getByRole("button", { name: /Crear Proceso/i });
    fireEvent.click(boton);

    expect(
      await screen.findByText(/Por favor, selecciona una referencia de cofre/i),
    ).toBeInTheDocument();

    expect(mockEjecutarCrearProceso).not.toHaveBeenCalled();
  });

  // Test 3: El Camino del Error (Fallo de Servidor)
  test("CP-1.3: Debe mostrar mensaje de error si la API falla", async () => {
    mockEjecutarCrearProceso.mockImplementation((id, options) => {
      options.onError(new Error("Fallo"));
    });

    render(<CrearProceso onSuccess={vi.fn()} onClose={vi.fn()} />);

    const select = await screen.findByRole("combobox");
    fireEvent.change(select, { target: { value: "1" } });

    fireEvent.click(screen.getByRole("button", { name: /Crear Proceso/i }));

    const errorMsg = await screen.findByText(
      /Hubo un fallo en el servidor. Intenta de nuevo/i,
    );
    expect(errorMsg).toBeInTheDocument();
  });
});
