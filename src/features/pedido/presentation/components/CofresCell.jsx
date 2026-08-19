import { useState } from "react";

export function CofresCell({ cofres = [] }) {
  const [modalAbierto, setModalAbierto] = useState(false);

  if (!cofres.length) {
    return <span style={{ color: "var(--neutral-500)" }}>Sin cofres</span>;
  }

  // Agrupar cofres por el nombre de la referencia para mostrar un resumen limpio
  const agrupados = cofres.reduce((acc, c) => {
    const ref = c.referenciaNombre || "Sin referencia";
    acc[ref] = (acc[ref] || 0) + 1;
    return acc;
  }, {});

  const resumenReferencias = Object.entries(agrupados);

  return (
    <div>
      {/* Vista resumida en Badges */}
      <div
        style={{
          display: "flex",
          gap: "6px",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        {resumenReferencias.slice(0, 2).map(([ref, cant]) => (
          <span key={ref} className="badge-cofre">
            <strong>{cant}x</strong> {ref}
          </span>
        ))}

        {resumenReferencias.length > 2 && (
          <span className="badge-cofre-more">
            +{resumenReferencias.length - 2} tipos
          </span>
        )}

        <button
          type="button"
          className="btn-ver-detalle"
          onClick={() => setModalAbierto(true)}
        >
          Ver todos ({cofres.length})
        </button>
      </div>

      {/* Modal / Diálogo de detalle cuando hay más de 10-20 cofres */}
      {modalAbierto && (
        <div className="modal-overlay" onClick={() => setModalAbierto(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Detalle de Cofres en Pedido</h3>
              <button
                onClick={() => setModalAbierto(false)}
                className="btn-close"
              >
                ×
              </button>
            </div>

            <div className="modal-body-cofres">
              <div className="cofres-grid">
                {cofres.map((item, idx) => (
                  <div key={item.procesoId || idx} className="cofre-card-item">
                    <span className="cofre-codigo">{item.codigoCofre}</span>
                    <span className="cofre-ref">{item.referenciaNombre}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
