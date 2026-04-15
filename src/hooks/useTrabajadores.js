import { useState, useEffect } from "react";
import {
  obtenerTrabajadoresPorCargo,
  getInformacionEmpleados,
  getTrabajadoresSelect,
} from "../services/trabajadores";

export function useTrabajadoresPorCargo(cargoId) {
  const [trabajadores, setTrabajadores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
        setTrabajadores(datos || []);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    cargarTrabajadores();
  }, [cargoId]); // se recarga si cambia el cargoId
  return { trabajadores, loading, error };
}

export function useTrabajadoresSelect() {
  const [trabajadores, setTrabajadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const cargarTrabajadoresSelect = async () => {
    try {
      const datos = await getTrabajadoresSelect();
      setTrabajadores(datos || []);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    cargarTrabajadoresSelect();
  }, []);
  return { trabajadores, loading, error };
}

export function useEmpleadosConCargos() {
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cargarEmpleados = async () => {
    try {
      setLoading(true);
      setError(null);
      const datos = await getInformacionEmpleados();
      const normalizados = (datos || []).map((emp) => ({
        ...emp,
        cargos: (emp.cargos || []).map((c) => ({
          id: c.id ?? c.c_id,
          nombre: c.nombre ?? c.c_nombre,
        })),
      }));

      setEmpleados(normalizados);
      console.log("Empleados con cargos cargados:", datos);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    cargarEmpleados();
  }, []); // se carga una vez al montar el componente

  return { empleados, loading, error, refetch: cargarEmpleados };
} // refetch para recargar los datos
