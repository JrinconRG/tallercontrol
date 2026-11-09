import { useState } from "react";
import Modal from "../../../../components/modal/Modal";
import Select from "../../../../components/ui/select";
import CofreResumen from "./CofreResumen";
import FaseResumen from "./FaseResumen";
import { obtenerIniciales } from "../../../../utils/ObtenerIniciales";

import { useTrabajadoresPorCargo } from "../../../Trabajadores/application/hooks/useTrabajadoresPorCargo";
import { useCrearSubproceso } from "../../../subProcesos/application/hooks/useCrearSubProceso";
import PropTypes from "prop-types";
import { useToast } from "../../../../hooks/useToast";
import { getAppErrorMessage } from "../../../../shared/errors/getAppErrorMessage";

export default function CrearSubproceso({ contexto, onClose, onSuccess }) {
  const [trabajadorId, setTrabajadorId] = useState("");
  const { proceso, fase } = contexto;
  const [errorValidacion, setErrorValidacion] = useState("");
  const { showError } = useToast();
  console.log("proceso", proceso);

  // El Select compartido entrega el valor directamente (no un evento)
  const handleTrabajadorChange = (valor) => {
    setTrabajadorId(valor);
    if (valor) setErrorValidacion("");
  };

  //hook para obtener trabajadores por cargo y precio vigente
  const {
    trabajadoresPorCargo,
    loading: loadingTrabajadores,
    errorMessage: errorTrabajadores,
  } = useTrabajadoresPorCargo(fase?.siguienteCargoId, proceso?.referenciaId);

  const opcionesTrabajadores = (trabajadoresPorCargo ?? []).map((t) => {
    const nombreCompleto = `${t.nombre} ${t.apellidos}`.trim();
    return {
      value: t.id,
      label: nombreCompleto,
      iniciales: obtenerIniciales(nombreCompleto),
    };
  });
  const trabajadorValido = opcionesTrabajadores.some(
    (t) => t.value === trabajadorId,
  );

  //hook para crear subproceso
  const crearSubprocesoMutation = useCrearSubproceso();

  async function handleConfirmar() {
    // El botón ya está deshabilitado sin trabajador; esto es solo respaldo
    if (!trabajadorId) return;
    if (!trabajadorValido) return;

    crearSubprocesoMutation.mutate(
      {
        cargoId: fase.siguienteCargoId,
        procesoId: proceso.id,
        trabajadorId: trabajadorId,
      },
      {
        onSuccess: (resultado) => {
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
          showError("No se pudo iniciar la fase", getAppErrorMessage(err), {
            size: "large",
          });
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
    if (opcionesTrabajadores.length === 0) {
      return (
        <p>
          Ningún trabajador tiene precio vigente para{" "}
          <strong>{fase.siguienteCargoNombre}</strong> en la referencia{" "}
          <strong>{proceso.referenciaNombre}</strong>. Revisa la configuración
          de precios.
        </p>
      );
    }
    return (
      <>
        <Select
          id="referencia-select-trabajador"
          size="lg"
          value={trabajadorId}
          onChange={handleTrabajadorChange}
          placeholder="Selecciona un trabajador"
          options={opcionesTrabajadores}
        />
        {errorValidacion && (
          <span
            style={{
              color: "red",
              fontSize: "var(--font-subtitle)",
              marginTop: "4px",
            }}
          >
            {errorValidacion}
          </span>
        )}
      </>
    );
  };

  return (
    <Modal
      isOpen={true}
      title={`Iniciar ${fase.siguienteCargoNombre}`}
      subtitle={`Fase ${fase.siguienteFaseOrden}`}
      confirmText="Iniciar fase"
      onConfirm={handleConfirmar}
      onClose={onClose}
      loading={isPending}
      disableConfirm={!trabajadorValido}
    >
      <CofreResumen
        codigo={proceso.codigoCofre}
        color={proceso.color}
        colorHex={proceso.colorHex}
        referencia={proceso.referenciaNombre}
        referenciaCodigo={proceso.referenciaCodigoNombre}
      />

      <FaseResumen nombre={String(fase.siguienteCargoNombre)} />

      <div className="form-group">
        <label htmlFor="referencia-select-trabajador">
          Trabajador asignado
        </label>
        {renderTrabajadoresContent()}
      </div>
    </Modal>
  );
}
CrearSubproceso.propTypes = {
  contexto: PropTypes.shape({
    proceso: PropTypes.shape({
      referenciaId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
        .isRequired,
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      codigoCofre: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
        .isRequired,
      referenciaNombre: PropTypes.string.isRequired,
      referenciaCodigoNombre: PropTypes.string,
      color: PropTypes.string,
      colorHex: PropTypes.string,
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
