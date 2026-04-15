import "./Stepper.css";
import PropTypes from "prop-types";
import { Icon } from "../../components/ui/Icon"; // ajusta la ruta

const ESTADO_LABEL = {
  finalizado: "Completado",
  EN_PROCESO: "En progreso",
  en_proceso: "En progreso",
  pendiente: "Pendiente",
  PENDIENTE: "Pendiente",
  FINALIZADO: "Completado",
};

const normalize = (e = "") => e.toLowerCase();

export default function Stepper({ fases = [], selectedId, onSelectFase }) {
  const sorted = [...fases].sort(
    (a, b) =>
      (a.orden ?? a.c_orden_proceso ?? 0) - (b.orden ?? b.c_orden_proceso ?? 0),
  );

  return (
    <div className="sf-stepper">
      <div className="sf-track" aria-hidden="true">
        {sorted.map((fase, i) => {
          const id = fase.sub_id ?? fase.c_id ?? `segment-${i}`;
          if (i === sorted.length - 1) return null;
          const estado = normalize(fase.estado ?? "pendiente");
          return (
            <div
              key={`${id}`}
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
        const id = fase.sub_id ?? fase.c_id ?? `fase-${i}`;
        const nombre = fase.fase ?? fase.c_nombre;
        const orden = fase.orden ?? fase.c_orden_proceso;
        const estado = normalize(fase.estado ?? "pendiente");
        const isSelected = selectedId === id;

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
              aria-label={`${nombre} - ${ESTADO_LABEL[estado] ?? estado}`}
              aria-pressed={isSelected}
            >
              {estado === "finalizado" && (
                <Icon name="CheckCircle2" size={18} />
              )}
              {estado === "en_proceso" && <Icon name="CircleDot" size={18} />}
              {estado === "pendiente" && <Icon name="Clock" size={18} />}
            </button>

            <div className="sf-meta">
              <span className="sf-num">Fase {orden}</span>
              <span className="sf-name">{nombre}</span>
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
      sub_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      c_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      fase: PropTypes.string,
      c_nombre: PropTypes.string,
      orden: PropTypes.number,
      c_orden_proceso: PropTypes.number,
      estado: PropTypes.oneOf([
        "finalizado",
        "FINALIZADO",
        "en_proceso",
        "EN_PROCESO",
        "pendiente",
        "PENDIENTE",
      ]),
    }),
  ),
  selectedId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onSelectFase: PropTypes.func,
};
