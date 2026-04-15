import { useState } from "react";
import {
  crearCargoTrabajador,
  eliminarCargoTrabajador,
} from "../services/cargos";

//hook para crear un nuevo cargo para un trabajador

export function useCrearCargoTrabajador(cargoId, trabajadorId) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const crearCargoTrabajadorHook = async (cargoId, trabajadorId) => {
    try {
      setLoading(true);
      setError(null);
      await crearCargoTrabajador(cargoId, trabajadorId);
      return true;
    } catch (error) {
      setError(error.response?.data?.message || error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  return { crearCargoTrabajadorHook, loading, error };
}

export function useEliminarCargoTrabajador(cargoId, trabajadorId) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const eliminarCargoTrabajadorHook = async (cargoId, trabajadorId) => {
    try {
      setLoading(true);
      setError(null);
      await eliminarCargoTrabajador(cargoId, trabajadorId);
      return true;
    } catch (error) {
      setError(error.response?.data?.message || error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  return { eliminarCargoTrabajadorHook, loading, error };
}
