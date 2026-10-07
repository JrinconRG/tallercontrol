import { useState, useEffect, useMemo } from "react";
import { Outlet } from "react-router-dom";
import { useGetDetallesProcesoGerente } from "../../../features/procesos/application/hooks/useObtenerDetallesProcesoGerente";
import Stepper from "../../../components/Stepper/Stepper";
import Card from "../../../components/card/Card";
import FaseDetalle from "../../../components/faseDetalle/FaseDetalle";
import MostrarImagenesModal from "../../../components/mostrarImagenModal/MostrarImagenModal";
import Pagination from "../../../components/pagination/Pagination";
import SearchBar from "../../../components/ui/seachBar";
import Select from "../../../components/ui/select";
import ColorBadge from "../../../components/colorBadge/ColorBadge";
import "./Dashboard.css";

export default function Dashboard() {
  const [faseDetalle, setFaseDetalle] = useState({});
  const [modalFotos, setModalFotos] = useState(null);
  //pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  //filtros
  const [search, setSearch] = useState("");
  const [selectedReference, setSelectedReference] = useState("");
  const [selectedEstado, setSelectedEstado] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [sortOrder, setSortOrder] = useState("recent"); // 'recent' o 'oldest

  //hook para traer los procesos activos
  const { detallesProcesoGerente, loading, error } =
    useGetDetallesProcesoGerente();

  // Si los filtros cambian, reiniciamos a la page 1
  useEffect(() => {
    setPage(1);
  }, [search, selectedReference, selectedEstado, selectedColor, sortOrder]);

  //opciones para los selects
  const opcionesReferencias = useMemo(() => {
    const referencias = detallesProcesoGerente.map((p) =>
      p.referenciaNombre?.trim(),
    );
    const unicas = [...new Set(referencias)].filter(Boolean);
    return unicas.map((ref) => ({ value: ref, label: ref }));
  }, [detallesProcesoGerente]);

  const opcionesEstados = useMemo(() => {
    const estadosCalculados = detallesProcesoGerente.map((p) =>
      p.obtenerEstadoDetallado(),
    );
    const unicas = [...new Set(estadosCalculados)].filter(Boolean);
    return unicas.map((est) => ({ value: est, label: est }));
  }, [detallesProcesoGerente]);

  const opcionesColores = useMemo(() => {
    const mapa = new Map();
    detallesProcesoGerente.forEach((p) => {
      if (p.color && !mapa.has(p.color)) {
        mapa.set(p.color, p.colorHex);
      }
    });
    return [...mapa.entries()].map(([nombre, hex]) => ({
      value: nombre,
      label: nombre,
      color: hex,
    }));
  }, [detallesProcesoGerente]);

  const opcionesOrden = [
    { value: "recent", label: "Más recientes primero" },
    { value: "oldest", label: "Más antiguos primero" },
  ];

  const datosFiltradosyOrdenados = useMemo(() => {
    const term = search.trim().toLowerCase();

    return detallesProcesoGerente
      .filter((p) => {
        const estadoDetallado = p.obtenerEstadoDetallado();

        const matchSearch =
          !term ||
          (p.codigoCofre || "").toLowerCase().includes(term) ||
          (p.referenciaNombre || "").toLowerCase().includes(term);

        const matchReference = selectedReference
          ? p.referenciaNombre?.trim() === selectedReference.trim()
          : true;

        const matchEstado = selectedEstado
          ? estadoDetallado === selectedEstado
          : true;

        const matchColor = selectedColor ? p.color === selectedColor : true;

        return matchSearch && matchReference && matchEstado && matchColor;
      })
      .sort((a, b) => {
        const fechaA = new Date(a.fechaFin);
        const fechaB = new Date(b.fechaFin);
        return sortOrder === "recent" ? fechaB - fechaA : fechaA - fechaB;
      });
  }, [
    detallesProcesoGerente,
    search,
    selectedReference,
    selectedEstado,
    selectedColor,
    sortOrder,
  ]);

  const datosPaginados = useMemo(() => {
    const offset = (page - 1) * limit;
    return datosFiltradosyOrdenados.slice(offset, offset + limit);
  }, [datosFiltradosyOrdenados, page, limit]);

  const hayFiltrosActivos =
    search ||
    selectedReference ||
    selectedEstado ||
    selectedColor ||
    sortOrder !== "recent";

  const limpiarFiltros = () => {
    setSearch("");
    setSelectedReference("");
    setSelectedEstado("");
    setSelectedColor("");
    setSortOrder("recent");
  };

  if (loading) return <p>Cargando detalle...</p>;
  if (error) return <p>Error cargando datos</p>;

  return (
    <div className="page-content-dashboard">
      <div className="header-page">
        <h1 className="page-tittle">Panel Gerencial</h1>
        <p className="page-mini-info">Seguimiento de procesos en tiempo real</p>
      </div>

      <div className="filters-toolbar">
        <div className="filters-toolbar-row">
          <div className="filter-field filter-field--search">
            <label className="filter-label">Buscar</label>
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Código o referencia..."
            />
          </div>

          <div className="filter-field">
            <label className="filter-label">Referencia</label>
            <Select
              value={selectedReference}
              onChange={setSelectedReference}
              options={opcionesReferencias}
              placeholder="Todas"
            />
          </div>

          <div className="filter-field">
            <label className="filter-label">Estado</label>
            <Select
              value={selectedEstado}
              onChange={setSelectedEstado}
              options={opcionesEstados}
              placeholder="Todos"
            />
          </div>

          <div className="filter-field">
            <label className="filter-label">Color</label>
            <Select
              value={selectedColor}
              onChange={setSelectedColor}
              options={opcionesColores}
              placeholder="Todos"
            />
          </div>

          <div className="filter-field">
            <label className="filter-label">Ordenar por</label>
            <Select
              value={sortOrder}
              onChange={setSortOrder}
              options={opcionesOrden}
              placeholder="Ordenar por..."
            />
          </div>

          {hayFiltrosActivos && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={limpiarFiltros}
            >
              Limpiar filtros
            </button>
          )}
        </div>

        <div className="filters-summary">
          Mostrando {datosPaginados.length} de {datosFiltradosyOrdenados.length}{" "}
          proceso{datosFiltradosyOrdenados.length !== 1 ? "s" : ""}
        </div>
      </div>

      <div className="page-content-dashboard-grid">
        {datosPaginados.map((proceso) => (
          <div
            key={proceso.id}
            className="proceso-card-shell"
            style={{ "--proceso-color": proceso.colorHex || undefined }}
          >
            <Card
              key={proceso.id}
              title={proceso.codigoCofre}
              description={proceso.referenciaNombre}
              borderColor={proceso.colorHex}
              badge={
                <ColorBadge color={proceso.color} colorHex={proceso.colorHex} />
              }
            >
              <Stepper
                fases={proceso.detalleSubprocesos}
                selectedId={faseDetalle[proceso.id]?.id}
                onSelectFase={(fase) => {
                  setFaseDetalle((prev) => ({
                    ...prev,
                    [proceso.id]:
                      prev[proceso.id]?.id === fase.id ? null : fase,
                  }));
                }}
              />
              {faseDetalle[proceso.id] && (
                <FaseDetalle
                  fase={faseDetalle[proceso.id]}
                  onVerFotos={(fase) =>
                    setModalFotos({
                      path: fase.foto,
                      fase: fase.fase,
                    })
                  }
                />
              )}
            </Card>
          </div>
        ))}
      </div>

      <Pagination
        totalItems={datosFiltradosyOrdenados.length}
        limit={limit}
        page={page}
        onPageChange={setPage}
        onLimitChange={setLimit}
      />

      <MostrarImagenesModal
        isOpen={!!modalFotos}
        path={modalFotos?.path}
        fase={modalFotos?.fase}
        onClose={() => setModalFotos(null)}
      />

      <Outlet />
    </div>
  );
}
