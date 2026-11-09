import "./Modal.css";
import { useId } from "react";
import PropTypes from "prop-types";

export default function Modal({
  isOpen,
  title,
  subtitle,
  children,
  onClose,
  onConfirm,
  confirmText = null,
  cancelText = "Cancelar",
  loading = false,
  disableConfirm = false,
  className = "",
  style = {},
  borderColor,
}) {
  const tituloId = useId();
  if (!isOpen) return null;

  return (
    <div
      className={`modal-overlay ${className}`}
      style={{
        border: borderColor
          ? `2px solid ${borderColor}`
          : `2px solid var(--neutral-400)`,
        ...style,
      }}
    >
      <dialog
        open
        className="modal-container"
        aria-modal="true"
        aria-labelledby={tituloId}
      >
        <header className="modal-header">
          <div className="modal-header-texto">
            <h3 id={tituloId}>{title}</h3>
            {subtitle && <p className="modal-subtitle">{subtitle}</p>}
          </div>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </header>

        <section className="modal-body">
          <div className="modal-body-content">{children}</div>
        </section>

        <footer className="modal-footer">
          {/* Con confirmar: Cancelar es secundario. Sin confirmar, el único
              botón (cerrar) pasa a ser el principal. */}
          <button
            type="button"
            className={`btn ${onConfirm ? "btn-terciary" : "btn-primary"}`}
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </button>

          {/* Solo mostramos el botón de confirmar si pasamos la prop onConfirm */}
          {onConfirm && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={onConfirm}
              disabled={loading || disableConfirm}
            >
              {loading ? "Procesando..." : confirmText}
            </button>
          )}
        </footer>
      </dialog>
    </div>
  );
}

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  children: PropTypes.node,
  onClose: PropTypes.func,
  onConfirm: PropTypes.func,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  loading: PropTypes.bool,
  disableConfirm: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.object,
  borderColor: PropTypes.string,
};
