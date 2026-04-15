import { useState, useEffect } from "react";
import {
  getInformacionSubprocesoActual,
  crearSubproceso,
  finalizarSubproceso as finalizarSubprocesoService,
  getHistorialSubprocesosTrabajadorNoPagado,
} from "../services/subprocesos";

import { getImageUrl } from "../services/storage";
import { useFetch } from "./useFetch";

export function useHistorialSubprocesosTrabajadorNoPagado() {
  const { data, loading, error, refetch } = useFetch(
    getHistorialSubprocesosTrabajadorNoPagado,
  );

  return {
    historialSubProcesos: data,
    loading,
    error,
    refetch,
  };
}

// Hook para obtener información de subproceso actual

export function useSubprocesoActual() {
  const { data, loading, error, refetch } = useFetch(
    getInformacionSubprocesoActual,
  );

  return {
    data,
    loading,
    error,
    refetch,
  };
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
      console.log("Subproceso creado con éxito");
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
    finalizarSubproceso: finalizar,
    loading,
    error,
  };
}

export function useImagenes(paths) {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarImagenes = async () => {
      if (!paths) {
        setUrls([]);
        setLoading(false);
        return;
      }
      const lista = Array.isArray(paths) ? paths : [paths];
      setLoading(true);
      const resultadosImagenes = await Promise.all(
        lista.map((p) => getImageUrl(p)),
      );

      setUrls(resultadosImagenes.filter(Boolean));
      setLoading(false);
    };
    cargarImagenes();
  }, [paths]);
  return { urls, url: urls[0] || null, loading };
}
