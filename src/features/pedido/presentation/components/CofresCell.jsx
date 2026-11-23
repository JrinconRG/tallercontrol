import "./CofresCell.css";

export function CofresCell({ cofres = [] }) {
  if (!cofres.length) {
    return <span style={{ color: "var(--neutral-500)" }}>Sin cofres</span>;
  }

  const agrupados = cofres.reduce((acc, c) => {
    const ref = c.referenciaNombre || "Sin referencia";
    acc[ref] = (acc[ref] || 0) + 1;
    return acc;
  }, {});

  const resumen = Object.entries(agrupados);

  return (
    <div
      style={{
        display: "flex",
        gap: "6px",
        flexWrap: "wrap",
        alignItems: "center",
      }}
    >
      {resumen.slice(0, 2).map(([ref, cant]) => (
        <span key={ref} className="badge-cofre">
          {cant}x {ref}
        </span>
      ))}

      {resumen.length > 2 && (
        <span className="badge-cofre-more">+{resumen.length - 2} tipos</span>
      )}
    </div>
  );
}
