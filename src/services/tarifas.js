

import { supabase } from '../lib/supabase'

export async function matrizPrecios(trabajadorId) {
    const { data, error } = await supabase.rpc(
        'sp_matriz_precios_json', // o la que estés usando
        {
            p_trabajador_id: trabajadorId,
        }
    )

    if (error) {
        console.error('Error trayendo los precios:', error)
        throw error
    }

    return data
}




export async function crearTarifa(
    trabajadorCargoId,
    cofreId,
    valor
) {
    const { error } = await supabase.rpc(
        'sp_crear_precio',
        {
            p_trabajador_cargo_id: trabajadorCargoId,
            p_cofre_id: cofreId,
            p_valor: valor
        }
    )

    if (error) {
        console.error('Error creando precio:', error)
        throw error
    }
}