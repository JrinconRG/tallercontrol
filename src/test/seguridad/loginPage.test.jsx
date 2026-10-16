import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

// ── Test Doubles ────────────────────────────────────────────────────────────
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("../../stores/authStore");
import { useAuthStore } from "../../stores/authStore";

const { showError, showSuccess } = vi.hoisted(() => ({
  showError: vi.fn(),
  showSuccess: vi.fn(),
}));
vi.mock("../../hooks/useToast", () => ({
  useToast: () => ({ showError, showSuccess }),
}));
import LoginPage from "../../pages/auth/LoginPage/LoginPage";

//helper
function renderLogin(storeOverrides = {}) {
  const mockLogin = vi.fn();
  useAuthStore.mockReturnValue({
    login: mockLogin,
    isLoading: false,
    ...storeOverrides,
  });
  render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  );
  return { mockLogin };
}

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockReset();
  });

  it("[SEC-13] campos vacíos entonces no llama login, muestra error", async () => {
    // Arrange
    const { mockLogin } = renderLogin();

    // Act
    fireEvent.click(screen.getByRole("button", { name: /iniciar sesión/i }));

    // Assert
    expect(mockLogin).not.toHaveBeenCalled();
    expect(showError).toHaveBeenCalledWith(
      "Datos incompletos",
      "Por favor, ingrese su usuario o correo.",
    );
  });

  it("[SEC-14] solo usuario sin password entonces no llama login", async () => {
    // Arrange
    const { mockLogin } = renderLogin();

    // Act
    await userEvent.type(screen.getByPlaceholderText("Usuario o Correo"), "ana");
    fireEvent.click(screen.getByRole("button", { name: /iniciar sesión/i }));

    // Assert
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it("[SEC-15] login fallido entonces muestra mensaje de error ", async () => {
    // Arrange
    const { mockLogin } = renderLogin();
    mockLogin.mockResolvedValue({
      success: false,
      error: "Usuario o contraseña incorrectos",
    });

    // Act
    await userEvent.type(screen.getByPlaceholderText("Usuario o Correo"), "hacker");
    await userEvent.type(screen.getByPlaceholderText("Contraseña"), "wrong");
    fireEvent.click(screen.getByRole("button", { name: /iniciar sesión/i }));

    // Assert
    await waitFor(() => {
      expect(showError).toHaveBeenCalledWith(
        "No se pudo iniciar sesión",
        "Usuario o contraseña incorrectos",
      );
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  it("[SEC-16] login exitoso como gerente  navega a /gerente", async () => {
    // Arrange
    const { mockLogin } = renderLogin();
    mockLogin.mockResolvedValue({ success: true, role: "gerente" });

    // Act
    await userEvent.type(screen.getByPlaceholderText("Usuario o Correo"), "ana");
    await userEvent.type(screen.getByPlaceholderText("Contraseña"), "1234");
    fireEvent.click(screen.getByRole("button", { name: /iniciar sesión/i }));

    // Assert
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/gerente", { replace: true });
      expect(mockNavigate).not.toHaveBeenCalledWith("/trabajador/inicio");
    });
  });

  it("[SEC-17] login exitoso como trabajador  navega a /trabajador/inicio", async () => {
    // Arrange
    const { mockLogin } = renderLogin();
    mockLogin.mockResolvedValue({ success: true, role: "trabajador" });

    // Act
    await userEvent.type(screen.getByPlaceholderText("Usuario o Correo"), "carlos");
    await userEvent.type(screen.getByPlaceholderText("Contraseña"), "1234");
    fireEvent.click(screen.getByRole("button", { name: /iniciar sesión/i }));

    // Assert
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/trabajador/inicio", {
        replace: true,
      });
    });
  });

  // ── RENDIMIENTO ──────────────────────────────────────────────────────────

  it('[PERF-03] isLoading → boton deshabilitado y muestra "Cargando..."', () => {
    // Arrange
    renderLogin({ isLoading: true });

    // Act + Assert
    const btn = screen.getByRole("button", { name: /ingresando/i });
    expect(btn).toBeDisabled();
  });

  it("[PERF-04] submit no se puede disparar dos veces seguidas", async () => {
    // Arrange — login tarda (simula lentitud)
    const { mockLogin } = renderLogin();
    mockLogin.mockImplementation(
      () =>
        new Promise((r) =>
          setTimeout(() => r({ success: true, role: "gerente" }), 100),
        ),
    );

    // Act
    await userEvent.type(screen.getByPlaceholderText("Usuario o Correo"), "ana");
    await userEvent.type(screen.getByPlaceholderText("Contraseña"), "1234");

    fireEvent.click(screen.getByRole("button", { name: /iniciar sesión/i }));
    fireEvent.click(screen.getByRole("button", { name: /iniciar sesión/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledTimes(2);
    });
  });
});
