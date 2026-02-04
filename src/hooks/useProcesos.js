import { useState, useEffect } from 'react'
import { obtenerProcesosActivos, obtenerFaseActualProcesos } from '../services/procesos'

export function useProcesosActivos() {
    const [procesos, setProcesos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            setError(null);
            const datos = await obtenerProcesosActivos();
            setProcesos(datos||[]);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        cargarDatos();
    }, []);
    return { procesos, loading, error, refetch: cargarDatos };} // refetch para recargar los datos


export function useFaseActualProcesos() {
    const [fases, setFases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    const cargarDatos = async () => {
        try {
            setLoading(true);
            setError(null);
            const datos = await obtenerFaseActualProcesos();
            setFases(datos||[]);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        cargarDatos();
    }, []);
    return { fases, loading, error, refetch: cargarDatos };} // refetch para recargar los datos