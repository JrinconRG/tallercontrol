import { describe, test, expect, vi, beforeEach } from "vitest";
import Empleados from "../../../pages/Gerente/Empleados/Empleados";
import * as useTrabajadoresHook from "../../../hooks/useTrabajadores";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { within } from "@testing-library/dom"; // ← cambiar a esta línea

// ─── Mocks de dependencias ────────────────────────────────────────────────────

// Mockeamos el hook principal de empleados
vi.mock("../../../hooks/useTrabajadores", () => ({
  useEmpleadosConCargos: vi.fn(),
  useTrabajadoresSelect: vi.fn(),
}));

// Mockeamos los sub-componentes del drawer para aislar la lógica de Empleados
vi.mock(
  "../../../pages/Gerente/Empleados/funciones/RegistrarEmpleados",
  () => ({
    default: ({ onClose, onSuccess }) => (
      <div data-testid="modal-registrar-empleado">
        <button onClick={onClose}>Cancelar</button>
        <button onClick={onSuccess}>Registrar</button>
      </div>
    ),
  }),
);

vi.mock("../../../pages/Gerente/Empleados/funciones/AgregarFase", () => ({
  default: ({ onSuccess }) => (
    <button
      onClick={() =>
        onSuccess({
          seleccionados: [{ c_id: 99, c_nombre: "Pulidor" }],
          trabajadorId: "T-001",
        })
      }
    >
      + Agregar fase
    </button>
  ),
}));

vi.mock("../../../pages/Gerente/Empleados/funciones/EliminarFase", () => ({
  default: ({ cargo, onSuccess }) => (
    <div data-testid={`chip-${cargo.id}`}>
      {cargo.nombre}
      <button
        aria-label={`Eliminar fase ${cargo.nombre}`}
        onClick={() => onSuccess(cargo)}
      >
        ×
      </button>
    </div>
  ),
}));

// ─── Datos de prueba ──────────────────────────────────────────────────────────
const empleadoMock = {
  t_id: "T-001",
  nombre_completo: "Juan García",
  t_numero_de_documento: "123456789",
  t_celular: "3001234567",
  cargos: [{ id: 10, nombre: "Tapizador" }],
};

// ─── Setup por defecto ────────────────────────────────────────────────────────
beforeEach(() => {
  vi.clearAllMocks();

  useTrabajadoresHook.useEmpleadosConCargos.mockReturnValue({
    empleados: [empleadoMock],
    loading: false,
    error: null,
    refetch: vi.fn(),
  });
});

// ─── Tests ────────────────────────────────────────────────────────────────────
describe("Test Caja Blanca - Visualizar Empleados", () => {
  // CP-1.1: Estado de carga
  test("CP-1.1: Debe mostrar 'Cargando empleados...' mientras se cargan los datos", () => {
    // ARRANGE — sobreescribimos con loading: true
    useTrabajadoresHook.useEmpleadosConCargos.mockReturnValue({
      empleados: [],
      loading: true,
      error: null,
      refetch: vi.fn(),
    });

    render(<Empleados />);

    // ASSERT
    expect(screen.getByText(/Cargando empleados/i)).toBeInTheDocument();
    // La tabla NO debe aparecer
    expect(screen.queryByText(/Registrar empleado/i)).not.toBeInTheDocument();
  });

  // CP-1.2: Renderizado de la tabla con empleados
  test("CP-1.2: Debe mostrar la tabla con los empleados cargados", () => {
    render(<Empleados />);

    // ASSERT — datos del empleado visible en tabla
    expect(screen.getByText("Juan García")).toBeInTheDocument();
    expect(screen.getByText("123456789")).toBeInTheDocument();
    expect(screen.getByText("3001234567")).toBeInTheDocument();
  });

  // CP-1.3: Abrir modal de registro
  test("CP-1.3: Debe abrir el modal de registro al hacer clic en '+ Registrar empleado'", async () => {
    render(<Empleados />);

    // Verificamos que el modal NO está abierto
    expect(
      screen.queryByTestId("modal-registrar-empleado"),
    ).not.toBeInTheDocument();

    // ACT
    fireEvent.click(screen.getByText(/Registrar empleado/i));

    // ASSERT
    await waitFor(() => {
      expect(
        screen.getByTestId("modal-registrar-empleado"),
      ).toBeInTheDocument();
    });
  });

  // CP-1.4: Cerrar modal al cancelar
  test("CP-1.4: Debe cerrar el modal al hacer clic en Cancelar", async () => {
    render(<Empleados />);

    fireEvent.click(screen.getByText(/Registrar empleado/i));
    await waitFor(() =>
      expect(
        screen.getByTestId("modal-registrar-empleado"),
      ).toBeInTheDocument(),
    );

    // ACT
    fireEvent.click(screen.getByText("Cancelar"));

    // ASSERT
    await waitFor(() => {
      expect(
        screen.queryByTestId("modal-registrar-empleado"),
      ).not.toBeInTheDocument();
    });
  });

  // CP-1.5: Cerrar modal y refrescar al registrar con éxito
  test("CP-1.5: Debe cerrar el modal y llamar a refetch al registrar un empleado", async () => {
    // ARRANGE
    const refetch = vi.fn();
    useTrabajadoresHook.useEmpleadosConCargos.mockReturnValue({
      empleados: [empleadoMock],
      loading: false,
      error: null,
      refetch,
    });

    render(<Empleados />);

    // ACT — abrimos y confirmamos el registro
    fireEvent.click(screen.getByText(/Registrar empleado/i));
    await waitFor(() => screen.getByTestId("modal-registrar-empleado"));
    fireEvent.click(screen.getByText("Registrar"));

    // ASSERT
    await waitFor(() => {
      expect(
        screen.queryByTestId("modal-registrar-empleado"),
      ).not.toBeInTheDocument();
      expect(refetch).toHaveBeenCalled();
    });
  });

  // CP-1.6: Abrir drawer al hacer clic en una fila
  test("CP-1.6: Debe abrir el drawer de detalle al hacer clic en un empleado", async () => {
    render(<Empleados />);

    // ACT — clic sobre la fila del empleado
    fireEvent.click(screen.getByText("Juan García"));

    // ASSERT — el drawer aparece con la información del empleado
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      const drawer = screen.getByRole("dialog");
      expect(within(drawer).getByText(/FASES ASIGNADAS/i)).toBeInTheDocument();
    });
  });

  // CP-1.7: Cerrar drawer con botón X
  test("CP-1.7: Debe cerrar el drawer al hacer clic en el botón X", async () => {
    render(<Empleados />);

    // Abrimos el drawer
    fireEvent.click(screen.getByText("Juan García"));
    await waitFor(() => screen.getByRole("dialog"));

    // ACT — cerramos
    fireEvent.click(screen.getByLabelText(/Cerrar detalle/i));

    // ASSERT
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  // CP-1.8: Tabla vacía sin empleados
  test("CP-1.8: Debe renderizar la tabla sin filas cuando no hay empleados", () => {
    // ARRANGE
    useTrabajadoresHook.useEmpleadosConCargos.mockReturnValue({
      empleados: [],
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<Empleados />);

    // ASSERT — título y encabezados presentes, pero ningún nombre de empleado
    expect(screen.getByText("Empleados")).toBeInTheDocument();
    expect(screen.queryByText("Juan García")).not.toBeInTheDocument();
  });
});
