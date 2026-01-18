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


export async function obtenerTrabajadoresPorCargo(cargoId) {
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
  
  export async function crearSubproceso(procesoId, cargoId, trabajadorId) {
    const { error } = await supabase.rpc('sp_crear_subproceso', {
      p_proceso_id: procesoId,
      p_cargo_id: cargoId,
      p_trabajador_id: trabajadorId
    })
  
    if (error) {
      console.error('Error creando subproceso:', error)
      throw error
    }
  }

  export async function finalizarSubproceso(subprocesoId, evidenciaPath) {
    const { error } = await supabase.rpc('sp_finalizar_subproceso', {
      p_sub_id_subproceso: subprocesoId,
      p_foto_path: evidenciaPath
    })
  
    if (error) {
      console.error('Error finalizando subproceso:', error)
      throw error
    }
  }
  