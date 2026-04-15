import "./Stepper.css";
import PropTypes from "prop-types";

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
    <div className="sf-stepper">
      <div className="sf-track" aria-hidden="true">
        {PASOS.slice(0, -1).map((paso, i) => {
          const segmentoDone = pasoActual > i + 1;
          const segmentoActive = pasoActual === i + 1;
          return (
            <div
              key={paso.numero}
              className={[
                "sf-track-segment",
                segmentoDone ? "sf-track-segment--done" : "",
                segmentoActive ? "sf-track-segment--active" : "",
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

        // Solo puede navegar a pasos anteriores o el actual
        const esClickeable = paso.numero <= pasoActual;

        const estado = getEstado(pasoActual, paso.numero);

        return (
          <div key={paso.numero} className="sf-step">
            <button
              type="button"
              className={[
                "sf-btn",
                `sf-btn--${estado}`,
                esActivo ? "sf-btn--selected" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => esClickeable && onSelectPaso?.(paso.numero)}
              disabled={!esClickeable}
              aria-label={paso.label}
              aria-current={esActivo ? "step" : undefined}
            >
              {paso.numero}
            </button>

            <div className="sf-meta">
              <span className="sf-num">Paso {paso.numero}</span>
              <span className="sf-name">{paso.label}</span>
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
