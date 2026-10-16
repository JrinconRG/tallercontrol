import { render as renderComponent, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, vi, test, beforeEach } from "vitest";
import { ToastProvider } from "../../../hooks/useToast";
import { useGetColores } from "../../../features/procesos/application/hooks/useGetColores";
import CrearProceso from "../../../features/procesos/presentation/components/CrearProceso";

import { useObtenerReferenciasCofres } from "../../../features/cofres/application/hook/useObtenerReferenciasCofres";
import { useCrearProceso } from "../../../features/procesos/application/hooks/useCrearProceso";

const render = (ui, options) =>
  renderComponent(ui, { wrapper: ToastProvider, ...options });

vi.mock(
  "../../../features/cofres/application/hook/useObtenerReferenciasCofres",
);
vi.mock("../../../features/procesos/application/hooks/useCrearProceso");
vi.mock("../../../features/procesos/application/hooks/useGetColores");

async function selectOption(label, option) {
  fireEvent.click(screen.getByRole("button", { name: label }));
  fireEvent.click(await screen.findByRole("option", { name: option }));
}

describe("Test Caja Blanca - Crear Proceso", () => {
  const mockEjecutarCrearProceso = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    useObtenerReferenciasCofres.mockReturnValue({
      referencias: [{ id: 1, nombre: "Imperial", codigo: "104" }],
      loading: false,
    });

    useCrearProceso.mockReturnValue({
      mutate: mockEjecutarCrearProceso,
      isPending: false,
    });
    useGetColores.mockReturnValue({
      colores: [{ id: 3, nombre: "Rojo", hex: "#ff0000" }],
      loading: false,
    });
  });

  // Test 1: CP-1.1 Camino exitoso
  test("Cp-1.1 Debe crear el proceso exitosamente", async () => {
    //arrange
    const onSuccess = vi.fn();
    const onClose = vi.fn();

    mockEjecutarCrearProceso.mockImplementation((_, options) => {
      options.onSuccess({ codigo: "PROC-001" });
    });

    //act

    render(<CrearProceso onClose={onClose} onSuccess={onSuccess} />);

    await selectOption("Referencia de cofre", "Imperial(104)");
    await selectOption("Color del cofre", "Rojo");

    fireEvent.click(screen.getByRole("button", { name: /Crear Proceso/i }));

    //assert

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(
        expect.objectContaining({
          tipo: "creado",
          codigo: "PROC-001",
          nombre: "Imperial",
        }),
      );
      expect(onClose).toHaveBeenCalled();
      expect(mockEjecutarCrearProceso).toHaveBeenCalledWith(
        { referenciaId: 1, colorId: 3 },
        expect.any(Object),
      );
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
    mockEjecutarCrearProceso.mockImplementation((_, options) => {
      options.onError(new Error("Fallo"));
    });

    render(<CrearProceso onSuccess={vi.fn()} onClose={vi.fn()} />);

    await selectOption("Referencia de cofre", "Imperial(104)");
    await selectOption("Color del cofre", "Rojo");

    fireEvent.click(screen.getByRole("button", { name: /Crear Proceso/i }));

    const errorMsg = await screen.findByText(/Ocurrió un error inesperado/i);
    expect(errorMsg).toBeInTheDocument();
  });
});
