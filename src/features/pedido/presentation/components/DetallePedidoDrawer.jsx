import { useState, useMemo, useEffect } from "react";
import ColorBadge from "../../../../components/colorBadge/ColorBadge";
import { formatFechaCorta } from "../../../../utils/formatearFechas";
import "./DetallePedidoDrawer.css";

const normalizarHex = (hex) => {
  if (!hex) return undefined;
  return hex.startsWith("#") ? hex : `#${hex}`;
};

const refDe = (c) => c.referenciaNombre || "Sin referencia";

// Agrupa por referencia y ordena de más a menos cofres
function agrupar(lista) {
  const mapa = new Map();
  lista.forEach((c) => {
    const ref = refDe(c);
    if (!mapa.has(ref)) mapa.set(ref, []);
    mapa.get(ref).push(c);
  });
  return [...mapa.entries()].sort((a, b) => b[1].length - a[1].length);
}

export default function DetallePedidoDrawer({ pedido, onClose }) {
  const cofres = pedido.cofres ?? [];
  const [search, setSearch] = useState("");

  // Pedido chico: todo abierto. Pedido grande: solo el grupo más numeroso.
  const [abiertos, setAbiertos] = useState(() => {
    const refs = agrupar(cofres).map(([ref]) => ref);
    return new Set(cofres.length <= 8 ? refs : refs.slice(0, 1));
  });

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    globalThis.addEventListener("keydown", onKey);
    return () => globalThis.removeEventListener("keydown", onKey);
  }, [onClose]);

  const grupos = useMemo(() => {
    const term = search.trim().toLowerCase();
    const filtrados = term
      ? cofres.filter((c) =>
          [c.codigoCofre, c.referenciaNombre, c.colorNombre].some((v) =>
            (v || "").toLowerCase().includes(term),
          ),
        )
      : cofres;
    return agrupar(filtrados);
  }, [cofres, search]);

  const totalReferencias = new Set(cofres.map(refDe)).size;
  const totalColores = new Set(cofres.map((c) => c.colorNombre).filter(Boolean))
    .size;

  const toggle = (ref) =>
    setAbiertos((prev) => {
      const next = new Set(prev);
      next.has(ref) ? next.delete(ref) : next.add(ref);
      return next;
    });

  return (
    <div className="drawer-overlay">
      <button
        className="drawer-backdrop"
        type="button"
        aria-label="Cerrar detalle"
        onClick={onClose}
      />
      <dialog className="drawer" open aria-modal="true">
        <div className="drawer-header">
          <div>
            <h3>Pedido N° {pedido.id}</h3>
            <span className="drawer-subtitle">
              {pedido.clienteNombre} · {formatFechaCorta(pedido.fecha)} ·{" "}
              {pedido.creadoPorNombre}
            </span>
          </div>
          <button
            className="btn btn-terciary"
            onClick={onClose}
            aria-label="Cerrar detalle"
          >
            ✖
          </button>
        </div>

        <div className="drawer-body">
          <div className="drawer-summary-grid">
            <div className="summary-card">
              <span className="summary-label">Cofres</span>
              <strong>{cofres.length}</strong>
            </div>
            <div className="summary-card">
              <span className="summary-label">Referencias</span>
              <strong>{totalReferencias}</strong>
            </div>
            <div className="summary-card">
              <span className="summary-label">Colores</span>
              <strong>{totalColores}</strong>
            </div>
          </div>

          <input
            type="search"
            className="pedido-buscar"
            placeholder="Buscar por código, referencia o color"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Buscar cofres en el pedido"
          />

          {grupos.length === 0 && (
            <p className="pedido-sin-resultados">
              No hay cofres que coincidan.
            </p>
          )}

          {grupos.map(([ref, items]) => {
            // Mientras se busca, todo queda abierto para ver las coincidencias
            const abierto = search.trim() ? true : abiertos.has(ref);
            return (
              <div key={ref} className="pedido-grupo">
                <button
                  type="button"
                  className="pedido-grupo-btn"
                  aria-expanded={abierto}
                  onClick={() => toggle(ref)}
                >
                  <span>
                    {ref}{" "}
                    <span className="pedido-grupo-cant">
                      · {items.length} cofres
                    </span>
                  </span>
                  <span aria-hidden="true">{abierto ? "▾" : "▸"}</span>
                </button>

                {abierto &&
                  items.map((item, idx) => (
                    <div
                      key={item.procesoId || idx}
                      className="pedido-cofre-row"
                    >
                      <span className="pedido-cofre-codigo">
                        {item.codigoCofre}
                      </span>
                      {item.colorNombre ? (
                        <ColorBadge
                          color={item.colorNombre}
                          colorHex={normalizarHex(item.colorHex)}
                        />
                      ) : (
                        <span className="text-muted">Sin color</span>
                      )}
                    </div>
                  ))}
              </div>
            );
          })}
        </div>
      </dialog>
    </div>
  );
}
