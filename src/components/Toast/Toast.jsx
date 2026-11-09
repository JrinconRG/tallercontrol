// src/components/Toast/Toast.jsx
import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import "./Toast.css";

const CHECK = <path d="M5 12.5l4.5 4.5L19 7.5" />;

// Un glifo por tipo (se dibuja en blanco dentro del círculo de color)
const ICONOS = {
  success: CHECK,
  completed: CHECK,
  error: (
    <>
      <path d="M12 6.5v7" />
      <path d="M12 17.5h.01" />
    </>
  ),
  info: (
    <>
      <path d="M12 11v6" />
      <path d="M12 7.5h.01" />
    </>
  ),
  created: <path d="M12 5v14M5 12h14" />,
  started: <path d="M5 12h14M13 6l6 6-6 6" />,
};

function ToastItem({ toast, onDismiss }) {
  const { id, type, title, message, size, duration } = toast;
  const tipo = ICONOS[type] ? type : "info";
  const seCierraSolo = Number.isFinite(duration);

  // Con el dedo o el mouse encima (o el foco en la X), el tiempo se pausa
  const [pausado, setPausado] = useState(false);
  const restante = useRef(duration);

  useEffect(() => {
    if (!seCierraSolo || pausado) return undefined;
    const inicio = Date.now();
    const timer = setTimeout(() => onDismiss(id), restante.current);
    return () => {
      clearTimeout(timer);
      restante.current -= Date.now() - inicio;
    };
  }, [pausado, seCierraSolo, id, onDismiss]);

  return (
    <output
      className={`toast toast--${tipo} toast--${size}`}
      role={tipo === "error" ? "alert" : "status"}
      onPointerEnter={() => setPausado(true)}
      onPointerLeave={() => setPausado(false)}
      onFocus={() => setPausado(true)}
      onBlur={() => setPausado(false)}
    >
      <span className="toast-icon" aria-hidden="true">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {ICONOS[tipo]}
        </svg>
      </span>

      <div className="toast-body">
        {title && <strong className="toast-title">{title}</strong>}
        {message && <p className="toast-message">{message}</p>}
      </div>

      <button
        type="button"
        className="toast-close"
        aria-label="Cerrar notificación"
        onClick={() => onDismiss(id)}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>

      {seCierraSolo && (
        <span className="toast-timer" aria-hidden="true">
          <span
            className="toast-timer-bar"
            style={{
              animationDuration: `${duration}ms`,
              animationPlayState: pausado ? "paused" : "running",
            }}
          />
        </span>
      )}
    </output>
  );
}

export default function Toast({ toasts, onDismiss }) {
  if (!toasts.length) return null;

  return (
    <div className="toast-stack">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

const toastShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  type: PropTypes.string,
  title: PropTypes.string,
  message: PropTypes.string,
  size: PropTypes.string,
  // null = no se cierra solo
  duration: PropTypes.number,
});

ToastItem.propTypes = {
  toast: toastShape.isRequired,
  onDismiss: PropTypes.func.isRequired,
};

Toast.propTypes = {
  toasts: PropTypes.arrayOf(toastShape).isRequired,
  onDismiss: PropTypes.func.isRequired,
};
