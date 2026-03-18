import './Modal.css'

export default function Modal({
  isOpen,
  title,
  children,
  onClose,
  onConfirm,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  loading = false,
  className = "",
  style = {},
  borderColor
}) {
  if (!isOpen) return null

  return (
    <div className={`modal-overlay ${className}`}
      style={{
        border: borderColor ? `2px solid ${borderColor}` : `2px solid var(--neutral-400)`,
        ...style
      }} >
      <div className="modal-container">
        <header className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </header>

        <section className="modal-body">
          <div className="modal-body-content">
            {children}
          </div>
        </section>

        <footer className="modal-footer">
          <button
            className="btn btn-primary"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </button>

          <button
            className="btn btn-secondary"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Procesando...' : confirmText}
          </button>
        </footer>
      </div>
    </div >
  )
}
