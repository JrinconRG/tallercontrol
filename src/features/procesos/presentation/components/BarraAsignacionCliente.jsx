import PropTypes from "prop-types";
import Select from "../../../../components/ui/select";
import "./BarraAsignacionCliente.css";
export default function BarraAsignacionCliente({
  seleccionadosCount,
  selectedCliente,
  opcionesClientes,
  onClienteChange,
  onAsignar,
  onCancelar,
  loading = false,
}) {
  if (seleccionadosCount === 0) return null;

  const puedeAsignar = Boolean(selectedCliente) && !loading;

  return (
    <section
      className="barra-asignacion"
      aria-label="Asignar cofres a un cliente"
    >
      <div className="barra-asignacion-info" aria-live="polite">
        <strong>
          {seleccionadosCount} cofre{seleccionadosCount !== 1 ? "s" : ""}{" "}
          seleccionado{seleccionadosCount !== 1 ? "s" : ""}
        </strong>
        <button
          type="button"
          className="barra-asignacion-limpiar"
          onClick={onCancelar}
          disabled={loading}
        >
          Limpiar selección
        </button>
      </div>

      <div className="barra-asignacion-select">
        <label htmlFor="asignar-cliente" className="barra-asignacion-sr">
          Cliente
        </label>
        <Select
          id="asignar-cliente"
          value={selectedCliente}
          onChange={onClienteChange}
          options={opcionesClientes}
          placeholder="Selecciona un cliente..."
        />
      </div>

      <div className="barra-asignacion-acciones">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onCancelar}
          disabled={loading}
        >
          Cancelar
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={onAsignar}
          disabled={!puedeAsignar}
        >
          {loading ? "Asignando…" : "Asignar a cliente"}
        </button>
      </div>
    </section>
  );
}

BarraAsignacionCliente.propTypes = {
  seleccionadosCount: PropTypes.number.isRequired,
  selectedCliente: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  opcionesClientes: PropTypes.array,
  onClienteChange: PropTypes.func.isRequired,
  onAsignar: PropTypes.func.isRequired,
  onCancelar: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};
