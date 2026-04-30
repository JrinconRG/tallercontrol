import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act, renderHook } from "@testing-library/react";

vi.mock("../../lib/supabase", () => ({
  supabase: {
    rpc: vi.fn(),
    auth: {
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
    },
    from: vi.fn(() => ({
      update: vi.fn(() => ({
        eq: vi.fn(() => ({ error: null })),
      })),
    })),
  },
}));

import { supabase } from "../../lib/supabase";
import { useAuthStore } from "../../stores/authStore";

// Helper
function resetStore() {
  useAuthStore.setState({
    user: null,
    role: null,
    empresaId: null,
    empresaNombre: null,
    isAuthenticated: false,
    isLoading: false,
  });
}

const VALID_USER_ROW = {
  u_id: "user-001",
  u_nombre: "Ana Torres",
  u_usuario: "ana",
  u_rol: "gerente",
  u_empresa_id: "emp-99",
  empresa_nombre: "Taller Norte",
  u_auth_user_id: null,
};

const AUTH_SESSION = {
  user: { id: "auth-uuid-abc" },
};

describe("authStore  login", () => {
  beforeEach(() => {
    resetStore();
    vi.clearAllMocks();
  });

  it("[SEC-01] credenciales invalida  no autentica y retorna error", async () => {
    // Arrange
    supabase.rpc.mockResolvedValue({ data: [], error: null });

    // Act
    const { result } = renderHook(() => useAuthStore());
    let response;
    await act(async () => {
      response = await result.current.login("hacker", "wrong");
    });

    // Assert
    expect(response.success).toBe(false);
    expect(response.error).toBe("Usuario o contraseña incorrectos");
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it("[SEC-02] error de RPC  no autentica ", async () => {
    // Arrange
    supabase.rpc.mockResolvedValue({
      data: null,
      error: { message: "connection refused" },
    });

    // Act
    const { result } = renderHook(() => useAuthStore());
    let response;
    await act(async () => {
      response = await result.current.login("ana", "1234");
    });

    // Assert
    expect(response.success).toBe(false);
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("[SEC-03] error de supabase Auth  no persiste sesión parcial", async () => {
    // Arrange — RPC ok pero Auth falla
    supabase.rpc.mockResolvedValue({ data: [VALID_USER_ROW], error: null });
    supabase.auth.signInWithPassword.mockResolvedValue({
      data: null,
      error: { message: "invalid credentials" },
    });

    // Act
    const { result } = renderHook(() => useAuthStore());
    await act(async () => {
      await result.current.login("ana", "1234");
    });

    // Assert — store debe quedar limpio, nunca en estado parcial
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.role).toBeNull();
  });

  it("[SEC-04] login exitoso role se asigna desde el servidor, no del cliente", async () => {
    // Arrange
    supabase.rpc.mockResolvedValue({ data: [VALID_USER_ROW], error: null });
    supabase.auth.signInWithPassword.mockResolvedValue({
      data: AUTH_SESSION,
      error: null,
    });

    // Act
    const { result } = renderHook(() => useAuthStore());
    let response;
    await act(async () => {
      response = await result.current.login("ana", "1234");
    });

    // Assert —
    expect(response.role).toBe("gerente");
    expect(result.current.role).toBe("gerente");
    expect(result.current.isAuthenticated).toBe(true);
  });

  it("[SEC-05] login exitoso → password nunca se almacena en el store", async () => {
    // Arrange
    supabase.rpc.mockResolvedValue({ data: [VALID_USER_ROW], error: null });
    supabase.auth.signInWithPassword.mockResolvedValue({
      data: AUTH_SESSION,
      error: null,
    });

    // Act
    const { result } = renderHook(() => useAuthStore());
    await act(async () => {
      await result.current.login("ana", "secreto123");
    });

    // Assert — ningún campo del store contiene la contraseña
    const state = result.current;
    const stateStr = JSON.stringify(state);
    expect(stateStr).not.toContain("secreto123");
  });

  // ── RENDIMIENTO ──────────────────────────────────────────────────────────

  it("[PERF-01] login completo resuelve en menos de 200ms (mock network)", async () => {
    // Arrange — simular latencia realista de red (~50ms)
    supabase.rpc.mockImplementation(
      () =>
        new Promise((r) =>
          setTimeout(() => r({ data: [VALID_USER_ROW], error: null }), 50),
        ),
    );
    supabase.auth.signInWithPassword.mockImplementation(
      () =>
        new Promise((r) =>
          setTimeout(() => r({ data: AUTH_SESSION, error: null }), 30),
        ),
    );

    // Act
    const { result } = renderHook(() => useAuthStore());
    const start = performance.now();
    await act(async () => {
      await result.current.login("ana", "1234");
    });
    const elapsed = performance.now() - start;

    // Assert
    expect(elapsed).toBeLessThan(200);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it("[PERF-02] isLoading activa durante login y desactiva al terminar", async () => {
    // Arrange
    let resolveRpc;
    supabase.rpc.mockReturnValue(
      new Promise((r) => {
        resolveRpc = r;
      }),
    );

    const { result } = renderHook(() => useAuthStore());

    // Act — iniciar login sin await
    act(() => {
      result.current.login("ana", "1234");
    });

    // Assert — debe estar en loading
    expect(result.current.isLoading).toBe(true);

    // Act — resolver la promesa
    await act(async () => {
      resolveRpc({ data: [], error: null });
    });

    // Assert — loading debe terminar aunque el login falle
    expect(result.current.isLoading).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
describe("authStore › logout", () => {
  beforeEach(() => {
    resetStore();
    vi.clearAllMocks();
  });

  it("[SEC-06] logout → limpia todo el estado sensible", async () => {
    // Arrange — simular sesión activa
    useAuthStore.setState({
      user: {
        id: "user-001",
        nombre: "Ana",
        usuario: "ana",
        authUserId: "uuid",
      },
      role: "gerente",
      empresaId: "emp-99",
      empresaNombre: "Taller Norte",
      isAuthenticated: true,
    });
    supabase.auth.signOut.mockResolvedValue({});

    // Act
    const { result } = renderHook(() => useAuthStore());
    await act(async () => {
      await result.current.logout();
    });

    // Assert
    expect(result.current.user).toBeNull();
    expect(result.current.role).toBeNull();
    expect(result.current.empresaId).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(supabase.auth.signOut).toHaveBeenCalledOnce();
  });

  it("[SEC-07] logout llama signOut de supabase (invalida token remoto)", async () => {
    // Arrange
    supabase.auth.signOut.mockResolvedValue({});
    useAuthStore.setState({ isAuthenticated: true });

    // Act
    const { result } = renderHook(() => useAuthStore());
    await act(async () => {
      await result.current.logout();
    });

    // Assert  si no se llama, el token JWT sigue válido en el servidor
    expect(supabase.auth.signOut).toHaveBeenCalledOnce();
  });
});
