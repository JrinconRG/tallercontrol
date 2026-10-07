import Table from "../../../../components/Table/Table";
import TableHeader from "../../../../components/Table/TableHeader";
import Pagination from "../../../../components/pagination/Pagination";
import Card from "../../../../components/card/Card";
import BarraAsignacionCliente from "./BarraAsignacionCliente";
import { useProcesosTerminadosUI } from "../../application/hooks/useProcesosTerminadosUI";

export default function TablaProcesosSinAsignar() {
  const { state, actions } = useProcesosTerminadosUI();

  if (state.loading) return <p>Cargando información...</p>;
  if (state.error) return <p>Error cargando datos: {state.errorMessage}</p>;

  const columns = [
    {
      key: "checkbox",
      label: (
        <input
          type="checkbox"
          checked={state.todosSeleccionadosEnPagina}
          onChange={actions.toggleSeleccionarPagina}
          aria-label="Seleccionar todos los cofres de esta página"
        />
      ),
      render: (row) => (
        <input
          type="checkbox"
          checked={state.seleccionados.includes(row.id)}
          onChange={() => actions.toggleSeleccionado(row.id)}
          onClick={(e) => e.stopPropagation()}
          aria-label={`Seleccionar cofre ${row.codigoCofre}`}
        />
      ),
    },
    { key: "codigoCofre", label: "Cofre" },
    { key: "referenciaNombre", label: "Referencia" },
    {
      key: "color",
      label: "Color",
    },
    {
      key: "fechaFin",
      label: "Finalizado",
      render: (row) =>
        row.fechaFin
          ? new Date(row.fechaFin).toLocaleDateString("es-CO", {
              day: "2-digit",
              month: "short",
            })
          : "—",
    },
    {
      key: "duracion",
      label: "Duración",
      render: (row) => row.duracionTotal(),
    },
  ];

  return (
    <div className="page-procesos-terminados-body">
      <Card>
        <div className="page-procesos-terminados-card">
          <TableHeader
            searchValue={state.search}
            onSearchChange={(value) => {
              actions.setSearch(value);
              state.pagination.resetPage();
            }}
            filters={[
              {
                name: "referencia",
                value: state.selectedReference,
                onChange: (value) => {
                  actions.setSelectedReference(value);
                  state.pagination.resetPage();
                },
                options: state.opcionesReferencias,
                placeholder: "Todas las referencias",
              },
            ]}
            actions={
              state.hayFiltrosActivos
                ? [
                    {
                      label: "Limpiar filtros",
                      onClick: actions.limpiarFiltros,
                      className: "btn-secondary",
                    },
                  ]
                : []
            }
          />

          <p className="procesos-terminados-contador">
            {state.datosFiltrados.length} cofre
            {state.datosFiltrados.length !== 1 ? "s" : ""} listo
            {state.datosFiltrados.length !== 1 ? "s" : ""} para asignar
          </p>

          <Table columns={columns} data={state.datosPaginados} rowKey="id" />

          {state.datosFiltrados.length === 0 && (
            <p className="procesos-terminados-empty">
              No hay cofres terminados pendientes de asignación.
            </p>
          )}

          <Pagination
            totalItems={state.datosFiltrados.length}
            limit={state.pagination.limit}
            page={state.pagination.page}
            onPageChange={state.pagination.setPage}
            onLimitChange={state.pagination.setLimit}
          />
        </div>
      </Card>

      <BarraAsignacionCliente
        seleccionadosCount={state.seleccionados.length}
        selectedCliente={state.selectedCliente}
        opcionesClientes={state.opcionesClientes}
        onClienteChange={actions.setSelectedCliente}
        onAsignar={actions.handleAsignar}
        onCancelar={actions.limpiarSeleccion}
        loading={state.asignando}
      />
    </div>
  );
}
