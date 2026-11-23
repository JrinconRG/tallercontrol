import { useState, useMemo, useEffect } from "react";
import Card from "../../../../components/card/Card";
import Table from "../../../../components/Table/Table";
import TableHeader from "../../../../components/Table/TableHeader";
import Pagination from "../../../../components/pagination/Pagination";
import BotonDescargaNomina from "../components/BotonDescargaNomina";
import { useGetHistorialNominas } from "../../application/hooks/useObtenerHistorialNominas";
import { usePagination } from "../../../../hooks/usePagination";
import {
  formatFechaCorta,
  formatFechaHora,
  formatPeriodo,
} from "../../../../utils/formatearFechas";
import { normalizarTexto } from "../../../../utils/normalizarTexto";
import "./HistorialNomina.css";

const formatCOP = (val) => "$" + Number(val).toLocaleString("es-CO");

const claveMes = (fecha) => {
  const d = new Date(fecha);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

// Todo lo que se ve en la fila (y el id) es buscable
const textoBuscable = (n) =>
  normalizarTexto(
    [
      n.nominaId,
      n.generadaPorNombre,
      formatPeriodo(n.fechaInicio, n.fechaFin),
      formatFechaHora(n.fechaGeneracion),
      n.totalTrabajadores,
      n.totalPago,
      formatCOP(n.totalPago),
    ].join(" "),
  );

export default function HistorialNomina() {
  const [search, setSearch] = useState("");
  const [mesSeleccionado, setMesSeleccionado] = useState("");
  const { nominasHistoricas = [], loading, error } = useGetHistorialNominas();

  // Opciones de mes para el filtro (más reciente primero)
  const opcionesMes = useMemo(() => {
    const meses = nominasHistoricas
      .map((n) => ({
        value: claveMes(n.fechaGeneracion),
        label: new Date(n.fechaGeneracion).toLocaleDateString("es-CO", {
          month: "long",
          year: "numeric",
        }),
      }))
      .filter((m) => m.value);
    return [...new Map(meses.map((m) => [m.value, m])).values()].sort((a, b) =>
      b.value.localeCompare(a.value),
    );
  }, [nominasHistoricas]);

  const datosFiltrados = useMemo(() => {
    const term = normalizarTexto(search);
    return nominasHistoricas.filter((n) => {
      const coincideBusqueda = !term || textoBuscable(n).includes(term);
      const coincideMes =
        !mesSeleccionado || claveMes(n.fechaGeneracion) === mesSeleccionado;
      return coincideBusqueda && coincideMes;
    });
  }, [nominasHistoricas, search, mesSeleccionado]);

  const {
    page,
    limit,
    paginatedData: datosPaginados,
    setPage,
    setLimit,
  } = usePagination(datosFiltrados, 10);

  // Vuelve a la página 1 al cambiar búsqueda o mes
  useEffect(() => {
    setPage(1);
  }, [search, mesSeleccionado, setPage]);

  const hayFiltros = search || mesSeleccionado;
  const limpiarFiltros = () => {
    setSearch("");
    setMesSeleccionado("");
  };

  const columns = [
    {
      key: "periodo",
      label: "Periodo",
      className: "col-main",
      render: (row) => formatPeriodo(row.fechaInicio, row.fechaFin),
    },
    {
      key: "fechaGeneracion",
      label: "Generada",
      className: "col-date",
      render: (row) => formatFechaHora(row.fechaGeneracion),
    },
    {
      key: "totalTrabajadores",
      label: "Trabajadores",
      className: "col-num",
      render: (row) => row.totalTrabajadores,
    },
    {
      key: "totalPago",
      label: "Total pagado",
      className: "col-num",
      render: (row) => formatCOP(row.totalPago),
    },
    {
      key: "generadaPorNombre",
      label: "Generada por",
      className: "col-sh",
      render: (row) => row.generadaPorNombre ?? "—",
    },
    {
      key: "acciones",
      label: "",
      className: "col-status",
      render: (row) => <BotonDescargaNomina nomina={row} />,
    },
  ];

  if (loading) return <p>Cargando historial...</p>;
  if (error) return <p>Error cargando historial.</p>;

  return (
    <div className="page-content-historial-nomina">
      <div className="header-page">
        <h1 className="page-tittle">Historial de nóminas</h1>
        <p className="page-mini-info">
          Consulta y descarga todas las nóminas generadas
        </p>
      </div>

      <div className="page-historial-nomina-body">
        <Card>
          <div className="page-historial-nomina-card">
            <TableHeader
              searchValue={search}
              onSearchChange={setSearch}
              filters={[
                {
                  name: "mes",
                  value: mesSeleccionado,
                  onChange: setMesSeleccionado,
                  options: opcionesMes,
                  placeholder: "Todos los meses",
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

            <Table columns={columns} data={datosPaginados} rowKey="nominaId" />

            {datosFiltrados.length === 0 && (
              <p className="historial-empty">
                No hay nóminas que coincidan con los filtros.
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
    </div>
  );
}
