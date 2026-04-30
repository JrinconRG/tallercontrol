import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import Empleados from "../../../pages/Gerente/Empleados/Empleados";
import * as useEmpleadosHook from "../../../features/Trabajadores/application/hooks/useInformacionEmpleados";

vi.mock(
  "../../../features/Trabajadores/application/hooks/useInformacionEmpleados",
  () => ({
    useInformacionEmpleados: vi.fn(),
  }),
);

vi.mock(
  "../../../pages/Gerente/Empleados/funciones/RegistrarEmpleados",
  () => ({
    default: ({ onClose, onToast }) => (
      <div data-testid="modal-registrar">
        <button onClick={onClose}>Cancelar</button>
        <button
          onClick={() => {
            onToast?.({ message: "Empleado creado" });
            onClose();
          }}
        >
          Registrar
        </button>
      </div>
    ),
  }),
);

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  const Wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return { Wrapper };
};

const empleadoMock = {
  id: 1,
  nombre: "Juan García",
  documento: "123456",
  celular: "300123",
  cargos: [{ id: 10, nombre: "Tapizador" }],
};

beforeEach(() => {
  vi.clearAllMocks();

  useEmpleadosHook.useInformacionEmpleados.mockReturnValue({
    empleados: [empleadoMock],
    loading: false,
    error: null,
  });
});

describe("REGRESION - Empleados", () => {
  // CP1 - loading
  test("CP1: debe mostrar loading", () => {
    // ARRANGE
    useEmpleadosHook.useInformacionEmpleados.mockReturnValue({
      empleados: [],
      loading: true,
      error: null,
    });

    const { Wrapper } = createWrapper();

    // ACT
    render(
      <Wrapper>
        <Empleados />
      </Wrapper>,
    );

    // ASSERT
    expect(screen.getByText(/Cargando empleados/i)).toBeInTheDocument();
  });

  // CP2 - render tabla
  test("CP2: debe renderizar empleados correctamente", () => {
    // ARRANGE
    const { Wrapper } = createWrapper();

    // ACT
    render(
      <Wrapper>
        <Empleados />
      </Wrapper>,
    );

    // ASSERT
    expect(screen.getByText("Juan García")).toBeInTheDocument();
    expect(screen.getByText("123456")).toBeInTheDocument();
    expect(screen.getByText("300123")).toBeInTheDocument();
  });

  // CP3 - abrir modal
  test("CP3: debe abrir modal de registrar empleado", async () => {
    // ARRANGE
    const { Wrapper } = createWrapper();

    render(
      <Wrapper>
        <Empleados />
      </Wrapper>,
    );

    expect(screen.queryByTestId("modal-registrar")).not.toBeInTheDocument();

    // ACT
    fireEvent.click(screen.getByText("+ Registrar empleado"));

    // ASSERT (fluent)
    await waitFor(() => {
      expect(screen.getByTestId("modal-registrar")).toBeInTheDocument();
    });
  });

  // CP4 - cerrar modal
  test("CP4: debe cerrar modal al cancelar", async () => {
    // ARRANGE
    const { Wrapper } = createWrapper();

    render(
      <Wrapper>
        <Empleados />
      </Wrapper>,
    );

    fireEvent.click(screen.getByText("+ Registrar empleado"));

    await waitFor(() =>
      expect(screen.getByTestId("modal-registrar")).toBeInTheDocument(),
    );

    // ACT
    fireEvent.click(screen.getByText("Cancelar"));

    // ASSERT
    await waitFor(() => {
      expect(screen.queryByTestId("modal-registrar")).not.toBeInTheDocument();
    });
  });

  // CP5 - registrar empleado exitoso
  test("CP5: debe cerrar modal y mostrar éxito al registrar", async () => {
    // ARRANGE
    const { Wrapper } = createWrapper();

    render(
      <Wrapper>
        <Empleados />
      </Wrapper>,
    );

    fireEvent.click(screen.getByText("+ Registrar empleado"));

    await waitFor(() => screen.getByTestId("modal-registrar"));

    // ACT
    fireEvent.click(screen.getByText("Registrar"));

    // ASSERT (fluent)
    await waitFor(() => {
      expect(screen.queryByTestId("modal-registrar")).not.toBeInTheDocument();
    });
  });

  test("CP6: debe abrir drawer al hacer click en empleado", async () => {
    // ARRANGE
    const { Wrapper } = createWrapper();

    render(
      <Wrapper>
        <Empleados />
      </Wrapper>,
    );

    // ACT
    const row = screen.getByText("Juan García");
    fireEvent.click(row.closest("tr"));

    // ASSERT
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: /FASES ASIGNADAS/i }),
      ).toBeInTheDocument();
    });
  });

  // CP7 - cerrar drawer
  test("CP7: debe cerrar drawer con botón X", async () => {
    // ARRANGE
    const { Wrapper } = createWrapper();

    render(
      <Wrapper>
        <Empleados />
      </Wrapper>,
    );

    fireEvent.click(screen.getByText("Juan García"));

    await waitFor(() => screen.getByRole("dialog"));

    // ACT
    fireEvent.click(screen.getByLabelText("Cerrar detalle"));

    // ASSERT
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  // CP8 - sin empleados
  test("CP8: debe mostrar tabla vacía", () => {
    // ARRANGE
    useEmpleadosHook.useInformacionEmpleados.mockReturnValue({
      empleados: [],
      loading: false,
      error: null,
    });

    const { Wrapper } = createWrapper();

    // ACT
    render(
      <Wrapper>
        <Empleados />
      </Wrapper>,
    );

    // ASSERT
    expect(screen.getByText("Empleados")).toBeInTheDocument();
    expect(screen.queryByText("Juan García")).not.toBeInTheDocument();
  });
});
