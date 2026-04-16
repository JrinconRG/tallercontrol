import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import EliminarFase from "../../../pages/Gerente/Empleados/funciones/EliminarFase";
import * as useCargoTrabajadorHook from "../../../hooks/useCargoTrabajador";

// ─── Mock del hook ────────────────────────────────────────────────────────────
vi.mock("../../../hooks/useCargoTrabajador", () => ({
  useEliminarCargoTrabajador: vi.fn(),
}));

// ─── Datos de prueba ──────────────────────────────────────────────────────────
const cargoMock = { id: 10, nombre: "Tapizador" };

const colorsMock = {
  bg: "hsl(200, 70%, 85%)",
  border: "hsl(200, 60%, 65%)",
  text: "hsl(200, 40%, 25%)",
};

// ─── Setup por defecto ────────────────────────────────────────────────────────
beforeEach(() => {
  vi.clearAllMocks();

  useCargoTrabajadorHook.useEliminarCargoTrabajador.mockReturnValue({
    eliminarCargoTrabajadorHook: vi.fn().mockResolvedValue(true),
    loading: false,
    error: null,
  });
});

// ─── Tests ────────────────────────────────────────────────────────────────────
describe("Test Caja Blanca - EliminarFase", () => {
  // CP-1.1: Render inicial — debe mostrar el chip con el nombre del cargo
  test("CP-1.1: Debe mostrar el nombre del cargo y el botón de eliminar", () => {
    render(
      <EliminarFase
        cargo={cargoMock}
        trabajadorId="T-001"
        colors={colorsMock}
        onSuccess={vi.fn()}
      />,
    );

    // ASSERT
    expect(screen.getByText("Tapizador")).toBeInTheDocument();
    expect(
      screen.getByLabelText(/Eliminar fase Tapizador/i),
    ).toBeInTheDocument();
  });

  // CP-1.2: Clic en × muestra el modo confirmación
  test("CP-1.2: Debe mostrar el modo confirmación al hacer clic en el botón ×", () => {
    render(
      <EliminarFase
        cargo={cargoMock}
        trabajadorId="T-001"
        colors={colorsMock}
        onSuccess={vi.fn()}
      />,
    );

    // ACT — clic en el botón ×
    fireEvent.click(screen.getByLabelText(/Eliminar fase Tapizador/i));

    // ASSERT — aparece el mensaje de confirmación
    expect(screen.getByText(/¿Eliminar Tapizador/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirmar eliminación/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Cancelar/i)).toBeInTheDocument();
  });

  // CP-1.3: Camino exitoso — confirmar eliminación llama a onSuccess
  test("CP-1.3: Debe llamar a onSuccess con el cargo al confirmar la eliminación", async () => {
    // ARRANGE
    const onSuccess = vi.fn();
    render(
      <EliminarFase
        cargo={cargoMock}
        trabajadorId="T-001"
        colors={colorsMock}
        onSuccess={onSuccess}
      />,
    );

    // ACT — abrir confirmación y confirmar
    fireEvent.click(screen.getByLabelText(/Eliminar fase Tapizador/i));
    fireEvent.click(screen.getByLabelText(/Confirmar eliminación/i));

    // ASSERT
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(cargoMock);
    });
  });

  // CP-1.4: Cancelar en modo confirmación vuelve al chip normal
  test("CP-1.4: Debe volver al chip normal al hacer clic en No", () => {
    render(
      <EliminarFase
        cargo={cargoMock}
        trabajadorId="T-001"
        colors={colorsMock}
        onSuccess={vi.fn()}
      />,
    );

    // Entramos al modo confirmación
    fireEvent.click(screen.getByLabelText(/Eliminar fase Tapizador/i));
    expect(screen.getByText(/¿Eliminar Tapizador/i)).toBeInTheDocument();

    // ACT — cancelamos
    fireEvent.click(screen.getByLabelText(/Cancelar/i));

    // ASSERT — volvemos al chip normal
    expect(screen.getByText("Tapizador")).toBeInTheDocument();
    expect(screen.queryByText(/¿Eliminar Tapizador/i)).not.toBeInTheDocument();
  });

  // CP-1.5: Cargo inválido — no llama al servicio si cargo.id es undefined
  test("CP-1.5: Debe hacer console.warn y no llamar al servicio si cargo.id es inválido", async () => {
    // ARRANGE
    const eliminarCargoTrabajadorHook = vi.fn();
    useCargoTrabajadorHook.useEliminarCargoTrabajador.mockReturnValue({
      eliminarCargoTrabajadorHook,
      loading: false,
      error: null,
    });
    const consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const onSuccess = vi.fn();

    render(
      <EliminarFase
        cargo={{ id: undefined, nombre: "Tapizador" }} // id inválido
        trabajadorId="T-001"
        colors={colorsMock}
        onSuccess={onSuccess}
      />,
    );

    // ACT — abrimos confirmación y confirmamos
    fireEvent.click(screen.getByLabelText(/Eliminar fase Tapizador/i));
    fireEvent.click(screen.getByLabelText(/Confirmar eliminación/i));

    // ASSERT
    await waitFor(() => {
      expect(consoleWarn).toHaveBeenCalled();
      expect(eliminarCargoTrabajadorHook).not.toHaveBeenCalled();
      expect(onSuccess).not.toHaveBeenCalled();
    });
  });

  // CP-1.6: Error del servicio — no llama a onSuccess
  test("CP-1.6: Debe manejar el error del servicio sin llamar a onSuccess", async () => {
    // ARRANGE
    useCargoTrabajadorHook.useEliminarCargoTrabajador.mockReturnValue({
      eliminarCargoTrabajadorHook: vi
        .fn()
        .mockRejectedValue(new Error("Error de red")),
      loading: false,
      error: null,
    });
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const onSuccess = vi.fn();

    render(
      <EliminarFase
        cargo={cargoMock}
        trabajadorId="T-001"
        colors={colorsMock}
        onSuccess={onSuccess}
      />,
    );

    // ACT
    fireEvent.click(screen.getByLabelText(/Eliminar fase Tapizador/i));
    fireEvent.click(screen.getByLabelText(/Confirmar eliminación/i));

    // ASSERT
    await waitFor(() => {
      expect(onSuccess).not.toHaveBeenCalled();
      expect(consoleError).toHaveBeenCalled();
    });
  });
});
