import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import Tarifas from "../../../pages/Gerente/Tarifas/Tarifas";

import { useObtenerTarifas } from "../../../features/tarifas/application/hooks/useObtenerTarifas";
import { useGuardarTarifas } from "../../../features/tarifas/application/hooks/useGuardarTarifas";
import { useTrabajadoresSelect } from "../../../features/Trabajadores/application/hooks/useTrabajadoresSelect";
import * as matrizUtils from "../../../utils/construirMatrizTarifas";

vi.mock("../../../features/tarifas/application/hooks/useObtenerTarifas");
vi.mock("../../../features/tarifas/application/hooks/useGuardarTarifas");
vi.mock(
  "../../../features/Trabajadores/application/hooks/useTrabajadoresSelect",
);
vi.mock("../../../utils/construirMatrizTarifas", () => ({
  detectarCambios: vi.fn(),
}));

const mockTrabajadores = [{ value: "W-1", label: "Juan García" }];

describe("Regresión: Página de Tarifas", () => {
  const mockMutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup por defecto de los hooks
    useTrabajadoresSelect.mockReturnValue({
      trabajadoresSelect: mockTrabajadores,
      loading: false,
    });

    useObtenerTarifas.mockReturnValue({
      cargos: [{ id: 10, nombre: "Tapizador" }],
      referencias: [{ id: 1, nombre: "Imperial" }],
      precios: { 1: { 10: 50000 } },
      loading: false,
      error: null,
    });

    useGuardarTarifas.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      error: null,
    });

    //  no hay cambios
    matrizUtils.detectarCambios.mockReturnValue([]);
  });

  test("CP-1.1: Debe mostrar el estado de carga inicial", () => {
    // ARRANGE
    useTrabajadoresSelect.mockReturnValue({
      trabajadoresSelect: [],
      loading: true,
    });

    // ACT
    render(<Tarifas />);

    // ASSERT
    expect(
      screen.getByText(/Cargando tarifas y trabajadores/i),
    ).toBeInTheDocument();
  });

  test("CP-1.2: Debe renderizar la tabla cuando se selecciona un trabajador", async () => {
    // ARRANGE
    render(<Tarifas />);

    // ACT
    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "W-1" } });

    // ASSERT
    expect(screen.getByText("Referencia")).toBeInTheDocument();
    expect(screen.getByText("Imperial")).toBeInTheDocument();
    expect(screen.getByText("Tapizador")).toBeInTheDocument();
  });

  test("CP-1.3: El boton Guardar debe habilitarse solo cuando hay cambios", async () => {
    //arrange
    render(<Tarifas />);

    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "W-1" } });

    //espera

    const input = await screen.findByPlaceholderText("0");

    matrizUtils.detectarCambios.mockReturnValue([
      { cofreId: 1, cargoId: 10, valor: 60000 },
    ]);

    // ACT
    fireEvent.change(input, { target: { value: "60000" } });

    // ASSERT
    const btnGuardar = screen.getByRole("button", { name: /Guardar/i });

    await waitFor(() => {
      expect(btnGuardar).not.toBeDisabled();
      expect(screen.getByText(/1 cambio sin guardar/i)).toBeInTheDocument();
    });
  });

  test("CP-1.4: Debe manejar el flujo de guardado exitoso", async () => {
    // ARRANGE
    const cambio = [{ cofreId: 1, cargoId: 10, valor: 60000 }];
    matrizUtils.detectarCambios.mockReturnValue(cambio);

    mockMutate.mockImplementation((data, options) => {
      options.onSuccess();
    });

    render(<Tarifas />);

    // ACT
    const btnGuardar = screen.getByRole("button", { name: /Guardar/i });
    fireEvent.click(btnGuardar);

    // ASSERT
    expect(mockMutate).toHaveBeenCalledWith(cambio, expect.any(Object));
    expect(
      await screen.findByText(/Tarifas actualizadas correctamente/i),
    ).toBeInTheDocument();
  });

  test("CP-1.5: Debe mostrar error si la mutate de guardado falla", async () => {
    // ARRANGE
    matrizUtils.detectarCambios.mockReturnValue([{ id: 1 }]);
    const errorMsg = "Error crítico de base de datos";

    mockMutate.mockImplementation((data, options) => {
      options.onError({ message: errorMsg });
    });

    render(<Tarifas />);

    // ACT
    fireEvent.click(screen.getByRole("button", { name: /Guardar/i }));

    // ASSERT
    expect(await screen.findByText(errorMsg)).toBeInTheDocument();
  });
});
