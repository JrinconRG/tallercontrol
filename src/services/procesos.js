import { supabase } from '../lib/supabase'

export async function crearProceso(referenciaId) {
  const { data, error } = await supabase.rpc('sp_crear_proceso', {
    p_referencia_id: referenciaId
  })

  if (error) {
    console.error('Error creando proceso:', error)
    throw error
  }

  return data // devuelve pro_id
}


export async function obtenerProcesosActivos() {
  const { data, error } = await supabase
    .from('vw_procesos_activos')
    .select('*')
    .in('pro_estado', ['activo', 'en_proceso'])
    .order('pro_fecha_inicio', { ascending: true })

  if (error) {
    console.error('Error cargando procesos activos:', error)
    throw error
  }

  return data
}

export async function obtenerFaseActualProcesos() {
  const { data, error } = await supabase
    .from('vw_fase_actual')
    .select('*')

  if (error) {
    console.error('Error cargando fase actual:', error)
    throw error
  }

  return data
}

export async function validarSiguienteFase(procesoId, cargoId) {
  const { data, error } = await supabase.rpc('sp_validar_siguiente_fase', {
    p_proceso_id: procesoId,
    p_cargo_id: cargoId
  })

  if (error) {
    console.error('Error validando siguiente fase:', error)
    throw error
  }

  return data // true | false
}
