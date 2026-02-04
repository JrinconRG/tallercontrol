import { useState } from 'react';
import Modal from '../../../../components/modal/Modal';
import { subirEvidencia } from '../../../../services/storage.js';
import { useFinalizarSubproceso } from '../../../../hooks/useSubprocesos';


export default function FinalizarSubproceso({ subproceso, onClose, onSuccess }) {
    const [file, setFile] = useState(null);

    // llamar hook para finalizar subproceso
    const { finalizarSubproceso, loading } = useFinalizarSubproceso();

    async function handleConfirmar() {
        if (!file) return alert('seleccione un archivo.');
        try {
            //SUBIR IMAGEN
            // Al inicio del componente, agrega un console.log para verificar
            const evidenciaPath = `cofre_${subproceso.subproceso.rc_nombre}/proceso_${subproceso.subproceso.id_nombre_proceso}/subproceso_${subproceso.subproceso.nombre_fase}.jpg`;
            console.log('path:', evidenciaPath);

            await subirEvidencia(file, evidenciaPath);

            //FINALIZAR SUBPROCESO
            const result = await finalizarSubproceso(evidenciaPath, subproceso.subproceso.sub_id_subproceso);
            if (result.success) {
                await onSuccess();
                onClose();
            }
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <Modal
            isOpen
            title="Finalizar fase"
            confirmText="Finalizar"
            onConfirm={handleConfirmar}
            onClose={onClose}
            loading={loading}>

            <p>
                <strong>Fase:</strong> {subproceso.cargo_nombre}
            </p>

            <label>Subir evidencia (foto)</label>
            <input
                type="file"
                accept="image/*"
                capture="environment"

                onChange={e => setFile(e.target.files[0])}
            />
            {
                file && (
                    <img
                        src={URL.createObjectURL(file)}
                        alt="preview"
                        style={{
                            width: '100%',
                            marginTop: '10px',
                            borderRadius: '8px'
                        }}
                    />
                )
            }
        </Modal>
    )
}



