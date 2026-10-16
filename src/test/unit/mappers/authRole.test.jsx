import { render } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import RequireRole from "../../../components/auth/RequireRole";
import { useAuthStore } from "../../../stores/authStore";
import { ToastProvider } from "../../../hooks/useToast";
import { vi } from "vitest";

// mock del store
vi.mock("../../../stores/authStore");

const MockPage = () => <div>Contenido protegido</div>;

const renderWithRouter = (ui, initialRoute = "/protected") => {
  return render(
    <ToastProvider>
      <MemoryRouter initialEntries={[initialRoute]}>
        <Routes>
          <Route path="/" element={<div>LOGIN</div>} />
          <Route path="/protected" element={ui} />
          <Route path="/home" element={<div>HOME</div>} />
          <Route path="/no-autorizado" element={<div>No autorizado</div>} />
        </Routes>
      </MemoryRouter>
    </ToastProvider>,
  );
};

describe("RequireRole", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test("redirige si no esta autenticado", () => {
    useAuthStore.mockReturnValue({
      isAuthenticated: false,
      role: "admin",
    });

    const { container } = renderWithRouter(
      <RequireRole allowedRoles={["admin"]}>
        <MockPage />
      </RequireRole>,
    );

    expect(container.innerHTML).not.toContain("Contenido protegido");
  });

  test("redirige si el rol no esta permitido", () => {
    useAuthStore.mockReturnValue({
      isAuthenticated: true,
      role: "trabajador",
    });

    const { container } = renderWithRouter(
      <RequireRole allowedRoles={["admin"]}>
        <MockPage />
      </RequireRole>,
    );

    expect(container.innerHTML).not.toContain("Contenido protegido");
  });

  test("renderiza children si tiene rol permitido", () => {
    useAuthStore.mockReturnValue({
      isAuthenticated: true,
      role: "admin",
    });

    const { getByText } = renderWithRouter(
      <RequireRole allowedRoles={["admin"]}>
        <MockPage />
      </RequireRole>,
    );

    expect(getByText("Contenido protegido")).toBeTruthy();
  });
});
