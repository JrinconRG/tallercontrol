import { supabase } from "../../../lib/supabase";

export async function obtenerClientes() {
  const { data, error } = await supabase.from("vw_clientes").select("*");

  if (error) {
    throw error;
  }

  return data;
}

export async function crearCliente({ nombre, celular, direccion }) {
  const { data, error } = await supabase.rpc("sp_crear_cliente", {
    p_nombre: nombre,
    p_celular: celular,
    p_direccion: direccion ?? null,
  });

  if (error) {
    throw error;
  }
  return data; //tipo fila  cliente_id
}

export async function eliminarCliente(clienteId) {
  const { error } = await supabase.rpc("sp_eliminar_cliente", {
    p_cliente_id: clienteId,
  });
  if (error) {
    throw error;
  }
}
