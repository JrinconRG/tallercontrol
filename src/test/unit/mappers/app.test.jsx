import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "../../../App";
import { vi } from "vitest";

// mock auth store
vi.mock("../../../stores/authStore", () => ({
  useAuthStore: () => ({
    isAuthenticated: true,
    role: "gerente",
  }),
}));

// mock pages pesadas (IMPORTANTE)
vi.mock("../../../pages/auth/LoginPage/LoginPage", () => ({
  default: () => <div>Login</div>,
}));

vi.mock("../../../pages/Trabajador/InicioTrabajador/InicioTrabajador", () => ({
  default: () => <div>InicioTrabajador</div>,
}));

vi.mock("../../../pages/Trabajador/Historial/Historial", () => ({
  default: () => <div>Historial</div>,
}));

vi.mock("../../../pages/Gerente/Dashboard/Dashboard", () => ({
  default: () => <div>Dashboard</div>,
}));

vi.mock("../../../pages/NoAutorizado", () => ({
  default: () => <div>NoAutorizado</div>,
}));

vi.mock("../../../pages/Gerente/Tarifas/Tarifas", () => ({
  default: () => <div>Tarifas</div>,
}));

vi.mock("../../../pages/Gerente/Empleados/Empleados", () => ({
  default: () => <div>Empleados</div>,
}));

vi.mock("../../../pages/Gerente/Nomina/GenerarNomina", () => ({
  default: () => <div>Nomina</div>,
}));

vi.mock("../../../pages/Gerente/HistorialGerente/HistorialGerente", () => ({
  default: () => <div>HistorialGerente</div>,
}));

describe("App.jsx coverage boost", () => {
  test("renderiza rutas sin romper", () => {
    render(
      <MemoryRouter initialEntries={["/gerente"]}>
        <App />
      </MemoryRouter>,
    );
  });
});
