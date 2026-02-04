import { supabase } from '../lib/supabase'

export async function obtenerSubprocesosTrabajador(trabajadorId) {
  const { data, error } = await supabase
    .from('vw_subprocesos_por_trabajador')
    .select('*')
    .eq('tc_trabajador_id', trabajadorId)
    .eq('sub_estado', 'EN_PROCESO')
    .order('sub_fecha_inicio', { ascending: true })

  if (error) {
    console.error('Error cargando subprocesos:', error)
    throw error
  }

  return data
}

export const getInformacionSubprocesoActual = async () => {
  try {
    const { data, error } = await supabase
      .from('vw_informacion_subproceso_actual')
      .select('*');

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error en getInformacionSubprocesoActual:', error);
    throw error;
  }
};

export async function crearSubproceso(procesoId, cargoId, trabajadorId) {
  console.log({
    procesoId: procesoId,
    cargoId: cargoId,
    trabajadorId: trabajadorId
  })
  console.log(supabase)


  const { error } = await supabase.rpc('sp_crear_subproceso', {
    p_proceso_id: procesoId,
    p_cargo_id: cargoId,
    p_trabajador_id: trabajadorId
  })

  if (error) {
    console.error('RPC ERROR:', error)
    throw error

  }
}

export async function finalizarSubproceso(evidenciaPath, subprocesoId) {
  console.log({
    evidenciaPath: evidenciaPath,
    subprocesoId: subprocesoId
  })
  const { error } = await supabase.rpc('sp_finalizar_subproceso', {
    p_sub_id_subproceso: subprocesoId,
    p_foto_path: evidenciaPath

  })

  if (error) {
    console.error('Error finalizando subproceso:', error)
    throw error
  }
}
