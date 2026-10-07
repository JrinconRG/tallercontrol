import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { authRepository } from "../features/auth/infrastructure/authRepository";
import { getAppErrorMessage } from "../shared/errors/getAppErrorMessage";

// Definimos la duración de la sesión (8 horas)
const SESSION_DURATION_MS = 8 * 60 * 60 * 1000;

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      role: null, // 'trabajador' | 'gerente'
      empresaId: null,
      empresaNombre: null,
      isAuthenticated: false,
      isLoading: false,
      lastLoginTime: null,

      // Verificar si la sesión ha expirado por tiempo
      isSessionExpired: () => {
        const { lastLoginTime, isAuthenticated } = get();
        if (!isAuthenticated || !lastLoginTime) return true;

        const now = Date.now();
        return now - lastLoginTime > SESSION_DURATION_MS;
      },

      login: async (identifier, password) => {
        set({ isLoading: true });

        try {
          const { user, authUserId } = await authRepository.login(
            identifier,
            password,
          );

          const newState = {
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
            lastLoginTime: Date.now(), // Se guarda el momento exacto de ingreso
          };

          set(newState);

          return {
            success: true,
            role: user.u_rol,
          };
        } catch (error) {
          set({
            isLoading: false,
            isAuthenticated: false,
            user: null,
            role: null,
          });
          return {
            success: false,
            error: getAppErrorMessage(error),
          };
        }
      },

      logout: async () => {
        try {
          await authRepository.logout();
        } catch (err) {
          console.error("Error al cerrar sesión:", err);
        } finally {
          set({
            user: null,
            role: null,
            empresaId: null,
            empresaNombre: null,
            isAuthenticated: false,
            lastLoginTime: null,
          });
          localStorage.removeItem("tallercontrol-auth");
        }
      },

      getState: () => get(),
    }),
    {
      name: "tallercontrol-auth",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
