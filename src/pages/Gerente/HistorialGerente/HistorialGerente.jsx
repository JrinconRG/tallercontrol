import { useState, useMemo, useEffect } from "react";
import { useObtenerHistorialProcesos } from "../../../features/procesos/application/hooks/useObtenerHistorialProcesos";
import { usePagination } from "../../../hooks/usePagination";
import { calcularTiempoTranscurrido } from "../../../utils/calcularTranscurrido";

import Table from "../../../components/Table/Table";
import TableHeader from "../../../components/Table/TableHeader";
import Card from "../../../components/card/Card";
import Pagination from "../../../components/pagination/Pagination";
import MostrarImagenesModal from "../../../components/mostrarImagenModal/MostrarImagenModal";
import "../../Trabajador/Historial/Historial.css";

export default function HistorialGerente() {
  const [search, setSearch] = useState("");
  const [estadoPago, setEstadoPago] = useState("");
  const [procesoDetalle, setProcesoDetalle] = useState(null);
  const [imagenSeleccionada, setImagenSeleccionada] = useState({
    path: null,
    fase: "",
  });

  const { historial = [], loading, error } = useObtenerHistorialProcesos();

  // 1. Lógica de Filtrado Memozada
  const procesosFiltrados = useMemo(() => {
    return historial.filter((item) => {
      const term = search.trim().toLowerCase();
      const coincideBusqueda =
        !term ||
        (item.codigoCofre || "").toLowerCase().includes(term) ||
        (item.referenciaNombre || "").toLowerCase().includes(term) ||
        (item.asignado || "").toLowerCase().includes(term);

      const subprocesos = item.detalleSubprocesos || [];
      const estaPagadoTotal = item.proPagado || item.pagado;
      const tienePagosParciales = subprocesos.some(
        (s) => s.pagado || s.sub_pagado,
      );

      let coincidePago = true;
      if (estadoPago === "pagado") coincidePago = estaPagadoTotal;
      if (estadoPago === "parcial")
        coincidePago = !estaPagadoTotal && tienePagosParciales;
      if (estadoPago === "pendiente")
        coincidePago = !estaPagadoTotal && !tienePagosParciales;

      return coincideBusqueda && coincidePago;
    });
  }, [historial, search, estadoPago]);

  // 2. Uso del Custom Hook de Paginación estandarizado
  const { page, limit, paginatedData, setPage, setLimit, totalItems } =
    usePagination(procesosFiltrados, 10);

  // Reiniciar a la página 1 cuando cambien los filtros de búsqueda o estado
  useEffect(() => {
    setPage(1);
  }, [search, estadoPago, setPage]);

  // Evento tecla Escape para el Drawer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setProcesoDetalle(null);
    };
    if (procesoDetalle) globalThis.addEventListener("keydown", handleKeyDown);
    return () => globalThis.removeEventListener("keydown", handleKeyDown);
  }, [procesoDetalle]);

  if (loading) return <p className="loading-text">Cargando historial...</p>;
  if (error) return <p className="error-text">Error al cargar el historial.</p>;

  // Helper para renderizar badges de pago
  const obtenerBadgePago = (proceso) => {
    if (proceso.proPagado || proceso.pagado) {
      return <span className="badge badge-success">Pagado Total</span>;
    }
    const subprocesos = proceso.detalleSubprocesos || [];
    if (subprocesos.some((s) => s.pagado || s.sub_pagado)) {
      return <span className="badge badge-warning">Pago Parcial</span>;
    }
    return <span className="badge badge-danger">Pendiente</span>;
  };

  return (
    <div className="page-content-historial">
      <div className="header-page">
        <h1 className="page-tittle">Historial de Cofres Finalizados</h1>
        <p className="page-mini-info">
          Auditoría de mano de obra y tiempos de producción
        </p>
      </div>

      <Card className="card-historial">
        <TableHeader
          searchValue={search}
          onSearchChange={setSearch}
          filters={[
            {
              name: "estadoPago",
              value: estadoPago,
              onChange: setEstadoPago,
              options: [
                { label: "Todos los pagos", value: "" },
                { label: "Pagado Total", value: "pagado" },
                { label: "Pago Parcial", value: "parcial" },
                { label: "Pendiente", value: "pendiente" },
              ],
            },
          ]}
        />

        <Table
          columns={[
            { key: "codigoCofre", label: "Código" },
            { key: "referenciaNombre", label: "Referencia" },
            { key: "color", label: "Color" },
            { key: "asignado", label: "Cliente / Asignado" },
            {
              key: "duracion",
              label: "Duración Total",
              render: (row) =>
                calcularTiempoTranscurrido(row.fechaInicio, row.fechaFin),
            },
            {
              key: "fechaInicio",
              label: "Inicio",
              render: (row) =>
                row.fechaInicio
                  ? new Date(row.fechaInicio).toLocaleDateString()
                  : "-",
            },
            {
              key: "fechaFin",
              label: "Finalización",
              render: (row) =>
                row.fechaFin
                  ? new Date(row.fechaFin).toLocaleDateString()
                  : "-",
            },
            {
              key: "totalAcumulado",
              label: "Valor Total",
              render: (row) =>
                `$${Number(row.totalAcumulado || 0).toLocaleString()}`,
            },
            {
              key: "pagoEstado",
              label: "Estado Liquidación",
              render: (row) => obtenerBadgePago(row),
            },
          ]}
          data={paginatedData}
          rowKey="id"
          onRowClick={(row) =>
            setProcesoDetalle({
              ...row,
              subprocesos: row.detalleSubprocesos || [],
            })
          }
        />

        {totalItems > 0 && (
          <Pagination
            totalItems={totalItems}
            limit={limit}
            page={page}
            onPageChange={setPage}
            onLimitChange={setLimit}
          />
        )}
      </Card>

      {/* Drawer estilo Notion con desglose de duraciones por fase */}
      {procesoDetalle && (
        <div className="drawer-overlay">
          <dialog className="drawer" open aria-modal="true">
            <div className="drawer-header">
              <div>
                <h3>Cofre: {procesoDetalle.codigoCofre}</h3>
                <span className="drawer-subtitle">
                  Cliente: {procesoDetalle.asignado || "No asignado"}
                </span>
              </div>
              <button
                className="btn btn-terciary"
                onClick={() => setProcesoDetalle(null)}
                aria-label="Cerrar detalle"
              >
                ✖
              </button>
            </div>

            <div className="drawer-body">
              <div className="drawer-summary-grid">
                <div className="summary-card">
                  <span className="summary-label">Referencia</span>
                  <strong>{procesoDetalle.referenciaNombre}</strong>
                </div>
                <div className="summary-card">
                  <span className="summary-label">Tiempo Total</span>
                  <strong>
                    {calcularTiempoTranscurrido(
                      procesoDetalle.fechaInicio,
                      procesoDetalle.fechaFin,
                    )}
                  </strong>
                </div>
                <div className="summary-card">
                  <span className="summary-label">Mano de Obra</span>
                  <strong>
                    $
                    {Number(
                      procesoDetalle.totalAcumulado || 0,
                    ).toLocaleString()}
                  </strong>
                </div>
              </div>

              <h4 className="drawer-section-title">
                Desglose de Fases y Tiempos
              </h4>

              <Table
                columns={[
                  { key: "cargoNombre", label: "Fase / Cargo" },
                  { key: "trabajadorNombreCompleto", label: "Operario" },
                  {
                    key: "duracionFase",
                    label: "Duración Fase",
                    render: (row) =>
                      calcularTiempoTranscurrido(
                        row.fecha_inicio || row.fechaInicio,
                        row.fecha_fin || row.fechaFin,
                      ),
                  },
                  {
                    key: "valor",
                    label: "Tarifa",
                    render: (row) =>
                      `$${Number(row.valor || 0).toLocaleString()}`,
                  },
                  {
                    key: "pagado",
                    label: "Nómina",
                    render: (row) => (
                      <span
                        className={`badge ${
                          row.pagado || row.sub_pagado
                            ? "badge-success"
                            : "badge-warning"
                        }`}
                      >
                        {row.pagado || row.sub_pagado ? "PAGADO" : "PENDIENTE"}
                      </span>
                    ),
                  },
                  {
                    key: "foto",
                    label: "Evidencia",
                    render: (row) =>
                      row.foto || row.fotosEvidencia ? (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() =>
                            setImagenSeleccionada({
                              path: row.foto || row.fotosEvidencia,
                              fase: row.fase || row.cargoNombre,
                            })
                          }
                        >
                          Ver Foto
                        </button>
                      ) : (
                        <span className="text-muted">Sin foto</span>
                      ),
                  },
                ]}
                data={procesoDetalle.subprocesos}
                rowKey="sub_id"
              />
            </div>
          </dialog>
        </div>
      )}

      <MostrarImagenesModal
        isOpen={Boolean(imagenSeleccionada.path)}
        path={imagenSeleccionada.path}
        fase={imagenSeleccionada.fase}
        onClose={() => setImagenSeleccionada({ path: null, fase: "" })}
      />
    </div>
  );
}
