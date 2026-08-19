import "./Stepper.css";
import PropTypes from "prop-types";
import { Icon } from "../../components/ui/Icon";

const ESTADO_LABEL = {
  finalizado: "Completado",
  en_proceso: "En progreso",
  pendiente: "Pendiente",
};

export default function Stepper({ fases = [], selectedId, onSelectFase }) {
  const sorted = [...fases].sort(
    (a, b) => (a.ordenProceso ?? 0) - (b.ordenProceso ?? 0),
  );

  return (
    <div className="sf-stepper">
      <div className="sf-track" aria-hidden="true">
        {sorted.map((fase, i) => {
          if (i === sorted.length - 1) return null;
          const estado = fase.estado ?? "pendiente";
          return (
            <div
              key={fase.id ?? `segment-${i}`}
              className={[
                "sf-track-segment",
                estado === "finalizado" ? "sf-track-segment--done" : "",
                estado === "en_proceso" ? "sf-track-segment--active" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            />
          );
        })}
      </div>

      {sorted.map((fase, i) => {
        const id = fase.id ?? `fase-${i}`;
        const estado = fase.estado ?? "pendiente";
        const isSelected = String(selectedId) === String(id);

        return (
          <div key={id} className="sf-step">
            <button
              type="button"
              className={[
                "sf-btn",
                `sf-btn--${estado}`,
                isSelected ? "sf-btn--selected" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => onSelectFase?.(fase)}
              aria-label={`${fase.cargoNombre} - ${ESTADO_LABEL[estado] ?? estado}`}
              aria-pressed={isSelected}
            >
              {estado === "finalizado" && (
                <Icon name="CheckCircle2" size={18} />
              )}
              {estado === "en_proceso" && <Icon name="CircleDot" size={18} />}
              {estado === "pendiente" && <Icon name="Clock" size={18} />}
            </button>

            <div className="sf-meta">
              <span className="sf-num">Fase {fase.ordenProceso}</span>
              <span className="sf-name">{fase.cargoNombre}</span>
              <span className={`sf-status sf-status--${estado}`}>
                {ESTADO_LABEL[estado] ?? estado}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

Stepper.propTypes = {
  fases: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      cargoNombre: PropTypes.string,
      ordenProceso: PropTypes.number,
      estado: PropTypes.oneOf(["finalizado", "en_proceso", "pendiente"]),
    }),
  ),
  selectedId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onSelectFase: PropTypes.func,
};
