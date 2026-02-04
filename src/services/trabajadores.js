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