import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProcesoDetail from "./ProcesoDetail";

const propsBase = {
  proceso: {
    id: 1,
    codigoCofre: "C-01",
    referenciaNombre: "Referencia",
    referenciaCodigoNombre: "REF-01",
  },
  colorTitulo: "enProceso",
  fase: { siguienteCargoNombre: "Pintura" },
  calcularDuracion: vi.fn(() => "12 min"),
  onIniciarFase: vi.fn(),
  onFinalizarFase: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("ProcesoDetail", () => {
  it("muestra la duración de un subproceso con fecha válida", () => {
    render(
      <ProcesoDetail
        {...propsBase}
        subprocesoActual={{
          fechaInicio: "2026-11-08T05:04:56Z",
          cargoNombre: "Pintura",
          trabajadorNombreCompleto: "Ana Pérez",
        }}
      />,
    );

    expect(screen.getByText("12 min")).toBeInTheDocument();
    expect(propsBase.calcularDuracion).toHaveBeenCalledWith(
      "2026-11-08T05:04:56Z",
    );
  });

  it("muestra el texto correspondiente cuando no hay subproceso", () => {
    render(<ProcesoDetail {...propsBase} subprocesoActual={null} />);

    expect(screen.getByText("Aún sin iniciar")).toBeInTheDocument();
  });

  it("muestra el respaldo sin lanzar un error para una fecha inválida", () => {
    render(
      <ProcesoDetail
        {...propsBase}
        subprocesoActual={{ fechaInicio: "fecha-basura", cargoNombre: "Pintura" }}
      />,
    );

    expect(screen.getByText("Sin hora de inicio")).toBeInTheDocument();
    expect(propsBase.calcularDuracion).not.toHaveBeenCalled();
  });
});
