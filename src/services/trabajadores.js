import { supabase } from '../lib/supabase'


export async function obtenerTrabajadoresPorCargo(cargoId) {
  if (!cargoId) {
    throw new Error('cargoId es requerido')
  }

  const { data, error } = await supabase
    .from('vw_trabajadores_por_cargo')
    .select('*')
    .eq('cargo_id', cargoId)

  if (error) {
    console.error('Error cargando trabajadores por cargo:', error)
    throw error
  }

  return data
}

export const getTrabajadoresSelect = async () => {
  try {
    const { data, error } = await supabase
      .from('vw_trabajadores_select')
      .select('*');

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error en getTrabajadoresSelect:', error);
    throw error;
  }
};



export const getInformacionEmpleados = async () => {
  try {
    const { data, error } = await supabase
      .from('vw_trabajadores_con_cargos')
      .select('*');

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error en getInformacionEmpleados:', error);
    throw error;
  }
};