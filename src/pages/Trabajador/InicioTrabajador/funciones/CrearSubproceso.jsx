import { useState } from "react";
import Modal from "../../../../components/modal/Modal";
import { useTrabajadoresPorCargo } from "../../../../features/Trabajadores/application/hooks/useTrabajadoresPorCargo";
import { useCrearSubproceso } from "../../../../features/subProcesos/application/hooks/useCrearSubProceso";
import PropTypes from "prop-types";

export default function CrearSubproceso({ contexto, onClose, onSuccess }) {
  const [trabajadorId, setTrabajadorId] = useState("");
  const { proceso, fase } = contexto;
  console.log("Contexto recibido en CrearSubproceso:", contexto); // Agrega este log para verificar el contexto recibido
  const [errorValidacion, setErrorValidacion] = useState("");
  // funcion para limpiar el error si se selecciona

  const handleSelectChange = (e) => {
    setTrabajadorId(e.target.value);
    if (e.target.value) setErrorValidacion("");
  };

  //hook para obtener trabajadores por cargo
  const {
    trabajadoresPorCargo,
    loading: loadingTrabajadores,
    errorMessage: errorTrabajadores,
  } = useTrabajadoresPorCargo(fase?.siguienteCargoId);

  //hook para crear subproceso
  const crearSubprocesoMutation = useCrearSubproceso();

  async function handleConfirmar() {
    if (!trabajadorId) {
      setErrorValidacion(
        "Por favor, selecciona una referencia de trabajador para continuar.",
      );
      return;
    }

    // ✅ 1. Verifica qué estás enviando al backend
    console.log("📤 Payload enviado:", {
      cargoId: fase.siguienteCargoId,
      trabajadorId,
    });

    crearSubprocesoMutation.mutate(
      {
        cargoId: fase.siguienteCargoId,
        procesoId: proceso.id,
        trabajadorId: trabajadorId,
      },
      {
        onSuccess: (resultado) => {
          // ✅ 2. Verifica qué devuelve el backend
          console.log("✅ Resultado del backend:", resultado);

          if (!resultado) {
            setErrorValidacion("No se pudo crear el subproceso.");
            return;
          }
          const nombreTrabajador = trabajadoresPorCargo.find(
            (tra) => tra.id == trabajadorId,
          );
          onSuccess({
            tipo: "nuevaFase",
            codigo: proceso.codigoCofre,
            nombre: proceso.referenciaNombre,
            fase: fase.siguienteCargoNombre,
            nombreTrabajador: nombreTrabajador
              ? `${nombreTrabajador.nombre} ${nombreTrabajador.apellidos}`
              : "No asignado",
          });
          onClose();
        },
        onError: (err) => {
          console.error("❌ Error completo:", err);

          const mensaje =
            err?.response?.data?.message ||
            err?.message || // supabase / throw new Error
            err?.error_description || // algunos casos de supabase
            "Ocurrió un error inesperado en el sistema.";

          const status = err?.status || err?.response?.status || "Sin status";

          console.error("❌ Mensaje final:", mensaje);
          console.error("❌ Status:", status);

          setErrorValidacion(mensaje);
        },
      },
    );
  }
  const isPending = crearSubprocesoMutation.isPending;

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
          disabled={isPending}
          className={errorValidacion ? "input-error" : ""}
          style={{ borderColor: errorValidacion ? "red" : "" }}
        >
          <option value="">Seleccione un trabajador</option>
          {trabajadoresPorCargo.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nombre} {t.apellidos}
            </option>
          ))}
        </select>
        {errorValidacion && (
          <span style={{ color: "red", fontSize: "18px", marginTop: "4px" }}>
            {errorValidacion}
          </span>
        )}
      </>
    );
  };

  return (
    <Modal
      isOpen={true}
      title={`Iniciar fase ${fase.siguienteFaseOrden} - ${fase.siguienteCargoNombre}`}
      confirmText="Iniciar fase"
      onConfirm={handleConfirmar}
      onClose={onClose}
      disabled={isPending}
    >
      <p>
        Proceso: <strong>{proceso.codigoCofre}</strong>
      </p>
      <p>
        Fase: <strong>{fase.siguienteCargoNombre}</strong>
      </p>
      <label htmlFor="referencia-select-trabajador">Trabajador asignado</label>
      {renderTrabajadoresContent()}
    </Modal>
  );
}
CrearSubproceso.propTypes = {
  contexto: PropTypes.shape({
    proceso: PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      codigoCofre: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
        .isRequired,
      referenciaNombre: PropTypes.string.isRequired,
    }).isRequired,
    fase: PropTypes.shape({
      siguienteCargoId: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
      ]).isRequired,
      siguienteFaseOrden: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
      ]).isRequired,
      siguienteCargoNombre: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
      ]).isRequired,
    }).isRequired,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};
