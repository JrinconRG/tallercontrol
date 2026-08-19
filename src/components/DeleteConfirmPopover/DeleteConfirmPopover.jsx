import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import "./DeleteConfirmPopover.css";

export default function DeleteConfirmPopover({
  open,
  nombreItem,
  confirmText = "Eliminar",
  cancelText = "Cancelar",
  loading = false,
  coords,
  onConfirm,
  onCancel,
}) {
  const popoverRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        onCancel();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, onCancel]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onCancel();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onCancel]);

  useEffect(() => {
    if (!open) return;

    const handleReposition = () => onCancel();

    window.addEventListener("scroll", handleReposition, true);
    window.addEventListener("resize", handleReposition);
    return () => {
      window.removeEventListener("scroll", handleReposition, true);
      window.removeEventListener("resize", handleReposition);
    };
  }, [open, onCancel]);

  if (!open || !coords) return null;

  return createPortal(
    <div
      className="delete-popover-portal"
      ref={popoverRef}
      role="alertdialog"
      aria-modal="true"
      style={{
        position: "fixed",
        top: `${coords.top}px`,
        left: `${coords.left}px`,
        zIndex: 9999,
      }}
    >
      <p className="delete-popover-message">
        ¿Eliminar{" "}
        <strong className="delete-item-highlight">"{nombreItem}"</strong>?
      </p>

      <div className="delete-popover-actions">
        <button
          type="button"
          className="btn-popover btn-popover-secondary"
          onClick={onCancel}
          disabled={loading}
        >
          {cancelText}
        </button>
        <button
          type="button"
          className="btn-popover btn-popover-danger"
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? "Eliminando..." : confirmText}
        </button>
      </div>
    </div>,
    document.body,
  );
}
