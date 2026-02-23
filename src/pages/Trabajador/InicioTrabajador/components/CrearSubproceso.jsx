import { useState } from 'react'
import Modal from '../../../../components/modal/Modal'
import { useTrabajadoresPorCargo } from '../../../../hooks/useTrabajadores'
import { useCrearSubproceso } from '../../../../hooks/useSubprocesos'

export default function CrearSubproceso({ contexto, onClose, onSuccess }) {
    const [trabajadorId, setTrabajadorId] = useState('')
    const { proceso, fase } = contexto

    //hook para obtener trabajadores por cargo
    const { trabajadores,
        loading: loadingTrabajadores,
        error: errorTrabajadores
    } = useTrabajadoresPorCargo(fase?.siguiente_cargo_id)

    //hook para crear subproceso
    const { crearSubprocesohook: crearSubproceso,
        loading: creandoSubproceso,
    } = useCrearSubproceso()

    async function handleConfirmar() {
        if (!trabajadorId) return;

        const resultado = await crearSubproceso(
            proceso.pro_id_proceso,
            fase.siguiente_cargo_id,
            trabajadorId
        );
        if (resultado.success) {
            onSuccess()
            onClose()
        } else {
            alert(resultado.error)
        }
    }

    return (
        <Modal
            isOpen={true}
            title={`Iniciar fase ${fase.siguiente_fase_orden} - ${fase.siguiente_cargo_nombre}`}
            confirmText="Iniciar fase"
            onConfirm={handleConfirmar}
            onClose={onClose}
            disabled={creandoSubproceso || !trabajadorId}

        >
            <p>Proceso: <strong>{proceso.pro_codigo_cofre}</strong></p>
            <p>
                Fase: <strong>{fase.siguiente_cargo_nombre}</strong>
            </p>
            <label>Trabajador asignado</label>
            {loadingTrabajadores ? (
                <p>Cargando trabajadores...</p>
            ) : errorTrabajadores ? (
                <p style={{ color: 'red' }}>Error: {errorTrabajadores}</p>
            ) : (
                <select
                    value={trabajadorId}
                    onChange={(e) => setTrabajadorId(e.target.value)}
                    disabled={creandoSubproceso}
                >
                    <option value="">Seleccione un trabajador</option>
                    {trabajadores.map((t) => (
                        <option key={t.t_id} value={t.t_id}>
                            {t.t_nombre} {t.t_apellidos}
                        </option>
                    ))}
                </select>
            )}
        </Modal>
    )
}