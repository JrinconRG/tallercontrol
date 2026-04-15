import { useState, useEffect, useRef } from "react";
import { useCrearCargoTrabajador } from "../../../../hooks/useCargoTrabajador";
import { obtenerCargos } from "../../../../services/cargos";
import PropTypes from "prop-types";

import "./AgregarFase.css";

export default function AgregarFase({
  trabajadorId,
  cargosAsignados,
  onSuccess,
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [cargos, setCargos] = useState([]);
  const [loadingCargos, setLoadingCargos] = useState(false);
  const [seleccionados, setSeleccionados] = useState([]);

  const popoverRef = useRef(null);

  const {
    crearCargoTrabajadorHook,
    loading: loadingCrear,
    error,
  } = useCrearCargoTrabajador();

  // 🔹 Cargar cargos
  useEffect(() => {
    async function cargarCargos() {
      try {
        setLoadingCargos(true);
        const data = await obtenerCargos();
        setCargos(data);
      } catch (err) {
        console.error("Error al cargar cargos:", err);
      } finally {
        setLoadingCargos(false);
      }
    }
    cargarCargos();
  }, []);

  // 🔹 Cerrar al hacer click afuera
  useEffect(() => {
    function handleClickOutside(e) {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setOpen(false);
        setSearch("");
        setSeleccionados([]);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // 🔹 Filtrar
  const cargosFiltrados = cargos.filter((c) =>
    (c.c_nombre || "").toLowerCase().includes((search || "").toLowerCase()),
  );

  // 🔹 Toggle selección
  const toggleSeleccion = (cargo) => {
    setSeleccionados((prev) => {
      const existe = prev.find((c) => c.c_id === cargo.c_id);

      if (existe) {
        return prev.filter((c) => c.c_id !== cargo.c_id);
      } else {
        return [...prev, cargo];
      }
    });
  };

  // 🔹 Confirmar asignación
  async function handleAsignar() {
    for (const cargo of seleccionados) {
      await crearCargoTrabajadorHook(cargo.c_id, trabajadorId);
    }
    await onSuccess({
      seleccionados: seleccionados ?? [],
      trabajadorId: trabajadorId,
    });

    setSeleccionados([]);
    setOpen(false);
  }

  return (
    <div className="agregar-fase-container" ref={popoverRef}>
      <button
        className="btn btn-terciary"
        style={{ fontSize: "20px" }}
        onClick={() => setOpen((v) => !v)}
        disabled={loadingCrear}
      >
        + Agregar fase
      </button>

      {open && (
        <div className="popover-fases">
          <input
            autoFocus
            className="popover-search"
            placeholder="Buscar fase..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {error && <p className="popover-error">{error}</p>}

          <ul className="popover-list">
            {loadingCargos && (
              <li className="popover-item-muted">Cargando...</li>
            )}

            {!loadingCargos &&
              cargosFiltrados.map((cargo) => {
                const yaAsignado = cargosAsignados.some(
                  (c) => c.id === cargo.c_id,
                );

                const seleccionado = seleccionados.some(
                  (c) => c.c_id === cargo.c_id,
                );

                return (
                  <button
                    key={cargo.c_id}
                    className={`popover-item 
                      ${yaAsignado ? "popover-item--disabled" : ""} 
                      ${seleccionado ? "popover-item--selected" : ""}
                    `}
                    onClick={() => !yaAsignado && toggleSeleccion(cargo)}
                  >
                    <div className="item-content">
                      <span className="item-agregrar">{cargo.c_nombre}</span>

                      {yaAsignado && (
                        <span className="popover-item-badge">ya asignado</span>
                      )}
                    </div>

                    <div className="item-check">{seleccionado && "✔"}</div>
                  </button>
                );
              })}

            {!loadingCargos && cargosFiltrados.length === 0 && (
              <li className="popover-item-muted">Sin resultados</li>
            )}
          </ul>

          {seleccionados.length > 0 && (
            <div className="multi-bar">
              <span>{seleccionados.length} seleccionadas</span>

              <div className="multi-actions">
                <button
                  className="btn btn-terciary"
                  onClick={() => setSeleccionados([])}
                >
                  Cancelar
                </button>

                <button className="btn btn-primary" onClick={handleAsignar}>
                  Asignar
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

AgregarFase.propTypes = {
  trabajadorId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  cargosAsignados: PropTypes.array,
  onSuccess: PropTypes.func,
};
