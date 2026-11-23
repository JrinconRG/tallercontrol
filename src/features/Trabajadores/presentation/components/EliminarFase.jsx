import { useState } from "react";
import { useDesignarCargos } from "../../application/hooks/useDesignarCargo";
import "./EliminarFase.css";
import PropTypes from "prop-types";
import { useToast } from "../../../../hooks/useToast";
import { getAppErrorMessage } from "../../../../shared/errors/getAppErrorMessage";

export default function EliminarFase({ cargo, trabajadorId, colors }) {
  const [confirmando, setConfirmando] = useState(false);
  const designarCargoMutation = useDesignarCargos();
  const { showSuccess, showError } = useToast();

  // mutateAsync + try/catch en vez de callbacks en mutate(): cuando la lista
  // se refresca, este chip desaparece y los callbacks de mutate() pueden no
  // ejecutarse (el toast no saldría). Así el aviso siempre se muestra.
  async function handleEliminar() {
    try {
      await designarCargoMutation.mutateAsync({
        cargoId: cargo.id,
        trabajadorId: trabajadorId,
      });
      showSuccess("Fase eliminada", `Se quitó ${cargo.nombre} del empleado.`);
    } catch (error) {
      showError("No se pudo eliminar la fase", getAppErrorMessage(error));
    } finally {
      setConfirmando(false);
    }
  }

  // Modo confirmacion
  if (confirmando) {
    return (
      <div
        className="cargo-chip cargo-chip--confirming"
        style={{
          backgroundColor: "#fff0f0",
          border: "1px solid #ffb3b3",
          color: "#cc0000",
          gap: "6px",
        }}
      >
        <span style={{ fontSize: "var(--font-small)" }}>
          ¿Eliminar {cargo.nombre}?
        </span>

        <button
          className="chip-confirm-btn chip-confirm-btn--yes"
          onClick={handleEliminar}
          disabled={designarCargoMutation.isPending}
          aria-label="Confirmar eliminación"
        >
          {designarCargoMutation.isPending ? "..." : "Sí"}
        </button>

        <button
          className="chip-confirm-btn chip-confirm-btn--no"
          onClick={() => setConfirmando(false)}
          disabled={designarCargoMutation.isPending}
          aria-label="Cancelar"
        >
          No
        </button>
      </div>
    );
  }

  // Modo normal
  return (
    <div
      className="cargo-chip"
      style={{
        backgroundColor: colors.bg,
        border: `1px solid ${colors.border}`,
        color: colors.text,
      }}
    >
      {cargo.nombre}
      <button
        style={{
          backgroundColor: "transparent",
          border: "none",
          color: colors.text,
          cursor: "pointer",
          padding: "0 4px",
          fontWeight: "bold",
          fontSize: "var(--font-small)",
          opacity: 0.7,
        }}
        onClick={() => setConfirmando(true)}
        aria-label={`Eliminar fase ${cargo.nombre}`}
      >
        ×
      </button>
    </div>
  );
}

EliminarFase.propTypes = {
  cargo: PropTypes.object,
  trabajadorId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  colors: PropTypes.object,
};
