import { supabase } from '../lib/supabase'


export async function crearProceso(referenciaId) {
  const { data, error } = await supabase.rpc('sp_crear_proceso', {
    p_referencia_id: referenciaId
  })

  if (error) {
    console.error('Error creando proceso:', error)
    throw new Error(error.message) 
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
    throw new Error(error.message) 
  }

  return data
}


export async function obtenerHistorialProcesos() {
  const { data, error } = await supabase
    .from('vw_historial_trabajador')
    .select('*')

    .order('pro_fecha_fin', { ascending: false }) // false = Los más nuevos primero

  if (error) {
    console.error('Error cargando historial de procesos:', error)
    throw new Error(error.message) 
  }

  return data
}

export async function obtenerFaseActualProcesos() {
  const { data, error } = await supabase
    .from('vw_fase_actual')
    .select('*')

  if (error) {
    console.error('Error cargando fase actual:', error)
    throw new Error(error.message) 
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
    throw new Error(error.message) 
  }

  return data // true | false
}


export async function obtenerDetallesProcesosGerente() {
  const { data, error } = await supabase
    .from('vista_dashboard_gerente')
    .select('pro_id_proceso, pro_codigo_cofre, pro_estado, rc_nombre, fase_actual, fases')


  if (error) {
    console.error('Error cargando el detalle de procesos:', error)
    throw new Error(error.message) 
  }

  return (data ?? []).map(p => ({
  ...p,
  fases: typeof p.fases === 'string' ? JSON.parse(p.fases) : (p.fases ?? [])
}))
}

  
  
