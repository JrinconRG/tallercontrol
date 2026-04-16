import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import RegistrarEmpleados from "../../../pages/Gerente/Empleados/funciones/RegistrarEmpleados";
import * as useEmpleadosHook from "../../../hooks/useEmpleados";

// ─── Mock del hook ────────────────────────────────────────────────────────────
vi.mock("../../../hooks/useEmpleados", () => ({
  useCrearEmpleado: vi.fn(),
}));

// ─── Helper: llenar todos los campos del formulario ──────────────────────────
async function llenarFormulario({
  nombre = "Juan",
  apellidos = "García",
  documento = "123456789",
  celular = "3001234567",
} = {}) {
  fireEvent.change(screen.getByLabelText(/Apellidos/i), {
    target: { value: apellidos },
  });
  fireEvent.change(screen.getByLabelText(/Número de Documento/i), {
    target: { value: documento },
  });
  fireEvent.change(screen.getByLabelText(/Celular/i), {
    target: { value: celular },
  });
  // El campo Nombre usa <labe> (typo en el componente), se busca por id
  fireEvent.change(
    screen.getByDisplayValue("") || document.querySelector("#nombre-registro"),
    {
      target: { value: nombre },
    },
  );
  // Estrategia robusta: buscamos el input por id directamente
  const inputNombre = document.querySelector("#nombre-registro");
  if (inputNombre) {
    fireEvent.change(inputNombre, { target: { value: nombre } });
  }
}

// ─── Setup por defecto ────────────────────────────────────────────────────────
beforeEach(() => {
  vi.clearAllMocks();

  useEmpleadosHook.useCrearEmpleado.mockReturnValue({
    crearEmpleadoHook: vi.fn().mockResolvedValue(true),
    loading: false,
    error: null,
  });
});

// ─── Tests ────────────────────────────────────────────────────────────────────
describe("Test Caja Blanca - RegistrarEmpleados", () => {
  // CP-1.1: Camino exitoso — todos los campos completos
  test("CP-1.1: Debe llamar a onSuccess y onClose cuando el registro es exitoso", async () => {
    // ARRANGE
    const onSuccess = vi.fn();
    const onClose = vi.fn();
    render(<RegistrarEmpleados onClose={onClose} onSuccess={onSuccess} />);

    // ACT — llenamos los campos
    const inputNombre = document.querySelector("#nombre-registro");
    fireEvent.change(inputNombre, { target: { value: "Juan" } });
    fireEvent.change(screen.getByLabelText(/Apellidos/i), {
      target: { value: "García" },
    });
    fireEvent.change(screen.getByLabelText(/Número de Documento/i), {
      target: { value: "123456789" },
    });
    fireEvent.change(screen.getByLabelText(/Celular/i), {
      target: { value: "3001234567" },
    });

    fireEvent.click(screen.getByText("Registrar"));

    // ASSERT
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledOnce();
      expect(onClose).toHaveBeenCalledOnce();
    });
  });

  // CP-1.2: Campos vacíos — debe mostrar error de validación
  test("CP-1.2: Debe mostrar error si algún campo está vacío al confirmar", async () => {
    // ARRANGE
    const crearEmpleadoHook = vi.fn();
    useEmpleadosHook.useCrearEmpleado.mockReturnValue({
      crearEmpleadoHook,
      loading: false,
      error: null,
    });
    render(<RegistrarEmpleados onClose={vi.fn()} onSuccess={vi.fn()} />);

    // ACT — clic sin llenar ningún campo
    fireEvent.click(screen.getByText("Registrar"));

    // ASSERT
    expect(
      await screen.findByText(/Por favor, complete todos los campos/i),
    ).toBeInTheDocument();
    expect(crearEmpleadoHook).not.toHaveBeenCalled();
  });

  // CP-1.3: Campos parciales — sólo falta un campo
  test("CP-1.3: Debe mostrar error si falta al menos un campo (sólo nombre vacío)", async () => {
    // ARRANGE
    const crearEmpleadoHook = vi.fn();
    useEmpleadosHook.useCrearEmpleado.mockReturnValue({
      crearEmpleadoHook,
      loading: false,
      error: null,
    });
    render(<RegistrarEmpleados onClose={vi.fn()} onSuccess={vi.fn()} />);

    fireEvent.change(screen.getByLabelText(/Apellidos/i), {
      target: { value: "García" },
    });
    fireEvent.change(screen.getByLabelText(/Número de Documento/i), {
      target: { value: "123456789" },
    });
    fireEvent.change(screen.getByLabelText(/Celular/i), {
      target: { value: "3001234567" },
    });

    fireEvent.click(screen.getByText("Registrar"));

    // ASSERT — nombre vacío activa el guard
    expect(
      await screen.findByText(/Por favor, complete todos los campos/i),
    ).toBeInTheDocument();
    expect(crearEmpleadoHook).not.toHaveBeenCalled();
  });

  // CP-1.4: Error del servidor — el hook lanza excepción
  test("CP-1.4: Debe mostrar mensaje de error si el hook lanza excepción", async () => {
    // ARRANGE
    useEmpleadosHook.useCrearEmpleado.mockReturnValue({
      crearEmpleadoHook: vi
        .fn()
        .mockRejectedValue(new Error("Error inesperado del servidor")),
      loading: false,
      error: null,
    });
    const onSuccess = vi.fn();
    render(<RegistrarEmpleados onClose={vi.fn()} onSuccess={onSuccess} />);

    // ACT — llenamos todos los campos y confirmamos
    const inputNombre = document.querySelector("#nombre-registro");
    fireEvent.change(inputNombre, { target: { value: "Juan" } });
    fireEvent.change(screen.getByLabelText(/Apellidos/i), {
      target: { value: "García" },
    });
    fireEvent.change(screen.getByLabelText(/Número de Documento/i), {
      target: { value: "123456789" },
    });
    fireEvent.change(screen.getByLabelText(/Celular/i), {
      target: { value: "3001234567" },
    });

    fireEvent.click(screen.getByText("Registrar"));

    // ASSERT
    expect(
      await screen.findByText(/Error inesperado del servidor/i),
    ).toBeInTheDocument();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  // CP-1.5: Botón Cancelar — cierra el modal sin llamar al servicio
  test("CP-1.5: Debe llamar a onClose al hacer clic en Cancelar sin llamar al hook", () => {
    // ARRANGE
    const crearEmpleadoHook = vi.fn();
    useEmpleadosHook.useCrearEmpleado.mockReturnValue({
      crearEmpleadoHook,
      loading: false,
      error: null,
    });
    const onClose = vi.fn();
    render(<RegistrarEmpleados onClose={onClose} onSuccess={vi.fn()} />);

    // ACT
    fireEvent.click(screen.getByText("Cancelar"));

    // ASSERT
    expect(onClose).toHaveBeenCalledOnce();
    expect(crearEmpleadoHook).not.toHaveBeenCalled();
  });
});
