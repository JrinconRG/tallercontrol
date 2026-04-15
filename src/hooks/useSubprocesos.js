import { useState, useEffect } from 'react'
import {
    obtenerSubprocesosTrabajador, getInformacionSubprocesoActual, crearSubproceso, 
    finalizarSubproceso as finalizarSubprocesoService , getHistorialSubprocesosTrabajadorNoPagado} from '../services/subprocesos'

import{getImageUrl} from "../services/storage"
export function useHistorialSubprocesosTrabajadorNoPagado(){
    const[historialSubProcesos, setHistorialSubProcesos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [ error, setError] = useState(null);


    const cargarDatosHistorial = async () => {
        try{
            setLoading(true);
            setError(null);
            const datos = await getHistorialSubprocesosTrabajadorNoPagado();
            setHistorialSubProcesos(datos || []);
        }catch(err){
            setError(err.message);
        }finally{
            setLoading(false);
        }
    }
        useEffect(() => {
        cargarDatosHistorial()
  }, []);

  return {historialSubProcesos, loading, error, refetch:cargarDatosHistorial}

}




//hook para obtener subprocesos d eun trabajador
export function useSubprocesosTrabajador(trabajadorId) {
    const [subprocesos, setSubprocesos] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (!trabajadorId) {
            setLoading(false);
            return;
        }
        const cargarSubprocesos = async () => {
            try {
                setLoading(true);
                setError(null);
                const datos = await obtenerSubprocesosTrabajador(trabajadorId);
                setSubprocesos(datos || []);
            } catch (error) {
                setError(error.message)
            } finally {
                setLoading(false);
            }
        };

        cargarSubprocesos();
    }, [trabajadorId]); // se recarga si cambia el trabajadorId


    return { subprocesos, loading, error, refetch: () => { } };
}
// Hook para obtener información de subproceso actual
export function useSubprocesoActual() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            setError(null);
            const datos = await getInformacionSubprocesoActual();
            setData(datos || []);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        cargarDatos();
    }, []);
    return { data, loading, error, refetch: cargarDatos };// refetch para recargar los datos
}


// Hook para crear un subproceso(acciones)
export function useCrearSubproceso() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const crearSubprocesohook = async (procesoId, cargoId, trabajadorId) => {
        try {

            setLoading(true);
            setError(null);
            await crearSubproceso(procesoId, cargoId, trabajadorId);
            console.log('Subproceso creado con éxito');
            return { success: true };
        } catch (error) {
            setError(error.message);
            return { success: false, error: error.message };
        } finally {
            setLoading(false);
        }
    };
    return { crearSubprocesohook, loading, error };
}
// Hook para finalizar un subproceso(acciones)
export function useFinalizarSubproceso() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const finalizar = async (evidenciaPath, subprocesoId) => {
        try {
            setLoading(true);
            setError(null);
            await finalizarSubprocesoService(evidenciaPath, subprocesoId);
            return { success: true };
        } catch (error) {
            setError(error.message);
            return { success: false, error: error.message };
        } finally {
            setLoading(false);
        }
    };
    return {
        finalizarSubproceso: finalizar
        , loading, error
    };
}

export function useImagenes(paths){
    const [urls, setUrls] = useState([]);
    const[loading, setLoading] = useState(true);

    useEffect(() => {
        const cargarImagenes = async () => {
            if(!paths){
                setUrls([]);
                setLoading(false);
                return;
            }
            const lista = Array.isArray(paths) ? paths:[paths];
            setLoading(true);
            const resultadosImagenes = await Promise.all(
                lista.map((p)=> getImageUrl(p))
            );

            setUrls(resultadosImagenes.filter(Boolean));
            setLoading(false);
        }
        cargarImagenes()
    }, [paths]);
    return {urls,url:urls[0]||null, loading};
}