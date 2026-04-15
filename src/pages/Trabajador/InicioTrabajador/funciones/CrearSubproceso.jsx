import { useState } from "react";
import Modal from "../../../../components/modal/Modal";
import { useTrabajadoresPorCargo } from "../../../../hooks/useTrabajadores";
import { useCrearSubproceso } from "../../../../hooks/useSubprocesos";
import PropTypes from "prop-types";

export default function CrearSubproceso({ contexto, onClose, onSuccess }) {
  const [trabajadorId, setTrabajadorId] = useState("");
  const { proceso, fase } = contexto;
  const [error, setError] = useState("");

  // funcion para limpiar el error si se selecciona

  const handleSelectChange = (e) => {
    setTrabajadorId(e.target.value);
    if (e.target.value) setError("");
  };

  //hook para obtener trabajadores por cargo
  const {
    trabajadores,
    loading: loadingTrabajadores,
    error: errorTrabajadores,
  } = useTrabajadoresPorCargo(fase?.siguiente_cargo_id);

  //hook para crear subproceso
  const { crearSubprocesohook: crearSubproceso, loading: creandoSubproceso } =
    useCrearSubproceso();

  async function handleConfirmar() {
    if (!trabajadorId) {
      setError(
        "Por favor, selecciona una referencia de trabajador para continuar.",
      );
      return; // Detiene la ejecución
    }
    try {
      const resultado = await crearSubproceso(
        proceso.pro_id_proceso,
        fase.siguiente_cargo_id,
        trabajadorId,
      );
      if (resultado.success) {
        const nombreTrabajador = trabajadores.find(
          (tra) => tra.t_id == trabajadorId,
        );
        onSuccess({
          tipo: "nuevaFase",
          codigo: proceso.pro_codigo_cofre,
          nombre: proceso.rc_nombre,
          fase: fase.siguiente_cargo_nombre,
          nombreTrabajador: nombreTrabajador
            ? `${nombreTrabajador.t_nombre} ${nombreTrabajador.t_apellidos}`
            : "No asignado",
        });
        onClose();
      } else {
        setError(resultado.error || "No se pudo crear el subproceso.");
      }
    } catch (err) {
      // Manejo de errores de conexion o fallos inesperados
      console.error("Error técnico:", err);
      setError("Ocurrió un error inesperado en el sistema.");
    }
  }

  const renderTrabajadoresContent = () => {
    if (loadingTrabajadores) return <p>Cargando trabajadores...</p>;
    if (errorTrabajadores) {
      return <p style={{ color: "red" }}>Error: {errorTrabajadores}</p>;
    }
    return (
      <>
        <select
          id="referencia-select-trabajador"
          value={trabajadorId}
          onChange={handleSelectChange}
          disabled={creandoSubproceso}
          className={error ? "input-error" : ""}
          style={{ borderColor: error ? "red" : "" }}
        >
          <option value="">Seleccione un trabajador</option>
          {trabajadores.map((t) => (
            <option key={t.t_id} value={t.t_id}>
              {t.t_nombre} {t.t_apellidos}
            </option>
          ))}
        </select>
        {error && (
          <span style={{ color: "red", fontSize: "18px", marginTop: "4px" }}>
            {error}
          </span>
        )}
      </>
    );
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
      <p>
        Proceso: <strong>{proceso.pro_codigo_cofre}</strong>
      </p>
      <p>
        Fase: <strong>{fase.siguiente_cargo_nombre}</strong>
      </p>
      <label htmlFor="referencia-select-trabajador">Trabajador asignado</label>
      {renderTrabajadoresContent()}
    </Modal>
  );
}
CrearSubproceso.propTypes = {
  contexto: PropTypes.shape({
    proceso: PropTypes.shape({
      pro_codigo_cofre: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
      ]).isRequired,
      pro_id_proceso: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
        .isRequired,
      rc_nombre: PropTypes.string.isRequired,
    }).isRequired,
    fase: PropTypes.shape({
      siguiente_cargo_id: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
      ]).isRequired,
      siguiente_fase_orden: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
      ]).isRequired,
      siguiente_cargo_nombre: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
      ]).isRequired,
    }).isRequired,
  }).isRequired,

  //funciones
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};
