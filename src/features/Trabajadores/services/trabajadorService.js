import { supabase } from "../../../lib/supabase";

export async function obtenerTrabajadoresPorCargo(cargoId) {
  if (!cargoId) {
    throw new Error("cargoId es requerido");
  }

  const { data, error } = await supabase
    .from("vw_trabajadores_por_cargo")
    .select("*")
    .eq("cargo_id", cargoId);

  if (error) {
    console.error("Error cargando trabajadores por cargo:", error);
    throw error;
  }

  return data;
}

export const getTrabajadoresSelect = async () => {
  const { data, error } = await supabase
    .from("vw_trabajadores_select")
    .select("*");

  if (error) throw error;
  return data;
};

export const getInformacionEmpleados = async () => {
  const { data, error } = await supabase
    .from("vw_trabajadores_con_cargos")
    .select("*");

  if (error) throw error;
  return data;
};

export const crearEmpleado = async ({
  nombre,
  apellidos,
  numeroDocumento,
  celular,
}) => {
  if (!nombre || !apellidos || !numeroDocumento || !celular) {
    throw new Error(
      "Todos los campos (nombre, apellidos, documento y celular) son obligatorios.",
    );
  }
  const { data, error } = await supabase.rpc("sp_crear_trabajador", {
    p_nombre: nombre,
    p_apellidos: apellidos,
    p_numero_de_documento: numeroDocumento,
    p_celular: celular,
  });
  if (error) throw error;
  return data; // devuelve trabajador_id
};

export const asignarCargo = async ({ cargoId, trabajadorId }) => {
  if (!cargoId || !trabajadorId) {
    throw new Error("Todos los campos son  requerido");
  }

  const { error } = await supabase.rpc("sp_agregar_cargo_trabajador", {
    p_trabajador_id: trabajadorId,
    p_cargo_id: cargoId,
  });

  if (error) throw error;
  return true;
};

export const designarCargo = async ({ cargoId, trabajadorId }) => {
  if (!cargoId || !trabajadorId) {
    throw new Error("Todos los campos son  requerido");
  }

  const { error } = await supabase.rpc("sp_eliminar_cargo_trabajador", {
    p_trabajador_id: trabajadorId,
    p_cargo_id: cargoId,
  });
  if (error) throw error;
  return true;
};
