import { useState } from "react";
import { useDesignarCargos } from "../../../../features/Trabajadores/application/hooks/useDesignarCargo";
import "./EliminarFase.css";
import PropTypes from "prop-types";

export default function EliminarFase({ cargo, trabajadorId, colors, onToast }) {
  const [confirmando, setConfirmando] = useState(false);
  const designarCargoMutation = useDesignarCargos();

  async function handleEliminar() {
    designarCargoMutation.mutate(
      { cargoId: cargo.id, trabajadorId: trabajadorId },
      {
        onSuccess: () => {
          onToast({ message: `Fase "${cargo.nombre}" eliminada` });
          setConfirmando(false);
        },
        onError: (error) => {
          onToast({
            message: error.message || `Error eliminando ${cargo.nombre}`,
          });
        },
      },
    );
    setConfirmando(false);
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
        <span style={{ fontSize: "12px" }}>¿Eliminar {cargo.nombre}?</span>

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
  onToast: PropTypes.func,
};
