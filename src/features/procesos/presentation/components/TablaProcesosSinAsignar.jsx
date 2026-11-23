import Table from "../../../../components/Table/Table";
import TableHeader from "../../../../components/Table/TableHeader";
import Pagination from "../../../../components/pagination/Pagination";
import Card from "../../../../components/card/Card";
import ColorBadge from "../../../../components/colorBadge/ColorBadge";
import { formatFechaCorta } from "../../../../utils/formatearFechas";
import BarraAsignacionCliente from "./BarraAsignacionCliente";
import { useProcesosTerminadosUI } from "../../application/hooks/useProcesosTerminadosUI";
import "./TablaProcesosSinAsignar.css";
export default function TablaProcesosSinAsignar() {
  const { state, actions } = useProcesosTerminadosUI();

  if (state.loading) return <p>Cargando información...</p>;
  if (state.error) return <p>Error cargando datos: {state.errorMessage}</p>;

  const total = state.datosFiltrados.length;
  const nSel = state.seleccionados.length;

  const columns = [
    {
      key: "checkbox",
      width: 56,
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
    {
      key: "codigoCofre",
      label: "Cofre",
      render: (row) => <strong>{row.codigoCofre}</strong>,
    },
    { key: "referenciaNombre", label: "Referencia", wrap: true },
    {
      key: "color",
      label: "Color",
      render: (row) => <ColorBadge color={row.color} colorHex={row.colorHex} />,
    },
    {
      key: "fechaFin",
      label: "Finalizado",
      render: (row) => formatFechaCorta(row.fechaFin),
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
          {total} cofre{total !== 1 ? "s" : ""} listo{total !== 1 ? "s" : ""}{" "}
          para asignar
          {nSel > 0 && (
            <>
              {" · "}
              <strong className="procesos-terminados-sel">
                {nSel} seleccionado{nSel !== 1 ? "s" : ""}
              </strong>
            </>
          )}
        </p>

        <Table
          columns={columns}
          data={state.datosPaginados}
          rowKey="id"
          onRowClick={(row) => actions.toggleSeleccionado(row.id)}
          rowClassName={(row) =>
            state.seleccionados.includes(row.id) ? "row-selected" : ""
          }
        />

        {total === 0 && (
          <p className="procesos-terminados-empty">
            No hay cofres terminados pendientes de asignación.
          </p>
        )}

        {total > 0 && (
          <Pagination
            totalItems={total}
            limit={state.pagination.limit}
            page={state.pagination.page}
            onPageChange={state.pagination.setPage}
            onLimitChange={state.pagination.setLimit}
          />
        )}
      </Card>

      <BarraAsignacionCliente
        seleccionadosCount={nSel}
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
