import { render, screen, fireEvent } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import RegistrarEmpleados from "../../../pages/Gerente/Empleados/funciones/RegistrarEmpleados";
import { useCrearTrabajador } from "../../../features/Trabajadores/application/hooks/useCrearEmpleado";

// ─── ESTRATEGIA DE MOCK (FIRST: Isolated) ──────────────────────────────────────
vi.mock(
  "../../../features/Trabajadores/application/hooks/useCrearEmpleado",
  () => ({
    useCrearTrabajador: vi.fn(),
  }),
);

describe("Regresión: Componente RegistrarEmpleados", () => {
  const mockMutate = vi.fn();
  const mockOnClose = vi.fn();
  const mockOnToast = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Setup del mock para React Query Mutation
    useCrearTrabajador.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });
  });

  // Helper para cumplir con DRY y facilitar el Arrange
  const llenarFormularioValido = () => {
    fireEvent.change(screen.getByLabelText(/Nombre/i), {
      target: { value: "Juan Alberto" },
    });
    fireEvent.change(screen.getByLabelText(/Apellidos/i), {
      target: { value: "Rincon Garcia" },
    });
    fireEvent.change(screen.getByLabelText(/Número de Documento/i), {
      target: { value: "1000234567" },
    });
    fireEvent.change(screen.getByLabelText(/Celular/i), {
      target: { value: "3004567890" },
    });
  };

  test("CP-1.1: Debe ejecutar la mutación con los datos correctos cuando el formulario es válido", async () => {
    // ARRANGE
    render(<RegistrarEmpleados onClose={mockOnClose} onToast={mockOnToast} />);

    // ACT
    llenarFormularioValido();
    fireEvent.click(screen.getByRole("button", { name: /Registrar/i }));

    // ASSERT (Fluent-like assertions)
    expect(mockMutate).toHaveBeenCalledTimes(1);
    expect(mockMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        nombre: "Juan Alberto",
        numeroDocumento: "1000234567",
      }),
      expect.any(Object),
    );
  });

  test("CP-1.2: No debe llamar a la mutación si los campos están vacíos (Guard Clause)", async () => {
    // ARRANGE
    render(<RegistrarEmpleados onClose={mockOnClose} onToast={mockOnToast} />);

    // ACT
    fireEvent.click(screen.getByRole("button", { name: /Registrar/i }));

    // ASSERT
    const error = await screen.findByText(
      /Por favor, complete todos los campos/i,
    );
    expect(error).toBeInTheDocument();
    expect(mockMutate).not.toHaveBeenCalled();
  });

  test("CP-1.3: Debe mostrar error de validación si el celular no tiene 10 dígitos", async () => {
    // ARRANGE
    render(<RegistrarEmpleados onClose={mockOnClose} onToast={mockOnToast} />);

    // ACT
    llenarFormularioValido();
    fireEvent.change(screen.getByLabelText(/Celular/i), {
      target: { value: "123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Registrar/i }));

    // ASSERT
    const error = await screen.findByText(
      /El celular debe tener exactamente 10 dígitos/i,
    );
    expect(error).toBeInTheDocument();
    expect(mockMutate).not.toHaveBeenCalled();
  });

  test("CP-1.4: Debe manejar el éxito de la mutación llamando a onToast y onClose", async () => {
    // ARRANGE
    // Simulamos que el onSuccess de la mutación se ejecuta
    mockMutate.mockImplementation((data, options) => {
      options.onSuccess();
    });
    render(<RegistrarEmpleados onClose={mockOnClose} onToast={mockOnToast} />);

    // ACT
    llenarFormularioValido();
    fireEvent.click(screen.getByRole("button", { name: /Registrar/i }));

    // ASSERT
    expect(mockOnToast).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining("registrado exitosamente"),
      }),
    );
    expect(mockOnClose).toHaveBeenCalled();
  });

  test("CP-1.5: Debe mostrar el mensaje de error cuando la mutación falla (Caja Blanca)", async () => {
    // ARRANGE
    const serverError = "El documento ya existe";
    mockMutate.mockImplementation((data, options) => {
      options.onError({ response: { data: { message: serverError } } });
    });
    render(<RegistrarEmpleados onClose={mockOnClose} onToast={mockOnToast} />);

    // ACT
    llenarFormularioValido();
    fireEvent.click(screen.getByRole("button", { name: /Registrar/i }));

    // ASSERT
    const errorMsg = await screen.findByText(serverError);
    expect(errorMsg).toBeInTheDocument();
    expect(mockOnClose).not.toHaveBeenCalled();
  });
});
