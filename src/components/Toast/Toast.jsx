import PropTypes from "prop-types";

const palettes = {
  success: { background: "#f0faf5", border: "#6fcf97", color: "#1a7a4a" },
  error: { background: "#fff0f0", border: "#ffb3b3", color: "#cc0000" },
  info: { background: "#eff6ff", border: "#93c5fd", color: "#1d4ed8" },
  created: { background: "#f5f3ff", border: "#c4b5fd", color: "#6d28d9" },
  started: { background: "#eff6ff", border: "#60a5fa", color: "#1d4ed8" },
  completed: { background: "#ecfdf5", border: "#34d399", color: "#047857" },
};

const actionIcons = { created: "+", started: "→", completed: "✓" };

export default function Toast({ toasts, onDismiss }) {
  if (!toasts.length) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        maxWidth: "min(400px, calc(100vw - 40px))",
      }}
    >
      {toasts.map((t) => {
        const palette = palettes[t.type] ?? palettes.info;
        const isLarge = t.size === "large";
        return (
          <div
            key={t.id}
            style={{
              padding: isLarge ? "24px 28px" : "12px 18px",
              borderRadius: "var(--radius-md)",
              fontSize: isLarge ? "var(--font-heading)" : "var(--font-small)",
              fontWeight: "500",
              boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
              animation: "slideIn 0.2s ease",
              backgroundColor: palette.background,
              border: `1px solid ${palette.border}`,
              color: palette.color,
              display: "flex",
              alignItems: "center",
              gap: isLarge ? "22px" : "8px",
            }}
          >
            <span
              style={{
                fontSize: isLarge ? "var(--font-display)" : "var(--font-body)",
                display: actionIcons[t.type] ? "none" : undefined,
              }}
            >
              {t.type === "success" ? "✓" : "✕"}
            </span>
            {actionIcons[t.type] && (
              <span
                aria-hidden="true"
                style={{ fontSize: isLarge ? "var(--font-display)" : "var(--font-title)", fontWeight: 700 }}
              >
                {actionIcons[t.type]}
              </span>
            )}
            <div style={{ flex: 1 }}>
              {t.title && (
                <strong
                  style={{
                    display: "block",
                    fontSize: isLarge ? "var(--font-heading)" : undefined,
                    marginBottom: isLarge ? "4px" : 0,
                  }}
                >
                  {t.title}
                </strong>
              )}
              {t.message}
            </div>
            <button
              type="button"
              aria-label="Cerrar notificación"
              onClick={() => onDismiss(t.id)}
              style={{
                border: 0,
                background: "transparent",
                color: "inherit",
                cursor: "pointer",
                fontSize: "var(--font-title)",
                lineHeight: 1,
                padding: 0,
              }}
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}

Toast.propTypes = {
  toasts: PropTypes.arrayOf(PropTypes.object).isRequired,
  onDismiss: PropTypes.func.isRequired,
};
