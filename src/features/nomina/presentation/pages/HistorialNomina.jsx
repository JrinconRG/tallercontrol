import { useState, useMemo } from "react";
import Card from "../../../../components/card/Card";
import Table from "../../../../components/Table/Table";
import TableHeader from "../../../../components/Table/TableHeader";
import Pagination from "../../../../components/pagination/Pagination";
import { Icon } from "../../../../components/ui/Icon";
import { useGetHistorialNominas } from "../../application/hooks/useObtenerHistorialNominas";
import { useGetDetalleNominaGenerada } from "../../application/hooks/useObtenerNominaGenerada";
import { generarPDFNomina } from "../../../../utils/generarPDFNomina";
import { usePagination } from "../../../../hooks/usePagination";
import "./HistorialNomina.css";

const formatCOP = (val) => "$" + Number(val).toLocaleString("es-CO");

const formatFecha = (fecha) =>
  fecha
    ? new Date(fecha).toLocaleDateString("es-CO", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

const formatPeriodo = (inicio, fin) => {
  if (!inicio || !fin) return "—";
  const i = new Date(inicio).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
  });
  const f = new Date(fin).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  return `${i} — ${f}`;
};

function BotonDescarga({ nomina }) {
  const [descargando, setDescargando] = useState(false);
  const [nominaIdActivo, setNominaIdActivo] = useState(null);

  const { detalleNominaGenerada, loading } =
    useGetDetalleNominaGenerada(nominaIdActivo);

  const handleDescargar = async () => {
    setDescargando(true);
    setNominaIdActivo(nomina.nominaId);
  };

  useMemo(() => {
    if (detalleNominaGenerada?.length && descargando) {
      generarPDFNomina({
        cabecera: nomina,
        trabajadores: detalleNominaGenerada,
      });
      setDescargando(false);
      setNominaIdActivo(null);
    }
  }, [detalleNominaGenerada, descargando]);

  return (
    <button
      type="button"
      className="btn btn-secondary "
      onClick={handleDescargar}
      disabled={loading || descargando}
      title="Descargar PDF"
    >
      {loading || descargando ? (
        <div className="descarga-spinner" />
      ) : (
        <Icon name="Download" size={18} color="var(--brand-600)" />
      )}
    </button>
  );
}

export default function HistorialNomina() {
  const [search, setSearch] = useState("");
  const [mesSeleccionado, setMesSeleccionado] = useState("");
  const { nominasHistoricas, loading, error } = useGetHistorialNominas();
  console.log("nominasHistoricas", nominasHistoricas);

  // Opciones de mes para el filtro
  const opcionesMes = useMemo(() => {
    const meses = nominasHistoricas.map((n) => {
      const d = new Date(n.fechaGeneracion);
      return {
        value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
        label: d.toLocaleDateString("es-CO", {
          month: "long",
          year: "numeric",
        }),
      };
    });
    const unicas = [...new Map(meses.map((m) => [m.value, m])).values()];
    return unicas;
  }, [nominasHistoricas]);

  const datosFiltrados = useMemo(() => {
    const term = search.trim().toLowerCase();
    return nominasHistoricas.filter((n) => {
      const matchSearch =
        !term ||
        n.generadaPorNombre?.toLowerCase().includes(term) ||
        String(n.nominaId).includes(term);

      const matchMes = mesSeleccionado
        ? (() => {
            const d = new Date(n.fechaGeneracion);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
            return key === mesSeleccionado;
          })()
        : true;

      return matchSearch && matchMes;
    });
  }, [nominasHistoricas, search, mesSeleccionado]);

  const hayFiltros = search || mesSeleccionado;
  const limpiarFiltros = () => {
    setSearch("");
    setMesSeleccionado("");
  };
  const {
    page,
    limit,
    paginatedData: datosPaginados,
    setPage,
    setLimit,
    resetPage,
  } = usePagination(datosFiltrados, 10);

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
      render: (row) => formatFecha(row.fechaGeneracion),
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
      render: (row) => <BotonDescarga nomina={row} />,
    },
  ];

  if (loading) return <p>Cargando historial...</p>;
  if (error) return <p>Error cargando historial.</p>;

  return (
    <div className="page-conten-historial-nomina">
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
              onSearchChange={(val) => {
                setSearch(val);
                resetPage();
              }}
              filters={[
                {
                  name: "mes",
                  value: mesSeleccionado,
                  onChange: (val) => {
                    setMesSeleccionado(val);
                    resetPage();
                  },
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

            {datosFiltrados.length === 0 && !loading && (
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
