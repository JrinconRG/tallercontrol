import { useState, useEffect, useRef } from "react";
import { useAsignarCargo } from "../../../../features/Trabajadores/application/hooks/useAsignarCargo";
import { useCargos } from "../../../../features/cargos/application/hooks/useCargos";
import PropTypes from "prop-types";
import "./AgregarFase.css";

export default function AgregarFase({
  trabajadorId,
  cargosAsignados,
  onToast,
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [seleccionados, setSeleccionados] = useState([]);
  const popoverRef = useRef(null);

  //  Cargar cargos
  const { cargos, loading: loadingCargos } = useCargos();
  const asignarCargoMutation = useAsignarCargo();

  // 🔹 Cerrar al hacer click afuera
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        cerrarPopover();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const cerrarPopover = () => {
    setOpen(false);
    setSearch("");
    setSeleccionados([]);
  };

  // Filtrar
  const cargosFiltrados = cargos.filter((c) =>
    (c.nombre || "").toLowerCase().includes((search || "").toLowerCase()),
  );

  //  Toggle selección
  const toggleSeleccion = (cargo) => {
    setSeleccionados((prev) => {
      const existe = prev.find((c) => c.id === cargo.id);
      return existe ? prev.filter((c) => c.id !== cargo.id) : [...prev, cargo];
    });
  };

  // 🔹 Confirmar asignación
  async function handleAsignar() {
    await Promise.all(
      seleccionados.map(
        (cargo) =>
          console.log(
            "Asignando cargo",
            cargo.id,
            "a trabajador",
            trabajadorId,
          ) ||
          asignarCargoMutation.mutateAsync(
            { cargoId: cargo.id, trabajadorId: trabajadorId },
            {
              onSuccess: () => {
                onToast({ message: `Fase "${cargo}" asignada` });
              },
            },
          ),
      ),
    );
    cerrarPopover();
  }

  return (
    <div className="agregar-fase-container" ref={popoverRef}>
      <button
        className="btn btn-terciary"
        style={{ fontSize: "20px" }}
        onClick={() => setOpen((v) => !v)}
        disabled={asignarCargoMutation.isPending}
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

          {asignarCargoMutation.isError && (
            <p className="popover-error">
              {asignarCargoMutation.error?.message}
            </p>
          )}

          <ul className="popover-list">
            {loadingCargos && (
              <li className="popover-item-muted">Cargando...</li>
            )}

            {!loadingCargos &&
              cargosFiltrados.map((cargo) => {
                const yaAsignado = cargosAsignados.some((c) =>
                  c.esIgualA(cargo),
                );

                const seleccionado = seleccionados.some((c) =>
                  c.esIgualA(cargo),
                );

                return (
                  <button
                    key={cargo.id}
                    className={`popover-item 
                      ${yaAsignado ? "popover-item--disabled" : ""} 
                      ${seleccionado ? "popover-item--selected" : ""}
                    `}
                    onClick={() => !yaAsignado && toggleSeleccion(cargo)}
                  >
                    <div className="item-content">
                      <span className="item-agregrar">{cargo.nombre}</span>

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

                <button
                  className="btn btn-primary"
                  onClick={handleAsignar}
                  disabled={asignarCargoMutation.isPending}
                >
                  {asignarCargoMutation.isPending ? "Asignando..." : "Asignar"}
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
  onToast: PropTypes.func,
};
