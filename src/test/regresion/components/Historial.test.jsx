import { render, screen, fireEvent } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import React from "react";
import Historial from "../../../pages/Trabajador/Historial/Historial";
import { useObtenerHistorialSubprocesosPendientes } from "../../../features/subProcesos/application/hooks/useObtenerHistorialSubprocesosPendientes";

vi.mock(
  "../../../features/subProcesos/application/hooks/useObtenerHistorialSubprocesosPendientes",
  () => ({
    useObtenerHistorialSubprocesosPendientes: vi.fn(),
  }),
);

vi.mock("../../../components/mostrarImagenModal/MostrarImagenModal", () => ({
  default: ({ isOpen }) =>
    isOpen ? React.createElement("div", null, "Modal abierto") : null,
}));

const mockData = [
  {
    id: 1,
    codigoCofre: "CF-03",
    referenciaNombre: "Imperial",
    duracion: "3h",
    fechaInicio: "2026-02-16",
    fechaFin: "2026-02-19",
    trabajadoNombreCompleto: "Laura Gómez",
    cargoNombre: "Pulidor",
    valor: 45000,
    fotosEvidencia: ["img1.jpg"],
  },
];

beforeEach(() => {
  vi.clearAllMocks();
});

describe("REGRESION - Historial", () => {
  test("CP1 debe mostrar loading", () => {
    // ARRANGE
    useObtenerHistorialSubprocesosPendientes.mockReturnValue({
      historialSubprocesosPendientes: [],
      loading: true,
      error: null,
    });

    // ACT
    render(<Historial />);

    // ASSERT
    expect(screen.getByText(/Cargando historial/i)).toBeInTheDocument();
  });

  test("CP2 debe mostrar error del hook", () => {
    // ARRANGE
    useObtenerHistorialSubprocesosPendientes.mockReturnValue({
      historialSubprocesosPendientes: [],
      loading: false,
      error: { message: "Error API" },
    });

    // ACT
    render(<Historial />);

    // ASSERT
    expect(screen.getByText(/Error al cargar/i)).toBeInTheDocument();
  });

  test("CP3 debe mostrar tabla con datos", () => {
    // ARRANGE
    useObtenerHistorialSubprocesosPendientes.mockReturnValue({
      historialSubprocesosPendientes: mockData,
      loading: false,
      error: null,
    });

    // ACT
    render(<Historial />);

    // ASSERT
    expect(screen.getByText("CF-03")).toBeInTheDocument();
    expect(screen.getByText("Imperial")).toBeInTheDocument();
    expect(screen.getByText("Laura Gómez")).toBeInTheDocument();
  });

  test("CP4 debe mostrar Sin fotos cuando no hay evidencia", () => {
    // ARRANGE
    useObtenerHistorialSubprocesosPendientes.mockReturnValue({
      historialSubprocesosPendientes: [{ ...mockData[0], fotosEvidencia: [] }],
      loading: false,
      error: null,
    });

    // ACT
    render(<Historial />);

    // ASSERT
    expect(screen.getByText(/Sin fotos/i)).toBeInTheDocument();
  });

  test("CP5 debe abrir modal al hacer click en evidencia", () => {
    // ARRANGE
    useObtenerHistorialSubprocesosPendientes.mockReturnValue({
      historialSubprocesosPendientes: mockData,
      loading: false,
      error: null,
    });

    render(<Historial />);

    // ACT
    fireEvent.click(screen.getByRole("button"));

    // ASSERT
    expect(screen.getByText(/Modal abierto/i)).toBeInTheDocument();
  });
});
