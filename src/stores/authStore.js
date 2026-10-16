import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { authRepository } from "../features/auth/infrastructure/authRepository";
import { getAppErrorMessage } from "../shared/errors/getAppErrorMessage";

// Duración de la sesión (8 horas)
const SESSION_DURATION_MS = 8 * 60 * 60 * 1000;

const EMPTY_SESSION = {
  user: null,
  role: null,
  empresaId: null,
  empresaNombre: null,
  isAuthenticated: false,
  lastLoginTime: null,
};

export const useAuthStore = create(
  persist(
    (set, get) => ({
      ...EMPTY_SESSION,
      isLoading: false,

      isSessionExpired: () => {
        const { lastLoginTime, isAuthenticated } = get();
        if (!isAuthenticated || !lastLoginTime) return true;
        return Date.now() - lastLoginTime > SESSION_DURATION_MS;
      },

      // Limpia estado y almacenamiento (sirve también cuando Supabase cierra la sesión)
      clearSession: () => {
        set(EMPTY_SESSION);
        useAuthStore.persist.clearStorage();
      },

      login: async (identifier, password) => {
        set({ isLoading: true });

        try {
          const { user, authUserId } = await authRepository.login(
            identifier,
            password,
          );

          set({
            user: {
              id: user.u_id,
              nombre: user.u_nombre,
              usuario: user.u_usuario,
              authUserId,
            },
            role: user.u_rol,
            empresaId: user.u_empresa_id,
            empresaNombre: user.empresa_nombre,
            isAuthenticated: true,
            isLoading: false,
            lastLoginTime: Date.now(),
          });

          return { success: true, role: user.u_rol };
        } catch (error) {
          set({ ...EMPTY_SESSION, isLoading: false });
          return { success: false, error: getAppErrorMessage(error) };
        }
      },

      logout: async () => {
        try {
          await authRepository.logout();
        } catch (err) {
          console.error("Error al cerrar sesión:", err);
        } finally {
          get().clearSession();
        }
      },
    }),
    {
      name: "tallercontrol-auth",
      storage: createJSONStorage(() => sessionStorage), // <- antes era localStorage
      partialize: (state) => ({
        user: state.user,
        role: state.role,
        empresaId: state.empresaId,
        empresaNombre: state.empresaNombre,
        isAuthenticated: state.isAuthenticated,
        lastLoginTime: state.lastLoginTime,
      }),
    },
  ),
);
