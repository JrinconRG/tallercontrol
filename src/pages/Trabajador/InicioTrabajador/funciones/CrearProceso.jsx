import { useState } from "react";
import Modal from "../../../../components/modal/Modal";
import { useObtenerReferenciasCofres } from "../../../../features/cofres/application/hook/useObtenerReferenciasCofres";
import { useCrearProceso } from "../../../../features/procesos/application/hooks/useCrearProceso";
import PropTypes from "prop-types";

export default function CrearProceso({ onClose, onSuccess }) {
  const [referenciaId, setReferenciaId] = useState("");
  const [validacionError, setValidacionError] = useState("");
  // limpiar error cuando el usuario selecciono
  const { referencias, loading: loadingRefs } = useObtenerReferenciasCofres();

  const { mutate: ejecutarCrearProceso, isPending: isCreating } =
    useCrearProceso();

  const handleSelectChange = (e) => {
    setReferenciaId(e.target.value);
    if (e.target.value) setValidacionError("");
  };

  async function handleConfirmar() {
    if (!referenciaId) {
      setValidacionError(
        "Por favor, selecciona una referencia de cofre para continuar.",
      );
      return;
    }

    if (!navigator.onLine) {
      setValidacionError("No hay conexión a internet.");
      return;
    }

    ejecutarCrearProceso(referenciaId, {
      onSuccess: (nuevoProceso) => {
        const refSeleccionada = referencias.find(
          (ref) => ref.id == referenciaId,
        );

        onSuccess({
          tipo: "creado",
          codigo: nuevoProceso.codigo,
          nombre: refSeleccionada
            ? refSeleccionada.nombre
            : "Nombre desconocido",
        });
        onClose();
      },
      onError: () => {
        setValidacionError("Hubo un fallo en el servidor. Intenta de nuevo.");
      },
    });
  }

  return (
    <Modal
      isOpen
      title="Crear proceso"
      confirmText={isCreating ? "Creando..." : "Crear Proceso"}
      onConfirm={handleConfirmar}
      onClose={onClose}
      disableConfirm={isCreating || loadingRefs}
    >
      {loadingRefs ? (
        <p>Cargando referencias...</p>
      ) : (
        <>
          <label htmlFor="referencia-select">Referencia de cofre</label>
          <select
            id="referencia-select"
            value={referenciaId}
            onChange={handleSelectChange}
            className={validacionError ? "input-error" : ""}
            style={{ borderColor: validacionError ? "red" : "" }}
          >
            <option value="">Seleccione una referencia</option>
            {referencias.map((ref) => (
              <option key={ref.id} value={ref.id}>
                {ref.nombre}({ref.codigo})
              </option>
            ))}
          </select>

          {validacionError && (
            <p style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>
              {validacionError}
            </p>
          )}
        </>
      )}
    </Modal>
  );
}

CrearProceso.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};
