import { supabase } from "../../../lib/supabase";
import { ValidationError } from "../../../shared/errors/ValidationError";
import { mapSupabaseError } from "../../../shared/errors/mapSupabaseError";

export const authRepository = {
  async login(usuario, password) {
    try {
      const cleanIdentifier = usuario.trim();

      // 1. Obtener datos del usuario desde la RPC
      const { data: userData, error: rpcError } = await supabase.rpc(
        "obtener_login_por_usuario",
        { p_usuario: cleanIdentifier },
      );

      if (rpcError) throw rpcError;

      // Si la RPC no devuelve ningún registro, lanzar error claro
      if (!Array.isArray(userData) || userData.length === 0) {
        throw new ValidationError("Usuario o contraseña incorrectos");
      }

      const user = userData[0];

      if (!user.u_email) {
        throw new ValidationError(
          "El usuario no tiene un correo de acceso configurado.",
        );
      }

      // 2. Iniciar sesión en Supabase Auth con el email resuelto
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: user.u_email,
          password,
        });

      if (authError) {
        throw new ValidationError("Usuario o contraseña incorrectos");
      }

      return {
        user: {
          u_id: user.u_id,
          u_nombre: user.u_nombre,
          u_usuario: user.u_usuario,
          u_rol: user.u_rol,
          u_empresa_id: user.u_empresa_id,
          empresa_nombre: user.empresa_nombre,
        },
        authUserId: authData.user.id,
      };
    } catch (error) {
      throw mapSupabaseError(error);
    }
  },

  async logout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      throw mapSupabaseError(error);
    }
  },
};
