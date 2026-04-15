import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import { beforeEach, describe, expect, vi } from "vitest";
import InicioTrabajador from "../../pages/Trabajador/InicioTrabajador/InicioTrabajador";
import * as useProcesosHook from "../../hooks/useProcesos";
import * as useSubprocesosHook from "../../hooks/useSubprocesos";

//generamos los mocks
vi.mock("../../hooks/useProcesos", () => ({
  useProcesosActivos: vi.fn(),
  useFaseActualProcesos: vi.fn(),
}));

vi.mock("../../hooks/useSubprocesos", () => ({
  useSubprocesoActual: vi.fn(),
}));

//mockeamos los 3 modales porq ya los testeamos por separado (no testeamos su logica solo si aparecen o desaparecen)
vi.mock(
  "../../pages/Trabajador/InicioTrabajador/funciones/CrearProceso",
  () => ({
    default: ({ onClose, onSuccess }) => (
      <div data-testid="modal-crear-proceso">
        <button onClick={onClose}> Cancelar</button>
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
        <button onClick={onClose}> Cancelar</button>
        <button
          onClick={() =>
            onSuccess({
              tipo: "creado",
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

vi.mock(
  "../../pages/Trabajador/InicioTrabajador/funciones/FinalizarSubproceso",
  () => ({
    default: ({ onClose, onSuccess }) => (
      <div data-testid="modal-finalizar">
        <button onClick={onClose}>Cancelar</button>
        <button
          onClick={() =>
            onSuccess({
              tipo: "fase",
              codigo: "CF-99",
              nombre: "Imperial",
              fase: "Tapizador",
            })
          }
        >
          Finalizar
        </button>
      </div>
    ),
  }),
);

// helpersss
// Proceso base reutilizable
const crearProcesoMock = (id = "P-001") => ({
  pro_id_proceso: id,
  pro_codigo_cofre: "CF-99",
  rc_nombre: "Imperial",
  rc_codigo: "104",
  pro_estado: "activo",
});

// Fase base reutilizable
const crearFaseMock = (procesoId = "P-001") => ({
  pro_id_proceso: procesoId,
  fases_completadas: 0,
  total_fases: 5,
  siguiente_cargo_id: "12",
  siguiente_fase_orden: "1",
  siguiente_cargo_nombre: "Tapizador",
  pro_fecha_inicio: "2026-01-01",
});

const crearSubprocesoMock = (subProceso_id = "54") => ({
  sub_proceso_id: subProceso_id,
  c_nombre: "Imperial",
  sub_fecha_inicio: "01/04/2026",
  t_nombre: "Juan Garcia",
});

beforeEach(() => {
  vi.clearAllMocks();

  useProcesosHook.useProcesosActivos.mockReturnValue({
    procesos: [crearProcesoMock()],
    loading: false,
    refetch: vi.fn().mockResolvedValue(undefined),
  });

  useProcesosHook.useFaseActualProcesos.mockReturnValue({
    fases: [crearFaseMock()],
    loading: false,
    refetch: vi.fn().mockResolvedValue(undefined),
  });

  useSubprocesosHook.useSubprocesoActual.mockReturnValue({
    data: [], //
    loading: false,
    refetch: vi.fn().mockResolvedValue(undefined),
  });
});

describe("Test caja blanca - InicioTrabajador", () => {
  test("CP-1.1: Debe mostrar Cargando mientras cargan los datos", () => {
    // ARRANGE
    // Sobreescribimos el beforeEach pcon loading true
    useProcesosHook.useProcesosActivos.mockReturnValue({
      procesos: [],
      loading: true, // ← esto activa el if(loading)
      refetch: vi.fn(),
    });

    render(<InicioTrabajador />);

    // ACT — no hay, el estado se ve al renderizar

    // ASSERT
    expect(screen.getByText(/Cargando procesos/i)).toBeInTheDocument();
    // Verificamos que las secciones NO aparecen
    //esto no debe aparecer
    expect(screen.queryByText(/Por iniciar/i)).not.toBeInTheDocument();
  });
  test("CP-1.2: Debe mostrar el proceso en Por iniciar cuando no tiene subproceso activo", () => {
    // ARRANGE
    // El beforeEach ya tiene data: [] (sin subprocesos activos)
    // Entonces el proceso cae en "Por iniciar" automáticamente
    render(<InicioTrabajador />);

    // ASSERT
    expect(screen.getByText(/Por iniciar/i)).toBeInTheDocument();
    expect(screen.getByText(/CF-99/i)).toBeInTheDocument();
  });

  test("CP-1.2b: Debe mostrar el proceso En curso cuando tiene subproceso activo", () => {
    // ARRANGE
    // Sobreescribimos data con un subproceso activo que coincide con el proceso
    useSubprocesosHook.useSubprocesoActual.mockReturnValue({
      data: [crearSubprocesoMock("P-001")], // ← mismo id que crearProcesoMock
      loading: false,
      refetch: vi.fn().mockResolvedValue(undefined),
    });

    render(<InicioTrabajador />);

    // ASSERT
    const seccionEnCurso = screen.getByRole("heading", { name: /^En curso$/i });
    expect(seccionEnCurso).toBeInTheDocument();
  });
  test("CP-1.3: Debe abrir el modal CrearProceso al hacer clic en Crear Proceso", async () => {
    // ARRANGE
    render(<InicioTrabajador />);

    // Verificamos que el modal NO está al inicio
    expect(screen.queryByTestId("modal-crear-proceso")).not.toBeInTheDocument();

    // ACT
    fireEvent.click(screen.getByRole("button", { name: /Crear Proceso/i }));

    // ASSERT
    await waitFor(() => {
      expect(screen.getByTestId("modal-crear-proceso")).toBeInTheDocument();
    });
  });
  test("CP-1.4: Debe mostrar mensaje de confirmacion al crear un proceso", async () => {
    // ARRANGE
    render(<InicioTrabajador />);

    // ACT — paso 1: abrimos el modal
    fireEvent.click(screen.getByRole("button", { name: /Crear Proceso/i }));

    // Esperamos que el modal aparezca
    await waitFor(() => {
      expect(screen.getByTestId("modal-crear-proceso")).toBeInTheDocument();
    });

    // ACT
    const modalCrearProceso = screen.getByTestId("modal-crear-proceso");
    const botonConfirmar = within(modalCrearProceso).getByRole("button", {
      name: /Crear Proceso/i,
    });
    fireEvent.click(botonConfirmar);

    // ASSERT
    await waitFor(() => {
      expect(screen.getByText(/fue creado correctamente/i)).toBeInTheDocument();
    });
  });
  test("CP-1.5: Debe cerrar el modal CrearProceso al hacer clic en Cancelar", async () => {
    // ARRANGE
    render(<InicioTrabajador />);

    // Abrimos el modal primero
    fireEvent.click(screen.getByRole("button", { name: /Crear Proceso/i }));

    await waitFor(() => {
      expect(screen.getByTestId("modal-crear-proceso")).toBeInTheDocument();
    });

    // ACT — cerramos el modal con el botón Cancelar del mock
    fireEvent.click(screen.getByRole("button", { name: /Cancelar/i }));

    // ASSERT — el modal desaparece del DOM
    await waitFor(() => {
      expect(
        screen.queryByTestId("modal-crear-proceso"),
      ).not.toBeInTheDocument();
    });
  });
});
