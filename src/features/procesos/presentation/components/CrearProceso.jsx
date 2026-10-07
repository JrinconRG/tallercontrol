import { useState } from "react";
import Modal from "../../../../components/modal/Modal";
import { useObtenerReferenciasCofres } from "../../../cofres/application/hook/useObtenerReferenciasCofres";
import { useCrearProceso } from "../../application/hooks/useCrearProceso";
import { useGetColores } from "../../application/hooks/useGetColores";
import PropTypes from "prop-types";
import { useToast } from "../../../../hooks/useToast";
import { getAppErrorMessage } from "../../../../shared/errors/getAppErrorMessage";
import Select from "../../../../components/ui/select";

export default function CrearProceso({ onClose, onSuccess }) {
  const [referenciaId, setReferenciaId] = useState("");
  const [colorId, setColorId] = useState("");
  const [validacionError, setValidacionError] = useState("");
  const [validacionErrorColor, setValidacionErrorColor] = useState("");
  const { showError } = useToast();

  const { referencias, loading: loadingRefs } = useObtenerReferenciasCofres();
  const { colores, loading: loadingColores } = useGetColores();

  const { mutate: ejecutarCrearProceso, isPending: isCreating } =
    useCrearProceso();

  function handleReferenciaChange(val) {
    setReferenciaId(val);
    if (val) setValidacionError("");
  }

  function handleColorChange(val) {
    setColorId(val);
    if (val) setValidacionErrorColor("");
  }

  async function handleConfirmar() {
    let hayError = false;

    if (!referenciaId) {
      setValidacionError(
        "Por favor, selecciona una referencia de cofre para continuar.",
      );
      hayError = true;
    }

    if (!colorId) {
      setValidacionErrorColor("Por favor, selecciona un color para el cofre.");
      hayError = true;
    }

    if (hayError) return;

    if (!navigator.onLine) {
      setValidacionError("No hay conexión a internet.");
      return;
    }

    ejecutarCrearProceso(
      { referenciaId, colorId },
      {
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
        onError: (error) => {
          showError("No se pudo crear el proceso", getAppErrorMessage(error));
        },
      },
    );
  }

  const cargando = loadingRefs || loadingColores;

  return (
    <Modal
      data-cy="modal-crear-proceso"
      isOpen
      title="Crear proceso"
      confirmText={isCreating ? "Creando..." : "Crear Proceso"}
      onConfirm={handleConfirmar}
      onClose={onClose}
      disableConfirm={isCreating || cargando}
    >
      {cargando ? (
        <p>Cargando datos...</p>
      ) : (
        <>
          <label htmlFor="referencia-select">Referencia de cofre</label>
          <Select
            id="referencia-select"
            value={referenciaId}
            onChange={handleReferenciaChange}
            placeholder="Seleccione una referencia"
            options={referencias.map((ref) => ({
              value: ref.id,
              label: `${ref.nombre}(${ref.codigo})`,
            }))}
          />

          {validacionError && (
            <p
              style={{
                color: "red",
                fontSize: "var(--font-small)",
                marginTop: "4px",
              }}
            >
              {validacionError}
            </p>
          )}

          <label
            htmlFor="color-select"
            style={{ marginTop: "12px", display: "block" }}
          >
            Color del cofre
          </label>
          <Select
            id="color-select"
            value={colorId}
            onChange={handleColorChange}
            placeholder="Seleccione un color"
            options={colores.map((color) => ({
              value: color.id,
              label: color.nombre,
              color: color.hex,
            }))}
          />

          {validacionErrorColor && (
            <p
              style={{
                color: "red",
                fontSize: "var(--font-small)",
                marginTop: "4px",
              }}
            >
              {validacionErrorColor}
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
