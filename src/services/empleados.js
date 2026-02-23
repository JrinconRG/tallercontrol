import { supabase } from '../lib/supabase'

export async function crearEmpleado(nombre, apellidos, numeroDocumento, celular) {
    const { data, error } = await supabase.rpc('sp_crear_trabajador', {
        p_nombre: nombre,
        p_apellidos: apellidos,
        p_numero_de_documento: numeroDocumento,
        p_celular: celular
    })

    if (error) {
        console.error('Error creando empleado:', error)
        throw error
    }

    return data // devuelve trabajador_id
}

