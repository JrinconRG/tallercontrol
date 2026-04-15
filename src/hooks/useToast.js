import { useState, useCallback } from "react";

const removeToast = (prev, id) => prev.filter((t) => t.id !== id);

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback(
    ({ message, type = "success", duration = 3000 }) => {
      const id = Date.now();
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => removeToast(prev, id));
      }, duration);
    },
    [],
  );

  return { toasts, showToast };
}
