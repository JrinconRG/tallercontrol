import { useState, useMemo } from "react";
import Table from "../../../../components/Table/Table";
import TableHeader from "../../../../components/Table/TableHeader";
import Pagination from "../../../../components/pagination/Pagination";
import { useGetProcesosSinAsignar } from "../../application/hooks/useObtenerProcesosSinAsignar";
import Card from "../../../../components/card/Card";
import { usePagination } from "../../../../hooks/usePagination";
import { useObtenerClientes } from "../../../clientes/application/hooks/useObtenerClientes";
import "./ProcesosTerminados.css";

export default function ProcesosTerminados() {
  const [search, setSearch] = useState("");
  const [selectedReference, setSelectedReference] = useState("");
  const [seleccionados, setSeleccionados] = useState([]);
  const [selectedCliente, setSelectedCliente] = useState("");

  // hook para traer todos los procesos sin asignar
  const { procesosSinAsignar, loading, error } = useGetProcesosSinAsignar();
  const {
    clientes = [],
    loading: loadingClientes,
    error: errorClientes,
    errorMessage: errorMessageClientes,
  } = useObtenerClientes();

  const opcionesClientes = useMemo(() => {
    return clientes.map((cliente) => ({
      value: cliente.id,
      label: cliente.nombre,
    }));
  }, [clientes]);

  const opcionesReferencias = useMemo(() => {
    const referencias = procesosSinAsignar.map((p) =>
      p.referenciaNombre?.trim(),
    );
    const unicas = [...new Set(referencias)].filter(Boolean);
    return unicas.map((ref) => ({ value: ref, label: ref }));
  }, [procesosSinAsignar]);

  const datosFiltrados = useMemo(() => {
    const term = search.trim().toLowerCase();
    return procesosSinAsignar.filter((p) => {
      const matchSearch =
        !term ||
        (p.codigoCofre || "").toLowerCase().includes(term) ||
        (p.referenciaNombre || "").toLowerCase().includes(term);
      const matchReference = selectedReference
        ? p.referenciaNombre?.trim() === selectedReference.trim()
        : true;

      return matchSearch && matchReference;
    });
  }, [procesosSinAsignar, search, selectedReference]);

  const {
    page,
    limit,
    paginatedData: datosPaginados,
    setPage,
    setLimit,
    resetPage,
  } = usePagination(datosFiltrados, 10);

  const idsPagina = datosPaginados.map((p) => p.id);

  const todosSeleccionadosEnPagina =
    idsPagina.length > 0 && idsPagina.every((id) => seleccionados.includes(id));

  const toggleSeleccionado = (id) => {
    setSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  const toggleSeleccionarPagina = () => {
    setSeleccionados((prev) => {
      if (todosSeleccionadosEnPagina) {
        return prev.filter((id) => !idsPagina.includes(id));
      }
      const nuevos = idsPagina.filter((id) => !prev.includes(id));
      return [...prev, ...nuevos];
    });
  };

  const limpiarSeleccion = () => setSeleccionados([]);
  const hayFiltrosActivos = search || selectedReference;
  const limpiarFiltros = () => {
    setSearch("");
    setSelectedReference("");
    resetPage();
  };

  const columns = [
    {
      key: "checkbox",
      label: (
        <input
          type="checkbox"
          checked={todosSeleccionadosEnPagina}
          onChange={toggleSeleccionarPagina}
          aria-label="Seleccionar todos los cofres de esta página"
        />
      ),
      render: (row) => (
        <input
          type="checkbox"
          checked={seleccionados.includes(row.id)}
          onChange={() => toggleSeleccionado(row.id)}
          onClick={(e) => e.stopPropagation()}
          aria-label={`Seleccionar cofre ${row.codigoCofre}`}
        />
      ),
    },
    { key: "codigoCofre", label: "Cofre" },
    { key: "referenciaNombre", label: "Referencia" },
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

  if (loading) return <p>Cargando procesos...</p>;
  if (error) return <p>Error cargando datos: {errorMessage}</p>;
  if (loadingClientes) return <p>Cargando clientes...</p>;
  if (errorClientes)
    return <p>Error cargando clientes: {errorMessageClientes}</p>;

  return (
    <div className="page-content-procesos-terminados">
      <div className="header-page">
        <h1 className="page-tittle">Procesos Terminados</h1>
        <p className="page-mini-info">
          Asigna cada cofre terminado a su empresa correspondiente
        </p>
      </div>
      <div className="page-procesos-terminados-body">
        <Card>
          <div className="page-procesos-terminados-card">
            <TableHeader
              searchValue={search}
              onSearchChange={(value) => {
                setSearch(value);
                resetPage();
              }}
              filters={[
                {
                  name: "referencia",
                  value: selectedReference,
                  onChange: (value) => {
                    setSelectedReference(value);
                    resetPage();
                  },
                  options: opcionesReferencias,
                  placeholder: "Todas las referencias",
                },
              ]}
              actions={
                hayFiltrosActivos
                  ? [
                      {
                        label: "Limpiar filtros",
                        onClick: limpiarFiltros,
                        className: "btn-secondary",
                      },
                    ]
                  : []
              }
            />

            <p className="procesos-terminados-contador">
              {datosFiltrados.length} cofre
              {datosFiltrados.length !== 1 ? "s" : ""} listo
              {datosFiltrados.length !== 1 ? "s" : ""} para asignar
            </p>

            <Table columns={columns} data={datosPaginados} rowKey="id" />

            {datosFiltrados.length === 0 && (
              <p className="procesos-terminados-empty">
                No hay cofres terminados pendientes de asignación.
              </p>
            )}

            <Pagination
              totalItems={datosFiltrados.length}
              limit={limit}
              page={page}
              onPageChange={setPage}
              onLimitChange={setLimit}
            />
          </div>
        </Card>
      </div>
      {seleccionados.length > 0 && (
        <div className="procesos-terminados-barra">
          <span className="procesos-terminados-contador-seleccion">
            {seleccionados.length} cofre
            {seleccionados.length !== 1 ? "s" : ""} seleccionado
            {seleccionados.length !== 1 ? "s" : ""}
          </span>

          <select
            className="procesos-terminados-select-cliente"
            value={selectedCliente}
            onChange={(e) => setSelectedCliente(e.target.value)}
          >
            <option value="">Selecciona un cliente...</option>
            {opcionesClientes.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>

          <button type="button" className="btn btn-primary">
            Asignar cliente
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={limpiarSeleccion}
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
}
