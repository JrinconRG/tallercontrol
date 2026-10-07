import { supabase } from "../lib/supabase";
import { ValidationError } from "../shared/errors/ValidationError";
import { mapSupabaseError } from "../shared/errors/mapSupabaseError";

export async function subirEvidencia(file, path) {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new ValidationError("Usuario no autenticado", { cause: userError });
    }

    const { data, error } = await supabase.storage
      .from("evidencias-subprocesos")
      .upload(path, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (error) throw error;
    return data;
  } catch (error) {
    throw mapSupabaseError(error);
  }
}

export const getImageUrl = async (path) => {
  if (!path) return null;

  try {
    const { data, error } = await supabase.storage
      .from("evidencias-subprocesos")
      .createSignedUrl(path, 60);

    if (error) throw error;
    return data?.signedUrl ?? null;
  } catch (error) {
    throw mapSupabaseError(error);
  }
};
