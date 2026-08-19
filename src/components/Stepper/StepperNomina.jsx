import "./StepperNomina.css";
import PropTypes from "prop-types";
import { Icon } from "../ui/Icon";

const PASOS = [
  { numero: 1, label: "Selección de fecha" },
  { numero: 2, label: "Detalle de nómina" },
  { numero: 3, label: "Exportar" },
];

function getEstado(pasoActual, numero) {
  if (pasoActual > numero) return "finalizado";
  if (pasoActual === numero) return "en_proceso";
  return "pendiente";
}

export default function StepperNomina({ pasoActual = 1, onSelectPaso }) {
  return (
    <div className="sfn-stepper">
      <div className="sfn-track" aria-hidden="true">
        {PASOS.slice(0, -1).map((paso, i) => {
          const segmentoDone = pasoActual > i + 1;
          const segmentoActive = pasoActual === i + 1;
          return (
            <div
              key={paso.numero}
              className={[
                "sfn-track-segment",
                segmentoDone ? "sfn-track-segment--done" : "",
                segmentoActive ? "sfn-track-segment--active" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            />
          );
        })}
      </div>

      {/* Pasos */}
      {PASOS.map((paso) => {
        const esActivo = pasoActual === paso.numero;

        // REGLA: Solo es clickeable si es un paso anterior al actual (no el actual, no los futuros)
        const esClickeable = paso.numero < pasoActual;

        const estado = getEstado(pasoActual, paso.numero);

        return (
          <div key={paso.numero} className="sfn-step">
            {/* Contenedor wrapper para el botón. Esto evita que el botón grande empuje el texto hacia abajo */}
            <div className="sfn-btn-wrapper">
              <button
                type="button"
                className={[
                  "sfn-btn",
                  `sfn-btn--${estado}`,
                  esActivo ? "sfn-btn--selected" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => esClickeable && onSelectPaso?.(paso.numero)}
                disabled={!esClickeable}
                aria-label={paso.label}
                aria-current={esActivo ? "step" : undefined}
              >
                {estado === "finalizado" ? (
                  <Icon name="Check" size="20" color="currentColor" />
                ) : (
                  paso.numero
                )}
              </button>
            </div>

            <div className="sfn-meta">
              <span className="sfn-num">Paso {paso.numero}</span>
              <span className="sfn-name">{paso.label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

StepperNomina.propTypes = {
  pasoActual: PropTypes.oneOf([1, 2, 3]),
  onSelectPaso: PropTypes.func,
};
