import { useState, useMemo, useEffect } from "react";
import Modal from "../../../../components/modal/Modal.jsx";
import CofreResumen from "./CofreResumen";
import FaseResumen from "./FaseResumen";
import { subirEvidencia } from "../../../../services/storage.js";
import { useFinalizarSubProceso } from "../../../../features/subProcesos/application/hooks/useFinalizarSubProceso.js";
import { Icon } from "../../../../components/ui/Icon.jsx";
import PropTypes from "prop-types";
import { useToast } from "../../../../hooks/useToast";
import { getAppErrorMessage } from "../../../../shared/errors/getAppErrorMessage";

export default function FinalizarSubproceso({
  subproceso,
  onClose,
  onSuccess,
}) {
  const [file, setFile] = useState(null);
  const { showError } = useToast();

  // `subproceso` llega como { subproceso, proceso }.
  // `proceso` es opcional: con él se muestra el color del cofre.
  const { subproceso: sub, proceso } = subproceso;

  // Vista previa: se crea una sola vez por foto y se libera al cambiarla
  // o al cerrar el modal (antes se creaba una URL nueva en cada render).
  const previewUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file],
  );
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0] ?? null);
  };

  // llamar hook para finalizar subproceso
  const { mutateAsync: finalizarSubprocesoMutate, isPending: isFinalizing } =
    useFinalizarSubProceso();

  async function handleConfirmar() {
    // El botón ya está deshabilitado sin foto; esto es solo respaldo
    if (!file) return;

    try {
      //SUBIR IMAGEN

      const evidenciaPath = `cofre_${sub.rc_nombre}/proceso_${sub.id_nombre_proceso}/subproceso_${sub.nombre_fase}_ID_${sub.id}.jpg`;

      await subirEvidencia(file, evidenciaPath);
      const dataParaBackend = {
        p_foto_path: evidenciaPath,
        p_sub_id_subproceso: sub.id,
      };
      await finalizarSubprocesoMutate(dataParaBackend);

      await onSuccess({
        tipo: sub.esUltimaFase ? "finalizado" : "fase",
        codigo: sub.id_nombre_proceso,
        nombre: sub.rc_nombre,
        fase: sub.nombre_fase,
      });
      onClose();
    } catch (error) {
      showError("No se pudo finalizar la fase", getAppErrorMessage(error));
    }
  }

  return (
    <Modal
      isOpen
      title={`Finalizar ${sub.nombre_fase}`}
      subtitle={
        sub.esUltimaFase
          ? "Última fase: el cofre quedará finalizado"
          : undefined
      }
      confirmText="Finalizar fase"
      onConfirm={handleConfirmar}
      onClose={onClose}
      loading={isFinalizing}
      disableConfirm={!file}
    >
      <CofreResumen
        codigo={proceso?.codigoCofre ?? sub.id_nombre_proceso}
        color={proceso?.color}
        colorHex={proceso?.colorHex}
        referencia={proceso?.referenciaNombre ?? sub.rc_nombre}
        referenciaCodigo={proceso?.referenciaCodigoNombre}
      />

      <FaseResumen
        etiqueta="Fase a finalizar"
        nombre={sub.nombre_fase}
        tono="enCurso"
      />

      <div className="form-group">
        <label htmlFor="evidencia">Foto de evidencia</label>

        <div className="file-upload-container">
          <label htmlFor="evidencia" className="file-upload-label">
            <Icon name="Camera" size={24} />
            <span>{file ? "Cambiar foto" : "Tomar foto de evidencia"}</span>
          </label>
          <input
            id="evidencia"
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="file-input-hidden"
          />
          {!file && (
            <p className="file-name-hint">
              Obligatoria para finalizar la fase.
            </p>
          )}
          {file && (
            <div className="image-preview-container">
              <img
                src={previewUrl}
                alt="Vista previa de la evidencia"
                className="preview-image"
              />
              <p className="file-name-hint">{file.name}</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

FinalizarSubproceso.propTypes = {
  subproceso: PropTypes.shape({
    subproceso: PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      rc_nombre: PropTypes.string,
      id_nombre_proceso: PropTypes.string,
      nombre_fase: PropTypes.string,
      sub_id_subproceso: PropTypes.string,
      esUltimaFase: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    }),
    proceso: PropTypes.shape({
      codigoCofre: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      referenciaNombre: PropTypes.string,
      referenciaCodigoNombre: PropTypes.string,
      color: PropTypes.string,
      colorHex: PropTypes.string,
    }),
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};
