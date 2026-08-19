export default function BarraAsignacionCliente({
  seleccionadosCount,
  selectedCliente,
  opcionesClientes,
  onClienteChange,
  onAsignar,
  onCancelar,
  loading,
}) {
  if (seleccionadosCount === 0) return null;

  return (
    <div className="procesos-terminados-barra">
      <span className="procesos-terminados-contador-seleccion">
        {seleccionadosCount} cofre{seleccionadosCount !== 1 ? "s" : ""}{" "}
        seleccionado{seleccionadosCount !== 1 ? "s" : ""}
      </span>

      <select
        className="procesos-terminados-select-cliente"
        value={selectedCliente}
        onChange={(e) => onClienteChange(e.target.value)}
      >
        <option value="">Selecciona un cliente...</option>
        {opcionesClientes.map((c) => (
          <option key={c.value} value={c.value}>
            {c.label}
          </option>
        ))}
      </select>

      <button
        type="button"
        className="btn btn-primary"
        onClick={onAsignar}
        disabled={!selectedCliente || loading}
      >
        {loading ? "Asignando..." : "Asignar cliente"}
      </button>

      <button
        type="button"
        className="btn btn-secondary"
        onClick={onCancelar}
        disabled={loading}
      >
        Cancelar
      </button>
    </div>
  );
}
