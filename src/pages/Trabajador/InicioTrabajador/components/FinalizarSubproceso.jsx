import { useState } from 'react';
import Modal from '../../../../components/modal/Modal';
import { subirEvidencia } from '../../../../services/storage.js';
import { useFinalizarSubproceso } from '../../../../hooks/useSubprocesos';
import { Icon } from "../../../../components/ui/Icon";

export default function FinalizarSubproceso({ subproceso, onClose, onSuccess }) {
    const [file, setFile] = useState(null);

    // llamar hook para finalizar subproceso
    const { finalizarSubproceso, loading } = useFinalizarSubproceso();

    async function handleConfirmar() {
        if (!file) return alert('seleccione un archivo.');
        try {
            //SUBIR IMAGEN
            // Al inicio del componente, agrega un console.log para verificar
            // Antes de subir, añade un timestamp al final del nombre
            const timestamp = Date.now();
            const evidenciaPath = `cofre_${subproceso.subproceso.rc_nombre}/proceso_${subproceso.subproceso.id_nombre_proceso}/subproceso_${subproceso.subproceso.nombre_fase}_${timestamp}.jpg`;
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
                <strong>Fase:</strong> {subproceso.subproceso.nombre_fase}
            </p>

            <label>Subir evidencia (foto)</label>
            <div className="file-upload-container">
                <label htmlFor="evidencia" className="file-upload-label">
                    <Icon name="Camera" size={24} />
                    <span>{file ? "Cambiar Foto" : "Tomar Foto de Evidencia"}</span>
                </label>
                <input
                    id="evidencia"
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={e => setFile(e.target.files[0])}
                    className="file-input-hidden"
                />
                {file && (
                    <div className="image-preview-container">
                        <img
                            src={URL.createObjectURL(file)}
                            alt="Vista previa"
                            className="preview-image"
                        />
                        <p className="file-name-hint">{file.name}</p>
                    </div>
                )}
            </div>
        </Modal>
    )
}



