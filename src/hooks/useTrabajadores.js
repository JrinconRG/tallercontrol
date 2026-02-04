import { useState, useEffect } from 'react'
import { obtenerTrabajadoresPorCargo } from '../services/trabajadores'

export function useTrabajadoresPorCargo(cargoId) {
    const [trabajadores, setTrabajadores] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (!cargoId) {
            setTrabajadores([]);
            return;
        }
        const cargarTrabajadores = async () => {
            try {
                setLoading(true);
                setError(null);
                const datos = await obtenerTrabajadoresPorCargo(cargoId);
                setTrabajadores(datos||[]);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
        cargarTrabajadores();
    }, [cargoId]); // se recarga si cambia el cargoId
    return { trabajadores, loading, error};
}