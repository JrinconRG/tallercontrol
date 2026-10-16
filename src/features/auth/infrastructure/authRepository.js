import { supabase } from "../../../lib/supabase";
import { ValidationError } from "../../../shared/errors/ValidationError";
import { mapSupabaseError } from "../../../shared/errors/mapSupabaseError";
import { authErrorMap } from "./errors/authErrorMap";

const INVALID_CREDENTIALS = "Usuario o contraseña incorrectos";

export const authRepository = {
  async login(usuario, password) {
    try {
      const cleanIdentifier = usuario.trim();

      // 1. Resolver el correo (antes del login: solo devuelve el email)
      const { data: email, error: emailError } = await supabase.rpc(
        "obtener_email_por_usuario",
        { p_usuario: cleanIdentifier },
      );
      if (emailError) throw emailError;

      // Mismo mensaje que credenciales malas, para no revelar si el usuario existe
      if (!email) throw new ValidationError(INVALID_CREDENTIALS);

      // 2. Autenticar en Supabase Auth (HTTPS, hash bcrypt en servidor)
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw authError;

      // 3. Ya autenticado: cargar el perfil del usuario actual
      const { data: perfiles, error: perfilError } = await supabase.rpc(
        "obtener_perfil_actual",
      );
      if (perfilError) throw perfilError;

      const perfil = Array.isArray(perfiles) ? perfiles[0] : null;
      if (!perfil) {
        // Autenticó en Auth pero no tiene perfil activo en la app
        await supabase.auth.signOut();
        throw new ValidationError(
          "Tu cuenta no tiene acceso al sistema. Contacta al administrador",
        );
      }

      return {
        user: {
          u_id: perfil.u_id,
          u_nombre: perfil.u_nombre,
          u_usuario: perfil.u_usuario,
          u_rol: perfil.u_rol,
          u_empresa_id: perfil.u_empresa_id,
          empresa_nombre: perfil.empresa_nombre,
        },
        authUserId: authData.user.id,
      };
    } catch (error) {
      throw mapSupabaseError(error, authErrorMap);
    }
  },

  async logout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      throw mapSupabaseError(error, authErrorMap);
    }
  },
};
