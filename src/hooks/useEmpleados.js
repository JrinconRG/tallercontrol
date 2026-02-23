import { useState } from 'react'
import { crearEmpleado } from '../services/empleados'


// hook para crear un nuevo empleado
export function useCrearEmpleado() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const crearEmpleadoHook = async (nombre, apellidos, numeroDocumento, celular) => {
        try {
            setLoading(true);
            setError(null);
            await crearEmpleado(nombre, apellidos, numeroDocumento, celular);
            return { success: true };
        } catch (error) {
            setError(error.message);
            return { success: false, error: error.message };
        } finally {
            setLoading(false);
        }
    };
    return { crearEmpleadoHook, loading, error };
}


