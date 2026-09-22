import { useMemo } from "react";
import { useGetReporteTrabajadorNomina } from "../../application/hooks/useObtenerReporteTrabajadorNomina";
import Table from "../../../../components/Table/Table";
import { formatearMinutosA_DHMS } from "../../../../utils/timeFormatter";

export default function AuditoriaNominaDrawer({
  isOpen,
  onClose,
  trabajador,
  fechaInicio,
  fechaFin,
  incluirPendientes,
}) {
  const {
    reporteTrabajadorNomina = [],
    loading,
    error,
  } = useGetReporteTrabajadorNomina(
    trabajador?.trabajadorId,
    fechaInicio,
    fechaFin,
    incluirPendientes,
  );

  const resumenTotales = useMemo(() => {
    if (!reporteTrabajadorNomina.length) {
      return { cantidad: 0, tiempoTotalFormateado: "0m", valorTotal: 0 };
    }

    const cantidad = reporteTrabajadorNomina.length;

    const valorTotal = reporteTrabajadorNomina.reduce(
      (acc, row) => acc + (Number(row.valorCalculado) || 0),
      0,
    );

    const totalMinutos = reporteTrabajadorNomina.reduce(
      (acc, row) => acc + (Number(row.duracionMinutos) || 0),
      0,
    );

    const tiempoTotalFormateado = formatearMinutosA_DHMS(totalMinutos);

    return { cantidad, tiempoTotalFormateado, valorTotal };
  }, [reporteTrabajadorNomina]);

  if (!isOpen) return null;

  const formatCOP = (val) => "$" + Number(val).toLocaleString("es-CO");

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <dialog
        className="drawer drawer--sm"
        open
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "650px", width: "100%" }}
      >
        <div className="drawer-header">
          <div className="drawer-tittle">
            <h2>Auditoría: {trabajador?.nombre}</h2>
            <span>Cédula: {trabajador?.documento}</span>
          </div>
          <button className="btn btn-terciary" onClick={onClose}>
            ✕
          </button>
        </div>

        <div
          className="drawer-body"
          style={{ display: "flex", flexDirection: "column", gap: "20px" }}
        >
          {loading ? (
            <p>Cargando auditoría...</p>
          ) : error ? (
            <p>Error: {error.message}</p>
          ) : reporteTrabajadorNomina.length === 0 ? (
            <p>No se encontraron registros para este periodo.</p>
          ) : (
            <>
              <Table
                columns={[
                  { key: "faseNombre", label: "Fase" },
                  { key: "codigoCofre", label: "Código Cofre" },
                  { key: "referenciaNombre", label: "Referencia" },
                  {
                    key: "valorCalculado",
                    label: "Valor",
                    render: (row) => formatCOP(row.valorCalculado),
                  },
                  {
                    key: "duracionMinutos",
                    label: "Duración",
                    render: (row) =>
                      formatearMinutosA_DHMS(row.duracionMinutos),
                  },
                  {
                    key: "fechaInicio",
                    label: "Inicio",
                    render: (row) =>
                      new Date(row.fechaInicio).toLocaleDateString("es-CO"),
                  },
                  {
                    key: "fechaFin",
                    label: "Fin",
                    render: (row) =>
                      new Date(row.fechaFin).toLocaleDateString("es-CO"),
                  },
                ]}
                data={reporteTrabajadorNomina}
                rowKey="subprocesoId"
              />

              <div
                className="drawer-auditoria-resumen"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "12px",
                  background: "#f8f9fa",
                  padding: "16px",
                  borderRadius: "8px",
                  border: "1px solid var(--neutral-300)",
                  marginTop: "auto",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "var(--font-small)",
                      color: "#6b7280",
                      fontWeight: "500",
                      textTransform: "uppercase",
                    }}
                  >
                    Tareas Realizadas
                  </span>
                  <span
                    style={{
                      fontSize: "var(--font-title)",
                      fontWeight: "700",
                      color: "var(--neutral-900)",
                    }}
                  >
                    {resumenTotales.cantidad}
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "var(--font-small)",
                      color: "#6b7280",
                      fontWeight: "500",
                      textTransform: "uppercase",
                    }}
                  >
                    Tiempo Invertido
                  </span>
                  <span
                    style={{
                      fontSize: "var(--font-title)",
                      fontWeight: "700",
                      color: "var(--neutral-900)",
                    }}
                  >
                    {resumenTotales.tiempoTotalFormateado}
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "var(--font-small)",
                      color: "#6b7280",
                      fontWeight: "500",
                      textTransform: "uppercase",
                    }}
                  >
                    Subtotal
                  </span>
                  <span
                    style={{
                      fontSize: "var(--font-title)",
                      fontWeight: "700",
                    }}
                  >
                    {formatCOP(resumenTotales.valorTotal)}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </dialog>
    </div>
  );
}
