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
            return true ;
        } catch (error) {
            setError(error.response?.data?.message || error.message); 
            throw error
        } finally {
            setLoading(false);
        }
    };
    return { crearEmpleadoHook, loading, error };
}


