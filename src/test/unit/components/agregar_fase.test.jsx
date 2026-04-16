import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import AgregarFase from "../../../pages/Gerente/Empleados/funciones/AgregarFase";
import * as useCargoTrabajadorHook from "../../../hooks/useCargoTrabajador";
import * as cargosService from "../../../services/cargos";

// ─── Mocks ────────────────────────────────────────────────────────────────────
vi.mock("../../../hooks/useCargoTrabajador", () => ({
  useCrearCargoTrabajador: vi.fn(),
}));

vi.mock("../../../services/cargos", () => ({
  obtenerCargos: vi.fn(),
}));

// ─── Datos de prueba ──────────────────────────────────────────────────────────
const cargosMock = [
  { c_id: 1, c_nombre: "Tapizador" },
  { c_id: 2, c_nombre: "Pulidor" },
  { c_id: 3, c_nombre: "Pintor" },
];

// ─── Setup por defecto ────────────────────────────────────────────────────────
beforeEach(() => {
  vi.clearAllMocks();

  cargosService.obtenerCargos.mockResolvedValue(cargosMock);

  useCargoTrabajadorHook.useCrearCargoTrabajador.mockReturnValue({
    crearCargoTrabajadorHook: vi.fn().mockResolvedValue(true),
    loading: false,
    error: null,
  });
});

// ─── Tests ────────────────────────────────────────────────────────────────────
describe("Test Caja Blanca - AgregarFase", () => {
  // CP-1.1: El popover se abre al hacer clic en el botón
  test("CP-1.1: Debe abrir el popover al hacer clic en '+ Agregar fase'", async () => {
    render(
      <AgregarFase
        trabajadorId="T-001"
        cargosAsignados={[]}
        onSuccess={vi.fn()}
      />,
    );

    // El input de búsqueda no debe estar visible aún
    expect(
      screen.queryByPlaceholderText(/Buscar fase/i),
    ).not.toBeInTheDocument();

    // ACT
    fireEvent.click(screen.getByText(/Agregar fase/i));

    // ASSERT — el popover y los cargos aparecen
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Buscar fase/i)).toBeInTheDocument();
      expect(screen.getByText("Tapizador")).toBeInTheDocument();
      expect(screen.getByText("Pulidor")).toBeInTheDocument();
    });
  });

  // CP-1.2: Camino exitoso — seleccionar y asignar una fase
  test("CP-1.2: Debe llamar a onSuccess con los cargos seleccionados al asignar", async () => {
    // ARRANGE
    const onSuccess = vi.fn().mockResolvedValue(undefined);
    render(
      <AgregarFase
        trabajadorId="T-001"
        cargosAsignados={[]}
        onSuccess={onSuccess}
      />,
    );

    // Abrimos el popover
    fireEvent.click(screen.getByText(/Agregar fase/i));
    await waitFor(() => screen.getByText("Tapizador"));

    // ACT — seleccionamos "Tapizador"
    fireEvent.click(screen.getByText("Tapizador"));

    // Verificamos que el badge de selección aparece
    expect(screen.getByText(/1 seleccionadas/i)).toBeInTheDocument();

    // Confirmamos la asignación
    fireEvent.click(screen.getByText("Asignar"));

    // ASSERT
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(
        expect.objectContaining({
          seleccionados: expect.arrayContaining([
            expect.objectContaining({ c_id: 1, c_nombre: "Tapizador" }),
          ]),
          trabajadorId: "T-001",
        }),
      );
    });
  });

  // CP-1.3: Fase ya asignada no debe ser seleccionable
  test("CP-1.3: Debe marcar como 'ya asignado' un cargo que el trabajador ya tiene", async () => {
    render(
      <AgregarFase
        trabajadorId="T-001"
        cargosAsignados={[{ id: 1, nombre: "Tapizador" }]} // Tapizador ya asignado
        onSuccess={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText(/Agregar fase/i));
    await waitFor(() => screen.getByText("Tapizador"));

    // ASSERT — debe aparecer el badge "ya asignado"
    expect(screen.getByText("ya asignado")).toBeInTheDocument();
  });

  // CP-1.4: Búsqueda filtra los cargos correctamente
  test("CP-1.4: Debe filtrar los cargos al escribir en el campo de búsqueda", async () => {
    render(
      <AgregarFase
        trabajadorId="T-001"
        cargosAsignados={[]}
        onSuccess={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText(/Agregar fase/i));
    await waitFor(() => screen.getByText("Tapizador"));

    // ACT — filtramos por "Puli"
    fireEvent.change(screen.getByPlaceholderText(/Buscar fase/i), {
      target: { value: "Puli" },
    });

    // ASSERT — solo "Pulidor" debe ser visible
    expect(screen.getByText("Pulidor")).toBeInTheDocument();
    expect(screen.queryByText("Tapizador")).not.toBeInTheDocument();
    expect(screen.queryByText("Pintor")).not.toBeInTheDocument();
  });

  // CP-1.5: Sin resultados en la búsqueda
  test("CP-1.5: Debe mostrar 'Sin resultados' si el filtro no encuentra cargos", async () => {
    render(
      <AgregarFase
        trabajadorId="T-001"
        cargosAsignados={[]}
        onSuccess={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText(/Agregar fase/i));
    await waitFor(() => screen.getByText("Tapizador"));

    // ACT — búsqueda que no coincide con nada
    fireEvent.change(screen.getByPlaceholderText(/Buscar fase/i), {
      target: { value: "XYZ999" },
    });

    // ASSERT
    expect(screen.getByText("Sin resultados")).toBeInTheDocument();
  });

  // CP-1.6: Cancelar limpia la selección
  test("CP-1.6: Debe limpiar la selección al hacer clic en Cancelar del multi-bar", async () => {
    render(
      <AgregarFase
        trabajadorId="T-001"
        cargosAsignados={[]}
        onSuccess={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText(/Agregar fase/i));
    await waitFor(() => screen.getByText("Tapizador"));

    // Seleccionamos un cargo
    fireEvent.click(screen.getByText("Tapizador"));
    expect(screen.getByText(/1 seleccionadas/i)).toBeInTheDocument();

    // ACT — cancelamos la selección
    fireEvent.click(screen.getByText("Cancelar"));

    // ASSERT — el badge desaparece (selección limpia)
    await waitFor(() => {
      expect(screen.queryByText(/1 seleccionadas/i)).not.toBeInTheDocument();
    });
  });

  // CP-1.7: Selección múltiple — badge muestra la cantidad correcta
  test("CP-1.7: Debe actualizar el contador al seleccionar varios cargos", async () => {
    render(
      <AgregarFase
        trabajadorId="T-001"
        cargosAsignados={[]}
        onSuccess={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText(/Agregar fase/i));
    await waitFor(() => screen.getByText("Tapizador"));

    // ACT — seleccionamos dos cargos
    fireEvent.click(screen.getByText("Tapizador"));
    fireEvent.click(screen.getByText("Pulidor"));

    // ASSERT
    expect(screen.getByText(/2 seleccionadas/i)).toBeInTheDocument();
  });
});
