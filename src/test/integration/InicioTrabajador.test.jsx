import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import { beforeEach, describe, expect, vi } from "vitest";
import InicioTrabajador from "../../pages/Trabajador/InicioTrabajador/InicioTrabajador";

import * as useProcesosHook from "../../features/procesos/application/hooks/useProcesosActivos";
import * as useFaseHook from "../../features/procesos/application/hooks/useObtenerFaseActualProcesos";
import * as useSubprocesosHook from "../../features/subProcesos/application/hooks/useObtenerInformacionSubprocesoActual";

vi.mock("../../features/procesos/application/hooks/useProcesosActivos", () => ({
  useProcesosActivos: vi.fn(),
}));

vi.mock(
  "../../features/procesos/application/hooks/useObtenerFaseActualProcesos",
  () => ({
    useObtenerFaseActualProcesos: vi.fn(),
  }),
);

vi.mock(
  "../../features/subProcesos/application/hooks/useObtenerInformacionSubprocesoActual",
  () => ({
    useObtenerInfoSubprocesoActual: vi.fn(),
  }),
);

vi.mock(
  "../../pages/Trabajador/InicioTrabajador/funciones/CrearProceso",
  () => ({
    default: ({ onClose, onSuccess }) => (
      <div data-testid="modal-crear-proceso">
        <button onClick={onClose}>Cancelar</button>
        <button
          onClick={() =>
            onSuccess({ tipo: "creado", codigo: "CF-99", nombre: "Imperial" })
          }
        >
          Crear Proceso
        </button>
      </div>
    ),
  }),
);

vi.mock(
  "../../pages/Trabajador/InicioTrabajador/funciones/CrearSubproceso",
  () => ({
    default: ({ onClose, onSuccess }) => (
      <div data-testid="modal-crear-subproceso">
        <button onClick={onClose}>Cancelar</button>
        <button
          onClick={() =>
            onSuccess({
              tipo: "nuevaFase",
              codigo: "CF-99",
              nombre: "Imperial",
              fase: "Tapizador",
              nombreTrabajador: "Juan Garcia",
            })
          }
        >
          Iniciar fase
        </button>
      </div>
    ),
  }),
);

// ─────────────────────────────
// HELPERS

const procesoMock = {
  id: "P-001",
  referenciaNombre: "Imperial",
  codigoCofre: "CF-99",
};

const faseMock = {
  id: "P-001",
  fasesCompletadas: 0,
  totalFases: 5,
  siguienteCargoNombre: "Tapizador",
};

const subprocesoMock = {
  idProceso: "P-001",
};

beforeEach(() => {
  vi.clearAllMocks();

  useProcesosHook.useProcesosActivos.mockReturnValue({
    procesos: [procesoMock],
    loading: false,
    refetch: vi.fn(),
  });

  useFaseHook.useObtenerFaseActualProcesos.mockReturnValue({
    faseActualProcesos: [faseMock],
    loading: false,
    refetch: vi.fn(),
  });

  useSubprocesosHook.useObtenerInfoSubprocesoActual.mockReturnValue({
    informacionSubProcesoActual: [],
    loading: false,
    refetch: vi.fn(),
  });
});

describe("REGRESION - InicioTrabajador", () => {
  // CP1 - loading global
  test("CP1: debe mostrar loading", () => {
    useProcesosHook.useProcesosActivos.mockReturnValue({
      procesos: [],
      loading: true,
      refetch: vi.fn(),
    });

    render(<InicioTrabajador />);

    expect(screen.getByText(/Cargando procesos/i)).toBeInTheDocument();
  });

  // CP2 - por iniciar
  test("CP2: debe mostrar procesos por iniciar", () => {
    render(<InicioTrabajador />);

    expect(screen.getByText(/Por iniciar/i)).toBeInTheDocument();
    expect(screen.getByText(/CF-99/i)).toBeInTheDocument();
  });

  // CP3 - en curso
  test("CP3: debe mostrar proceso en curso si tiene subproceso", () => {
    useSubprocesosHook.useObtenerInfoSubprocesoActual.mockReturnValue({
      informacionSubProcesoActual: [subprocesoMock],
      loading: false,
      refetch: vi.fn(),
    });

    render(<InicioTrabajador />);

    const titulos = screen.getAllByRole("heading", { level: 3 });
    expect(titulos.some((h) => h.textContent.includes("En curso"))).toBe(true);
  });

  // CP4 - abrir modal crear proceso
  test("CP4: debe abrir modal CrearProceso", async () => {
    render(<InicioTrabajador />);

    fireEvent.click(screen.getByRole("button", { name: /Crear Proceso/i }));

    await waitFor(() => {
      expect(screen.getByTestId("modal-crear-proceso")).toBeInTheDocument();
    });
  });

  // CP6 - cerrar modal
  test("CP6: debe cerrar modal CrearProceso", async () => {
    render(<InicioTrabajador />);

    fireEvent.click(screen.getByRole("button", { name: /Crear Proceso/i }));

    await waitFor(() => screen.getByTestId("modal-crear-proceso"));

    fireEvent.click(screen.getByRole("button", { name: /Cancelar/i }));

    await waitFor(() => {
      expect(
        screen.queryByTestId("modal-crear-proceso"),
      ).not.toBeInTheDocument();
    });
  });
});
