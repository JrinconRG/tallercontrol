export default function Toast({ toasts }) {
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
      }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          style={{
            padding: "12px 18px",
            borderRadius: "var(--radius-md)",
            fontSize: "14px",
            fontWeight: "500",
            boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
            animation: "slideIn 0.2s ease",
            backgroundColor: t.type === "success" ? "#f0faf5" : "#fff0f0",
            border: `1px solid ${t.type === "success" ? "#6fcf97" : "#ffb3b3"}`,
            color: t.type === "success" ? "#1a7a4a" : "#cc0000",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span style={{ fontSize: "16px" }}>
            {t.type === "success" ? "✓" : "✕"}
          </span>
          {t.message}
        </div>
      ))}
    </div>
  );
}
