import { useState } from "react";
import { useEliminarCargoTrabajador } from "../../../../hooks/useCargoTrabajador";
import "./EliminarFase.css";
import PropTypes from "prop-types";

export default function EliminarFase({
  cargo,
  trabajadorId,
  colors,
  onSuccess,
}) {
  const [confirmando, setConfirmando] = useState(false);
  const { eliminarCargoTrabajadorHook, loading } = useEliminarCargoTrabajador();

  async function handleEliminar() {
    if (!cargo.id) {
      console.warn("Cargo inválido:", cargo);
      return;
    }
    try {
      await eliminarCargoTrabajadorHook(cargo.id, trabajadorId);
      onSuccess(cargo);
    } catch (err) {
      console.error("Error al eliminar fase:", err);
    } finally {
      setConfirmando(false);
    }
  }

  // Modo confirmación — reemplaza el chip normal
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
        <span style={{ fontSize: "12px" }}>¿Eliminar {cargo.nombre}?</span>

        <button
          className="chip-confirm-btn chip-confirm-btn--yes"
          onClick={handleEliminar}
          disabled={loading}
          aria-label="Confirmar eliminación"
        >
          {loading ? "..." : "Sí"}
        </button>

        <button
          className="chip-confirm-btn chip-confirm-btn--no"
          onClick={() => setConfirmando(false)}
          disabled={loading}
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
          fontSize: "14px",
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
  onSuccess: PropTypes.func,
};
