import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// RNF-SEG-01: obligar HTTPS en producción
if (import.meta.env.PROD && !supabaseUrl?.startsWith("https://")) {
  throw new Error("La URL de Supabase debe usar HTTPS");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: window.sessionStorage, // RNF-SEG-03: el token se borra al cerrar la pestaña
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
