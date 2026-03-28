import { useState, useEffect } from 'react'
import { obtenerProcesosActivos, obtenerFaseActualProcesos, obtenerHistorialProcesos , obtenerDetallesProcesosGerente} from '../services/procesos'

export function useProcesosActivos() {
    const [procesos, setProcesos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            setError(null);
            const datos = await obtenerProcesosActivos();
            console.log('Datos cargados:', datos);
            setProcesos(datos || []);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        cargarDatos();
    }, []);
    return { procesos, loading, error, refetch: cargarDatos };
} // refetch para recargar los datos


export function useFaseActualProcesos() {
    const [fases, setFases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    const cargarDatos = async () => {
        try {
            setLoading(true);
            setError(null);
            const datos = await obtenerFaseActualProcesos();
            setFases(datos || []);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        cargarDatos();
    }, []);
    return { fases, loading, error, refetch: cargarDatos };
} // refetch para recargar los datos


export function useHistorialProcesos() {
    const [historial, setHistorial] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            setError(null);
            const datos = await obtenerHistorialProcesos();

            const datosLimpios = (datos || []).map((row) => ({
                ...row,
                detalle_subprocesos: Array.isArray(row.detalle_subprocesos)
                ? row.detalle_subprocesos
                : JSON.parse(row.detalle_subprocesos || "[]"),
            }));

            setHistorial(datosLimpios);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        cargarDatos();
    }, []);
    return { historial, loading, error, refetch: cargarDatos };
}

export function useDetalleProcesos() {
    const [procesosDetalle, setProcesosDetalle] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            setError(null);
            const datos = await obtenerDetallesProcesosGerente();
            setProcesosDetalle(datos || []);
        } catch (error_) {
            setError(error_.message);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        cargarDatos();
    }, []);
    return { procesosDetalle, loading, error, refetch: cargarDatos };
}