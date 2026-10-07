import { useState } from "react";
import ColorBadge from "../../../../components/colorBadge/ColorBadge"; // ajusta la ruta a donde esté tu componente
import "./CofresCell.css";

// col_hex puede estar guardado con o sin "#"; ColorBadge lo necesita con "#".
const normalizarHex = (hex) => {
  if (!hex) return undefined;
  return hex.startsWith("#") ? hex : `#${hex}`;
};

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
              <div className="cofres-cell-grid">
                {cofres.map((item, idx) => (
                  <div key={item.procesoId || idx} className="cofres-cell-item">
                    <div className="cofres-cell-item-top">
                      <span className="cofres-cell-codigo">
                        {item.codigoCofre}
                      </span>
                      {item.colorNombre ? (
                        <ColorBadge
                          color={item.colorNombre}
                          colorHex={normalizarHex(item.colorHex)}
                        />
                      ) : (
                        <span className="cofres-cell-sin-color">Sin color</span>
                      )}
                    </div>
                    <span className="cofres-cell-ref">
                      {item.referenciaNombre || "Sin referencia"}
                    </span>
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
