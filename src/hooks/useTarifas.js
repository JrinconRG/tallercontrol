import { useState, useEffect, use } from 'react'
import { matrizPrecios, crearTarifa } from '../services/tarifas'

//hook para obtener las tarifas de un trabajador


export function useObtenerTarifas(trabajadorId) {
    const [data, setData] = useState({ cargos: [], referencias: [], precios: {} });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!trabajadorId) return;

        async function cargarTarifas() {
            try {
                setLoading(true);
                const json = await matrizPrecios(trabajadorId);
                // json = { trabajador, cargos, referencias, precios }
                console.log('JSON del SP:', json); // 👈 agrega esto para ver qué llega

                setData({
                    cargos: json.cargos || [],
                    referencias: json.referencias || [],
                    precios: json.precios || {}
                });
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        cargarTarifas();
    }, [trabajadorId]);

    return { ...data, loading, error };
}
//hook para crear tarifas
export function useCrearTarifas() {
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    async function crearPrecio(trabajadorCargoId, cofreId, valor) {
        if (!trabajadorCargoId || !cofreId || !valor) return;

        try {
            setLoading(true);
            await crearTarifa(trabajadorCargoId, cofreId, valor);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return { error, loading, crearPrecio };
}