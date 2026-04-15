import { useState, useEffect } from "react";
import Modal from "../../../../components/modal/Modal";
import { obtenerReferenciasCofre } from "../../../../services/cofres";
import { crearProceso } from "../../../../services/procesos";
import PropTypes from "prop-types";

export default function CrearProceso({ onClose, onSuccess }) {
  const [referencias, setReferencias] = useState([]);
  const [referenciaId, setReferenciaId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // limpiar error cuando el usuario selecciono
  const handleSelectChange = (e) => {
    setReferenciaId(e.target.value);
    if (e.target.value) setError("");
  };

  useEffect(() => {
    async function cargarReferencias() {
      try {
        setLoading(true);
        const data = await obtenerReferenciasCofre();
        setReferencias(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    cargarReferencias();
  }, []);

  async function handleConfirmar() {
    if (!referenciaId) {
      setError("Por favor, selecciona una referencia de cofre para continuar.");
      return; // Detiene la ejecución
    }
    try {
      setLoading(true);
      const cofre = await crearProceso(referenciaId);
      const nombreReferencia = referencias.find(
        (ref) => ref.rc_id == referenciaId,
      );

      onSuccess({
        tipo: "creado",
        codigo: cofre.codigo,
        nombre: nombreReferencia.rc_nombre,
      });
      onClose();
    } catch (error) {
      console.error("Error al crear el proceso:", error);
      setError("Hubo un fallo en el servidor. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      isOpen
      title="Crear proceso"
      confirmText="Crear Proceso"
      onConfirm={handleConfirmar}
      onClose={onClose}
    >
      {loading ? (
        <p>Cargando referencias...</p>
      ) : (
        <>
          <label htmlFor="referencia-select">Referencia de cofre</label>
          <select
            id="referencia-select"
            value={referenciaId}
            onChange={handleSelectChange}
            className={error ? "input-error" : ""}
            style={{ borderColor: error ? "red" : "" }}
          >
            <option value="">Seleccione una referencia</option>
            {referencias.map((ref) => (
              <option key={ref.rc_id} value={ref.rc_id}>
                {ref.rc_nombre}({ref.rc_codigo})
              </option>
            ))}
          </select>

          {error && (
            <p style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>
              {error}
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
