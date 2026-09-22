import { createContext, createElement, useCallback, useContext, useMemo, useState } from "react";
import PropTypes from "prop-types";
import Toast from "../components/Toast/Toast";

const ToastContext = createContext(null);
const DEFAULT_DURATION = 4500;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const dismissToast = useCallback((id) => setToasts((current) => current.filter((toast) => toast.id !== id)), []);
  const showToast = useCallback(({ title, message, type = "success", size = "default", duration = DEFAULT_DURATION }) => {
    const id = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
    setToasts((current) => [...current, { id, title, message, type, size }]);
    if (duration >= 0) window.setTimeout(() => dismissToast(id), duration);
    return id;
  }, [dismissToast]);
  const value = useMemo(() => ({
    toasts,
    showToast,
    showSuccess: (title, message) => showToast({ title, message, type: "success" }),
    showError: (title, message) => showToast({ title, message, type: "error" }),
    showInfo: (title, message) => showToast({ title, message, type: "info" }),
    dismissToast,
  }), [dismissToast, showToast, toasts]);
  return createElement(
    ToastContext.Provider,
    { value },
    children,
    createElement(Toast, { toasts, onDismiss: dismissToast }),
  );
}

ToastProvider.propTypes = { children: PropTypes.node.isRequired };

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast debe usarse dentro de ToastProvider.");
  return context;
}
