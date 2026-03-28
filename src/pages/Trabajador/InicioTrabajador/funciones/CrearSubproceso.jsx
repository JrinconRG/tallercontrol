import { useState } from 'react'
import Modal from '../../../../components/modal/Modal'
import { useTrabajadoresPorCargo } from '../../../../hooks/useTrabajadores'
import { useCrearSubproceso } from '../../../../hooks/useSubprocesos'

export default function CrearSubproceso({ contexto, onClose, onSuccess }) {
    const [trabajadorId, setTrabajadorId] = useState('');
    const { proceso, fase } = contexto;
    const [error, setError] = useState('');


    // funcion para limpiar el error si se selecciona

    const handleSelectChange = (e) => {
        setTrabajadorId(e.target.value);
        if (e.target.value) setError('');
    }

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
        if (!trabajadorId) {
            setError("Por favor, selecciona una referencia de trabajador para continuar.");
            return; // Detiene la ejecución


        }
        try {
            const resultado = await crearSubproceso(
                proceso.pro_id_proceso,
                fase.siguiente_cargo_id,
                trabajadorId
            );
            if (resultado.success) {
                onSuccess()
                onClose()
            } else {
                setError(resultado.error || "No se pudo crear el subproceso.");
            }

        } catch (err) {
            // Manejo de errores de conexion o fallos inesperados
            console.error("Error técnico:", err);
            setError("Ocurrió un error inesperado en el sistema.");

        }


    };

    return (
        <Modal
            isOpen={true}
            title={`Iniciar fase ${fase.siguiente_fase_orden} - ${fase.siguiente_cargo_nombre}`}
            confirmText="Iniciar fase"
            onConfirm={handleConfirmar}
            onClose={onClose}
            disabled={creandoSubproceso}

        >


            <p>Proceso: <strong>{proceso.pro_codigo_cofre}</strong></p>
            <p>
                Fase: <strong>{fase.siguiente_cargo_nombre}</strong>
            </p>
            <label htmlFor="referencia-select-trabajador">Trabajador asignado</label>
            {loadingTrabajadores ? (
                <p>Cargando trabajadores...</p>
            ) : errorTrabajadores ? (
                <p style={{ color: 'red' }}>Error: {errorTrabajadores}</p>
            ) : (

                <>
                    <select
                        id="referencia-select-trabajador"

                        value={trabajadorId}
                        onChange={handleSelectChange}
                        disabled={creandoSubproceso}
                        className={error ? "input-error" : ""}
                        style={{ borderColor: error ? 'red' : '' }}

                    >
                        <option value="">Seleccione un trabajador</option>
                        {trabajadores.map((t) => (
                            <option key={t.t_id} value={t.t_id}>
                                {t.t_nombre} {t.t_apellidos}
                            </option>
                        ))}



                    </select>


                    {error && (
                        <span style={{ color: 'red', fontSize: '18px', marginTop: '4px' }}>
                            {error}
                        </span>
                    )}
                </>



            )


            }




        </Modal>
    )
}