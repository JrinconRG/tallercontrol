import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, vi } from "vitest";
import React from "react";
vi.mock("../../../components/mostrarImagenModal/MostrarImagenModal", () => ({
  default: ({ isOpen, fase }) =>
    isOpen ? React.createElement("div", null, `Modal abierto ${fase}`) : null,
}));

import Historial from "../../../pages/Trabajador/Historial/Historial";
import * as useHistorialSubprocesosHook from "../../../hooks/useSubprocesos";
//generamos los mocks
vi.mock("../../../hooks/useSubprocesos", () => ({
  useHistorialSubprocesosTrabajadorNoPagado: vi.fn(),
}));

//helper (datos de prueba)
const dataMock = (overrides = {}) => ({
  cargo_nombre: "Pulidor",
  duracion_reloj: "03d 14h 58m",
  pro_codigo_cofre: "CF-03",
  referencia_codigo: "104",
  referencia_nombre: "Imperial",
  sub_duracion_min: 5218,
  sub_estado: "finalizado",
  sub_fecha_fin: "2026-02-19T20:05:18.196963",
  sub_fecha_inicio: "2026-02-16T05:06:59.666338",
  sub_fotos_evidencia: ["cofre_Imperial/proceso_unidad-03/subproceso.jpg"],
  sub_id_subproceso: 12,
  sub_pagado: false,
  sub_proceso_id: 3,
  t_numero_de_documento: "1001",
  trabajador_id: 17,
  trabajador_nombre: "Laura Gómez",
  valor_pagar: 45000,
  ...overrides,
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Test caja blanca - Historial Componente", () => {
  //CP2.1 estado loading
  test("CP-2.2 Debe mostrar loading mientras carga", () => {
    //arrange
    useHistorialSubprocesosHook.useHistorialSubprocesosTrabajadorNoPagado.mockReturnValue(
      {
        historialSubProcesos: [],
        loading: true,
        error: null,
      },
    );

    // act

    render(<Historial />);

    //assert
    expect(screen.getByText(/Cargando historial/i)).toBeInTheDocument();

    //
  });

  //C-2.2 Caso de error
  test("CP-2.2 Debe mostrar error si falla el hook", () => {
    //arrange
    useHistorialSubprocesosHook.useHistorialSubprocesosTrabajadorNoPagado.mockReturnValue(
      {
        historialSubProcesos: [],
        loading: false,
        error: "Error",
      },
    );

    //act
    render(<Historial />);

    //assert
    expect(screen.getByText(/Error al cargar historial/i)).toBeInTheDocument();
  });

  //CP-2.3
  test("CP-2.3 Un render correcto de datos", () => {
    //arrange
    const dataHistorialMock = [dataMock()];

    useHistorialSubprocesosHook.useHistorialSubprocesosTrabajadorNoPagado.mockReturnValue(
      {
        historialSubProcesos: dataHistorialMock,
        loading: false,
        error: null,
      },
    );

    //act
    render(<Historial />);

    //assert
    expect(screen.getByText(/CF-03/i)).toBeInTheDocument();
    expect(screen.getByText(/Imperial/i)).toBeInTheDocument();
    expect(screen.getByText(/Laura Gómez/i)).toBeInTheDocument();
  });

  //CP-3.4 Rama de cuando no hay fotots
  test("CP-2.4 Debe mostrar 'Sin fotos ' cuando no hay evidencia", () => {
    //arrange
    const dataMockHistorial = [
      dataMock({
        sub_fotos_evidencia: [],
      }),
    ];

    useHistorialSubprocesosHook.useHistorialSubprocesosTrabajadorNoPagado.mockReturnValue(
      {
        historialSubProcesos: dataMockHistorial,
        loading: false,
        error: null,
      },
    );

    //arrange
    render(<Historial />);

    //ASSERT
    expect(screen.getByText(/Sin fotos/i)).toBeInTheDocument();
  });

  //CP-2.5 Click en evidencia abre el modal
  test("CP-2.5 Debe abrir el modal al hacer click en evidencia", async () => {
    //arrange
    const dataHistorialMock = [dataMock()];

    useHistorialSubprocesosHook.useHistorialSubprocesosTrabajadorNoPagado.mockReturnValue(
      {
        historialSubProcesos: dataHistorialMock,
        loading: false,
        error: null,
      },
    );

    //act
    render(<Historial />);
    const boton = screen.getAllByRole("button")[0];
    fireEvent.click(boton);

    await waitFor(() => {
      expect(screen.getByText(/Modal abierto/i)).toBeInTheDocument();
    });
  });
});
