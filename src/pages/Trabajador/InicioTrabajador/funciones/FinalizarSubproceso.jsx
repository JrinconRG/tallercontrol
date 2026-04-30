import { useState } from "react";
import Modal from "../../../../components/modal/Modal.jsx";
import { subirEvidencia } from "../../../../services/storage.js";
import { useFinalizarSubProceso } from "../../../../features/subProcesos/application/hooks/useFinalizarSubProceso.js";
import { Icon } from "../../../../components/ui/Icon.jsx";
import PropTypes from "prop-types";

export default function FinalizarSubproceso({
  subproceso,
  onClose,
  onSuccess,
}) {
  const [file, setFile] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  console.log("Subproceso recibido en modal:", subproceso); // Debug: Verificar datos del subproceso

  // limpiar error cuando el usuario selecciono
  const handleSelectChange = (e) => {
    setFile(e.target.files[0]);
    if (e.target.files[0]) setErrorMsg("");
  };

  // llamar hook para finalizar subproceso
  const { mutateAsync: finalizarSubprocesoMutate, isPending: isFinalizing } =
    useFinalizarSubProceso();

  async function handleConfirmar() {
    if (!file) {
      setErrorMsg("Por favor, selecciona una foto de evidencia.");
      return;
    }

    try {
      setErrorMsg("");

      //SUBIR IMAGEN

      const evidenciaPath = `cofre_${subproceso.subproceso.rc_nombre}/proceso_${subproceso.subproceso.id_nombre_proceso}/subproceso_${subproceso.subproceso.nombre_fase}_ID_${subproceso.subproceso.sub_id_subproceso}.jpg`;

      await subirEvidencia(file, evidenciaPath);
      const dataParaBackend = {
        p_foto_path: evidenciaPath,
        p_sub_id_subproceso: subproceso.subproceso.id,
      };
      await finalizarSubprocesoMutate(dataParaBackend);

      await onSuccess({
        tipo: subproceso.subproceso.esUltimaFase ? "finalizado" : "fase",
        codigo: subproceso.subproceso.id_nombre_proceso,
        nombre: subproceso.subproceso.rc_nombre,
        fase: subproceso.subproceso.nombre_fase,
      });
      onClose();
    } catch (error) {
      console.error(error.message);
      setErrorMsg(
        "Hubo un error al procesar la solicitud. Intenta de nuevo.",
        error,
      );
    }
  }

  return (
    <Modal
      isOpen
      title="Finalizar fase"
      confirmText="Finalizar"
      onConfirm={handleConfirmar}
      onClose={onClose}
      loading={isFinalizing}
    >
      <p>
        <strong>Fase:</strong> {subproceso.subproceso.nombre_fase}
      </p>

      <label htmlFor="evidencia">Subir evidencia (foto)</label>
      {errorMsg && (
        <p style={{ color: "red", fontSize: "20px", marginTop: "4px" }}>
          {errorMsg}
        </p>
      )}
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
          onChange={handleSelectChange}
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
  );
}

FinalizarSubproceso.propTypes = {
  subproceso: PropTypes.shape({
    subproceso: PropTypes.shape({
      rc_nombre: PropTypes.string,
      id_nombre_proceso: PropTypes.string,
      nombre_fase: PropTypes.string,
      sub_id_subproceso: PropTypes.string,
      esUltimaFase: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    }),
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};
