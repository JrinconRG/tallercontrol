import { useState, useMemo } from "react";
import { useObtenerHistorialSubprocesosPendientes } from "../../../features/subProcesos/application/hooks/useObtenerHistorialSubprocesosPendientes";
import Table from "../../../components/Table/Table";
import TableHeader from "../../../components/Table/TableHeader";
import Card from "../../../components/card/Card";
import Pagination from "../../../components/pagination/Pagination";
import MostrarImagenesModal from "../../../components/mostrarImagenModal/MostrarImagenModal";
import { usePagination } from "../../../hooks/usePagination";
import "./Historial.css";
import { Icon } from "../../../components/ui/Icon";

export default function Historial() {
  const [search, setSearch] = useState("");
  const [filtroReferencia, setFiltroReferencia] = useState("");
  const [filtroCargo, setFiltroCargo] = useState("");
  const [filtroOrden, setFiltroOrden] = useState("reciente");
  const [imagenSeleccionada, setImagenSeleccionada] = useState({
    path: null,
    fase: "",
  });

  const { historialSubprocesosPendientes, loading, error } =
    useObtenerHistorialSubprocesosPendientes();

  // Opciones derivadas de los datos
  const opcionesReferencias = useMemo(() => {
    const unicas = [
      ...new Set(
        historialSubprocesosPendientes
          .map((h) => h.referenciaNombre)
          .filter(Boolean),
      ),
    ];
    return unicas.map((r) => ({ value: r, label: r }));
  }, [historialSubprocesosPendientes]);

  const opcionesCargos = useMemo(() => {
    const unicos = [
      ...new Set(
        historialSubprocesosPendientes
          .map((h) => h.cargoNombre)
          .filter(Boolean),
      ),
    ];
    return unicos.map((c) => ({ value: c, label: c }));
  }, [historialSubprocesosPendientes]);

  const datosFiltrados = useMemo(() => {
    let resultado = [...historialSubprocesosPendientes];

    const term = search.trim().toLowerCase();
    if (term) {
      resultado = resultado.filter(
        (h) =>
          h.codigoCofre?.toLowerCase().includes(term) ||
          h.trabajadorNombreCompleto?.toLowerCase().includes(term),
      );
    }

    if (filtroReferencia) {
      resultado = resultado.filter(
        (h) => h.referenciaNombre === filtroReferencia,
      );
    }

    if (filtroCargo) {
      resultado = resultado.filter((h) => h.cargoNombre === filtroCargo);
    }

    resultado.sort((a, b) => {
      const dateA = new Date(a.fechaFin);
      const dateB = new Date(b.fechaFin);
      return filtroOrden === "reciente" ? dateB - dateA : dateA - dateB;
    });

    return resultado;
  }, [
    historialSubprocesosPendientes,
    search,
    filtroReferencia,
    filtroCargo,
    filtroOrden,
  ]);

  const hayFiltros = search || filtroReferencia || filtroCargo;

  const limpiarFiltros = () => {
    setSearch("");
    setFiltroReferencia("");
    setFiltroCargo("");
    setFiltroOrden("reciente");
  };

  const { page, limit, paginatedData, setPage, setLimit, resetPage } =
    usePagination(datosFiltrados, 10);

  const columns = [
    { key: "codigoCofre", label: "Código" },
    { key: "referenciaNombre", label: "Referencia" },
    { key: "duracion", label: "Duración" },
    {
      key: "fechaInicio",
      label: "Inicio",
      render: (row) => new Date(row.fechaInicio).toLocaleDateString("es-CO"),
    },
    {
      key: "fechaFin",
      label: "Fin",
      render: (row) =>
        row.fechaFin ? new Date(row.fechaFin).toLocaleDateString("es-CO") : "—",
    },
    { key: "trabajadorNombreCompleto", label: "Trabajador" },
    { key: "cargoNombre", label: "Fase realizada" },
    {
      key: "valor",
      label: "Valor",
      className: "col-num",
      render: (row) => `$${row.valor?.toLocaleString("es-CO")}`,
    },

    {
      key: "fotosEvidencia",
      label: "Evidencia",
      className: "col-status",
      render: (row) => {
        const tieneFotos = row.fotosEvidencia && row.fotosEvidencia.length > 0;
        return tieneFotos ? (
          <button
            className="btn btn-primary"
            onClick={() =>
              setImagenSeleccionada({
                path: row.fotosEvidencia,
                fase: row.cargoNombre,
              })
            }
          >
            <Icon name="Image" />
          </button>
        ) : (
          <span className="text-muted">Sin fotos</span>
        );
      },
    },
  ];

  if (loading) return <p>Cargando historial...</p>;
  if (error) return <p>Error al cargar: {error.message}</p>;

  return (
    <div className="page-content-historial">
      <div className="header-page">
        <h1 className="page-tittle">Historial de Cofres</h1>
        <p className="page-mini-info">Seguimiento de fases registradas</p>
      </div>

      <Card className="card-historial">
        <TableHeader
          searchValue={search}
          onSearchChange={(val) => {
            setSearch(val);
            resetPage();
          }}
          filters={[
            {
              name: "referencia",
              value: filtroReferencia,
              onChange: (val) => {
                setFiltroReferencia(val);
                resetPage();
              },
              options: opcionesReferencias,
              placeholder: "Todas las referencias",
            },
            {
              name: "cargo",
              value: filtroCargo,
              onChange: (val) => {
                setFiltroCargo(val);
                resetPage();
              },
              options: opcionesCargos,
              placeholder: "Todas las fases",
            },

            {
              name: "orden",
              value: filtroOrden,
              onChange: (val) => {
                setFiltroOrden(val);
                resetPage();
              },
              options: [
                { value: "reciente", label: "Más recientes" },
                { value: "antiguo", label: "Más antiguos" },
              ],
              placeholder: "Ordenar por",
            },
          ]}
          actions={
            hayFiltros
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

        {datosFiltrados.length === 0 ? (
          <p className="historial-empty">
            No hay registros que coincidan con los filtros.
          </p>
        ) : (
          <Table data={paginatedData} rowKey="id" columns={columns} />
        )}

        <Pagination
          totalItems={datosFiltrados.length}
          limit={limit}
          page={page}
          onPageChange={setPage}
          onLimitChange={setLimit}
        />
      </Card>

      <MostrarImagenesModal
        isOpen={Boolean(imagenSeleccionada.path)}
        path={imagenSeleccionada.path}
        fase={imagenSeleccionada.fase}
        onClose={() => setImagenSeleccionada({ path: null, fase: "" })}
      />
    </div>
  );
}
