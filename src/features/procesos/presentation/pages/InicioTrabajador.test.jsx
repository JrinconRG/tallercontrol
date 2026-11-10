import { act, render, screen } from "@testing-library/react";
import { ToastProvider } from "../../../../hooks/useToast";
import InicioTrabajador from "./InicioTrabajador";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useObtenerFaseActualProcesos } from "../../../../features/procesos/application/hooks/useObtenerFaseActualProcesos";
import { useProcesosActivos } from "../../../../features/procesos/application/hooks/useProcesosActivos";
import { useObtenerInfoSubprocesoActual } from "../../../../features/subProcesos/application/hooks/useObtenerInformacionSubprocesoActual";

vi.mock("../../../../features/procesos/application/hooks/useObtenerFaseActualProcesos", () => ({
  useObtenerFaseActualProcesos: vi.fn(),
}));
vi.mock("../../../../features/procesos/application/hooks/useProcesosActivos", () => ({
  useProcesosActivos: vi.fn(),
}));
vi.mock("../../../../features/subProcesos/application/hooks/useObtenerInformacionSubprocesoActual", () => ({
  useObtenerInfoSubprocesoActual: vi.fn(),
}));

const proceso = {
  id: 1,
  codigoCofre: "C-01",
  fechaInicio: "2026-11-08T04:00:00Z",
  referenciaNombre: "Referencia",
  referenciaCodigoNombre: "REF-01",
};

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-11-08T05:04:56Z"));
  useProcesosActivos.mockReturnValue({
    procesos: [proceso],
    loading: false,
    refetch: vi.fn(),
  });
  useObtenerFaseActualProcesos.mockReturnValue({
    faseActualProcesos: [
      {
        id: proceso.id,
        fasesCompletadas: 1,
        totalFases: 2,
        siguienteFaseOrden: 2,
        siguienteCargoNombre: "Ensamble",
      },
    ],
    loading: false,
    refetch: vi.fn(),
  });
  useObtenerInfoSubprocesoActual.mockReturnValue({
    informacionSubProcesoActual: [
      {
        idProceso: proceso.id,
        fechaInicio: "2026-11-08T05:04:00Z",
        cargoNombre: "Corte",
        trabajadorNombreCompleto: "Ana Pérez",
      },
    ],
    loading: false,
    refetch: vi.fn(),
  });
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("InicioTrabajador", () => {
  it("actualiza la duración cada 60 segundos y limpia el intervalo al desmontarse", () => {
    const { unmount } = render(
      <ToastProvider>
        <InicioTrabajador />
      </ToastProvider>,
    );

    expect(screen.getByText("0 min")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(60_000);
    });

    expect(screen.getByText("1 min")).toBeInTheDocument();
    expect(vi.getTimerCount()).toBe(1);

    unmount();

    expect(vi.getTimerCount()).toBe(0);
  });
});
