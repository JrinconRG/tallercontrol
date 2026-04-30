import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import AgregarFase from "../../../pages/Gerente/Empleados/funciones/AgregarFase";

import { useCargos } from "../../../features/cargos/application/hooks/useCargos";
import { useAsignarCargo } from "../../../features/Trabajadores/application/hooks/useAsignarCargo";

vi.mock("../../../features/cargos/application/hooks/useCargos", () => ({
  useCargos: vi.fn(),
}));

vi.mock(
  "../../../features/Trabajadores/application/hooks/useAsignarCargo",
  () => ({
    useAsignarCargo: vi.fn(),
  }),
);

// Datos simulando Objetos de Dominio (asumiendo que tienen el método esIgualA)
const mockCargos = [
  { id: 1, nombre: "Tapizador", esIgualA: (c) => c.id === 1 },
  { id: 2, nombre: "Pulidor", esIgualA: (c) => c.id === 2 },
  { id: 3, nombre: "Pintor", esIgualA: (c) => c.id === 3 },
];

describe("Regresion: Componente AgregarFase", () => {
  const mockMutateAsync = vi.fn();
  const mockOnToast = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock de carga de cargos
    useCargos.mockReturnValue({
      cargos: mockCargos,
      loading: false,
    });

    // Mock de la mutate de React Query
    useAsignarCargo.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
      isError: false,
    });
  });

  test("CP-1.1: Debe abrir el popover y mostrar la lista de cargos disponibles", async () => {
    // ARRANGE
    render(
      <AgregarFase
        trabajadorId="T-001"
        cargosAsignados={[]}
        onToast={mockOnToast}
      />,
    );

    // ACT
    fireEvent.click(screen.getByRole("button", { name: /\+ Agregar fase/i }));

    // ASSERT (Fluent)
    const searchInput = screen.getByPlaceholderText(/Buscar fase/i);
    expect(searchInput).toBeInTheDocument();
    expect(screen.getByText("Tapizador")).toBeInTheDocument();
    expect(screen.getByText("Pulidor")).toBeInTheDocument();
  });

  test("CP-1.2: Debe asignar múltiples cargos seleccionados exitosamente", async () => {
    // ARRANGE
    mockMutateAsync.mockResolvedValue({});
    render(
      <AgregarFase
        trabajadorId="T-001"
        cargosAsignados={[]}
        onToast={mockOnToast}
      />,
    );

    // ACT
    fireEvent.click(screen.getByText(/\+ Agregar fase/i));
    fireEvent.click(screen.getByText("Tapizador"));
    fireEvent.click(screen.getByText("Pulidor"));

    // Verificamos contador antes de confirmar
    expect(screen.getByText(/2 seleccionadas/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Asignar" }));

    // ASSERT
    await waitFor(() => {
      // Debe llamarse una vez por cada cargo seleccionado
      expect(mockMutateAsync).toHaveBeenCalledTimes(2);
      expect(mockMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({ cargoId: 1, trabajadorId: "T-001" }),
        expect.any(Object),
      );
    });
  });

  test("CP-1.3: No debe permitir seleccionar un cargo que ya está asignado", async () => {
    // ARRANGE
    // Pasamos el cargo 1 como ya asignado
    const cargosAsignados = [mockCargos[0]];
    render(
      <AgregarFase
        trabajadorId="T-001"
        cargosAsignados={cargosAsignados}
        onToast={mockOnToast}
      />,
    );

    // ACT
    fireEvent.click(screen.getByText(/\+ Agregar fase/i));

    // ASSERT
    const badge = screen.getByText(/ya asignado/i);
    expect(badge).toBeInTheDocument();

    // Intentar clickear no debería agregar al contador
    fireEvent.click(screen.getByText("Tapizador"));
    expect(screen.queryByText(/1 seleccionadas/i)).not.toBeInTheDocument();
  });

  test("CP-1.4: Debe filtrar la lista de cargos según la búsqueda", async () => {
    // ARRANGE
    render(
      <AgregarFase
        trabajadorId="T-001"
        cargosAsignados={[]}
        onToast={mockOnToast}
      />,
    );

    // ACT
    fireEvent.click(screen.getByText(/\+ Agregar fase/i));
    fireEvent.change(screen.getByPlaceholderText(/Buscar fase/i), {
      target: { value: "Pint" },
    });

    // ASSERT
    expect(screen.getByText("Pintor")).toBeInTheDocument();
    expect(screen.queryByText("Tapizador")).not.toBeInTheDocument();
  });

  test("CP-1.5: Debe mostrar 'Sin resultados' cuando el filtro no coincide", async () => {
    // ARRANGE
    render(
      <AgregarFase
        trabajadorId="T-001"
        cargosAsignados={[]}
        onToast={mockOnToast}
      />,
    );

    // ACT
    fireEvent.click(screen.getByText(/\+ Agregar fase/i));
    fireEvent.change(screen.getByPlaceholderText(/Buscar fase/i), {
      target: { value: "NoExiste" },
    });

    // ASSERT
    expect(screen.getByText(/Sin resultados/i)).toBeInTheDocument();
  });
});
