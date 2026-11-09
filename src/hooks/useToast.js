import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import PropTypes from "prop-types";
import Toast from "../components/Toast/Toast";

const ToastContext = createContext(null);
// ── Duraciones (ms) ──
const DURACION_NORMAL = 6000; // escritorio
const DURACION_TABLET = 9000; // size: "large" → flujos del trabajador en tablet
// Los errores NO se cierran solos: el trabajador debe poder leerlos con calma.
const MAX_VISIBLES = 3;
// duration: undefined → automática · null o negativo → no se cierra solo
function resolverDuracion({ type, size, duration }) {
  if (duration !== undefined) {
    return duration === null || duration < 0 ? null : duration;
  }
  if (type === "error") return null;
  return size === "large" ? DURACION_TABLET : DURACION_NORMAL;
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const dismissToast = useCallback(
    (id) => setToasts((current) => current.filter((toast) => toast.id !== id)),
    [],
  );

  const showToast = useCallback(
    ({ title, message, type = "success", size = "default", duration }) => {
      const id = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
      const nuevo = {
        id,
        title,
        message,
        type,
        size,
        duration: resolverDuracion({ type, size, duration }),
      };
      setToasts((current) => {
        // Evita duplicados por doble toque: mismo tipo, título y mensaje
        const repetido = current.some(
          (t) => t.type === type && t.title === title && t.message === message,
        );
        if (repetido) return current;
        // Máximo 3 a la vez: si llega uno más, sale el más antiguo
        return [...current, nuevo].slice(-MAX_VISIBLES);
      });
      return id;
    },
    [],
  );
  // `options` es opcional: { size: "large", duration: 12000 }
  const showSuccess = useCallback(
    (title, message, options) =>
      showToast({ title, message, type: "success", ...options }),
    [showToast],
  );
  const showError = useCallback(
    (title, message, options) =>
      showToast({ title, message, type: "error", ...options }),
    [showToast],
  );
  const showInfo = useCallback(
    (title, message, options) =>
      showToast({ title, message, type: "info", ...options }),
    [showToast],
  );
  const value = useMemo(
    () => ({ showToast, showSuccess, showError, showInfo, dismissToast }),
    [showToast, showSuccess, showError, showInfo, dismissToast],
  );

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
  if (!context)
    throw new Error("useToast debe usarse dentro de ToastProvider.");
  return context;
}
