import "./Modal.css";
import PropTypes from "prop-types";

export default function Modal({
  isOpen,
  title,
  children,
  onClose,
  onConfirm,
  confirmText = null,
  cancelText = "Cancelar",
  loading = false,
  className = "",
  style = {},
  borderColor,
}) {
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
      <div className="modal-container">
        <header className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </header>

        <section className="modal-body">
          <div className="modal-body-content">{children}</div>
        </section>

        <footer className="modal-footer">
          <button
            className="btn btn-primary"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </button>

          {/* Solo mostramos el botón de confirmar si pasamos la prop onConfirm */}
          {onConfirm && (
            <button
              className="btn btn-secondary"
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? "Procesando..." : confirmText}
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  title: PropTypes.string,
  children: PropTypes.node,
  onClose: PropTypes.func,
  onConfirm: PropTypes.func,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  loading: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.node,
  borderColor: PropTypes.string,
};
