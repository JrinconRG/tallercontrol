import { render, screen, fireEvent } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import EliminarFase from "../../../pages/Gerente/Empleados/funciones/EliminarFase";
import * as useDesignarCargosHook from "../../../features/Trabajadores/application/hooks/useDesignarCargo";

vi.mock(
  "../../../features/Trabajadores/application/hooks/useDesignarCargo",
  () => ({
    useDesignarCargos: vi.fn(),
  }),
);

const cargoMock = { id: 10, nombre: "Tapizador" };

const colorsMock = {
  bg: "hsl(200, 70%, 85%)",
  border: "hsl(200, 60%, 65%)",
  text: "hsl(200, 40%, 25%)",
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("REGRESION - EliminarFase", () => {
  test("CP1 debe renderizar el chip con el nombre del cargo", () => {
    // ARRANGE
    const onToast = vi.fn();

    useDesignarCargosHook.useDesignarCargos.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    });

    render(
      <EliminarFase
        cargo={cargoMock}
        trabajadorId="T-001"
        colors={colorsMock}
        onToast={onToast}
      />,
    );

    // ACT
    const chip = screen.getByText("Tapizador");
    const button = screen.getByLabelText(/Eliminar fase Tapizador/i);

    // ASSERT
    expect(chip).toBeInTheDocument();
    expect(button).toBeInTheDocument();
  });

  test("CP2 debe mostrar confirmacion al hacer click en eliminar", () => {
    // ARRANGE
    const onToast = vi.fn();

    useDesignarCargosHook.useDesignarCargos.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    });

    render(
      <EliminarFase
        cargo={cargoMock}
        trabajadorId="T-001"
        colors={colorsMock}
        onToast={onToast}
      />,
    );

    // ACT
    fireEvent.click(screen.getByLabelText(/Eliminar fase Tapizador/i));

    // ASSERT
    expect(screen.getByText(/¿Eliminar Tapizador/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirmar eliminación/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Cancelar/i)).toBeInTheDocument();
  });

  test("CP3 debe ejecutar eliminacion exitosa y mostrar toast", () => {
    // ARRANGE
    const onToast = vi.fn();

    useDesignarCargosHook.useDesignarCargos.mockReturnValue({
      mutate: (vars, options) => {
        options.onSuccess();
      },
      isPending: false,
    });

    render(
      <EliminarFase
        cargo={cargoMock}
        trabajadorId="T-001"
        colors={colorsMock}
        onToast={onToast}
      />,
    );

    // ACT
    fireEvent.click(screen.getByLabelText(/Eliminar fase Tapizador/i));
    fireEvent.click(screen.getByLabelText(/Confirmar eliminación/i));

    // ASSERT
    expect(onToast).toHaveBeenCalledWith({
      message: 'Fase "Tapizador" eliminada',
    });
  });

  test("CP4 debe cancelar y volver al estado inicial", () => {
    // ARRANGE
    const onToast = vi.fn();

    useDesignarCargosHook.useDesignarCargos.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    });

    render(
      <EliminarFase
        cargo={cargoMock}
        trabajadorId="T-001"
        colors={colorsMock}
        onToast={onToast}
      />,
    );

    fireEvent.click(screen.getByLabelText(/Eliminar fase Tapizador/i));

    // ACT
    fireEvent.click(screen.getByLabelText(/Cancelar/i));

    // ASSERT
    expect(screen.getByText("Tapizador")).toBeInTheDocument();
    expect(screen.queryByText(/¿Eliminar Tapizador/i)).not.toBeInTheDocument();
  });

  test("CP5 debe manejar error en eliminacion sin romper el flujo", () => {
    // ARRANGE
    const onToast = vi.fn();

    useDesignarCargosHook.useDesignarCargos.mockReturnValue({
      mutate: (vars, options) => {
        options.onError(new Error("Error de red"));
      },
      isPending: false,
    });

    render(
      <EliminarFase
        cargo={cargoMock}
        trabajadorId="T-001"
        colors={colorsMock}
        onToast={onToast}
      />,
    );

    // ACT
    fireEvent.click(screen.getByLabelText(/Eliminar fase Tapizador/i));
    fireEvent.click(screen.getByLabelText(/Confirmar eliminación/i));

    // ASSERT
    expect(onToast).toHaveBeenCalledWith({
      message: "Error de red",
    });
  });
});
