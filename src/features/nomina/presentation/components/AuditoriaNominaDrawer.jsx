import { useMemo } from "react";
import { useGetReporteTrabajadorNomina } from "../../application/hooks/useObtenerReporteTrabajadorNomina";
import Table from "../../../../components/Table/Table";
import { formatearMinutosA_DHMS } from "../../../../utils/timeFormatter";
import { getAppErrorMessage } from "../../../../shared/errors/getAppErrorMessage";

const formatCOP = (val) => "$" + Number(val).toLocaleString("es-CO");

function ColorCelda({ colorNombre, colorHex }) {
  if (!colorNombre && !colorHex) {
    return <span style={{ color: "#9ca3af" }}>—</span>;
  }
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
      <span
        style={{
          width: "10px",
          height: "10px",
          borderRadius: "50%",
          backgroundColor: colorHex || "#d1d5db",
          border: "1px solid rgba(0, 0, 0, 0.15)",
          flexShrink: 0,
        }}
      />
      <span style={{ textTransform: "capitalize" }}>{colorNombre || "—"}</span>
    </span>
  );
}

const columnasTareas = [
  { key: "faseNombre", label: "Fase" },
  { key: "codigoCofre", label: "Código Cofre" },
  { key: "referenciaNombre", label: "Referencia" },
  {
    key: "color",
    label: "Color",
    render: (row) => (
      <ColorCelda colorNombre={row.colorNombre} colorHex={row.colorHex} />
    ),
  },
  {
    key: "valorCalculado",
    label: "Valor",
    render: (row) => formatCOP(row.valorCalculado),
  },
  {
    key: "duracionMinutos",
    label: "Duración",
    render: (row) => formatearMinutosA_DHMS(row.duracionMinutos),
  },
  {
    key: "fechaInicio",
    label: "Inicio",
    render: (row) => new Date(row.fechaInicio).toLocaleDateString("es-CO"),
  },
  {
    key: "fechaFin",
    label: "Fin",
    render: (row) => new Date(row.fechaFin).toLocaleDateString("es-CO"),
  },
];

function ResumenBox({ label, valor }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      <span
        style={{
          fontSize: "var(--font-small)",
          color: "#6b7280",
          fontWeight: "500",
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: "var(--font-title)",
          fontWeight: "700",
          color: "var(--neutral-900)",
        }}
      >
        {valor}
      </span>
    </div>
  );
}

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

  const { tareasPeriodo, tareasPendientes } = useMemo(() => {
    return {
      tareasPeriodo: reporteTrabajadorNomina.filter((r) => !r.esPendiente),
      tareasPendientes: reporteTrabajadorNomina.filter((r) => r.esPendiente),
    };
  }, [reporteTrabajadorNomina]);

  const calcularResumen = (lista) => {
    const cantidad = lista.length;
    const valorTotal = lista.reduce(
      (acc, row) => acc + (Number(row.valorCalculado) || 0),
      0,
    );
    const totalMinutos = lista.reduce(
      (acc, row) => acc + (Number(row.duracionMinutos) || 0),
      0,
    );
    return {
      cantidad,
      valorTotal,
      tiempoTotalFormateado: formatearMinutosA_DHMS(totalMinutos),
    };
  };

  const resumenPeriodo = useMemo(
    () => calcularResumen(tareasPeriodo),
    [tareasPeriodo],
  );
  const resumenPendientes = useMemo(
    () => calcularResumen(tareasPendientes),
    [tareasPendientes],
  );
  const totalGeneral = resumenPeriodo.valorTotal + resumenPendientes.valorTotal;

  let contenidoAuditoria;

  if (loading) {
    contenidoAuditoria = <p>Cargando auditoría...</p>;
  } else if (error) {
    contenidoAuditoria = <p>Error: {getAppErrorMessage(error)}</p>;
  } else if (reporteTrabajadorNomina.length === 0) {
    contenidoAuditoria = <p>No se encontraron registros para este periodo.</p>;
  } else {
    contenidoAuditoria = (
      <>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <h3 style={{ fontSize: "var(--font-body)", fontWeight: "600" }}>
            Realizado en el periodo
          </h3>
          {tareasPeriodo.length === 0 ? (
            <p style={{ color: "#6b7280", fontSize: "var(--font-small)" }}>
              No hay tareas realizadas en este periodo.
            </p>
          ) : (
            <Table
              columns={columnasTareas}
              data={tareasPeriodo}
              rowKey="subprocesoId"
            />
          )}
        </div>

        {tareasPendientes.length > 0 && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <h3
              style={{
                fontSize: "var(--font-body)",
                fontWeight: "600",
                color: "var(--warning-700, #b45309)",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              Pendientes de periodos anteriores
            </h3>
            <Table
              columns={columnasTareas}
              data={tareasPendientes}
              rowKey="subprocesoId"
            />
          </div>
        )}

        <div
          className="drawer-auditoria-resumen"
          style={{
            display: "flex",
            flexDirection: "column",
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
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "12px",
            }}
          >
            <ResumenBox
              label="Tareas del periodo"
              valor={resumenPeriodo.cantidad}
            />
            <ResumenBox
              label="Tiempo invertido"
              valor={resumenPeriodo.tiempoTotalFormateado}
            />
            <ResumenBox
              label="Subtotal periodo"
              valor={formatCOP(resumenPeriodo.valorTotal)}
            />
          </div>

          {tareasPendientes.length > 0 && (
            <>
              <div
                style={{
                  borderTop: "1px dashed var(--neutral-300)",
                  paddingTop: "12px",
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "12px",
                }}
              >
                <ResumenBox
                  label="Tareas pendientes"
                  valor={resumenPendientes.cantidad}
                />
                <ResumenBox
                  label="Tiempo pendiente"
                  valor={resumenPendientes.tiempoTotalFormateado}
                />
                <ResumenBox
                  label="Subtotal pendientes"
                  valor={formatCOP(resumenPendientes.valorTotal)}
                />
              </div>

              <div
                style={{
                  borderTop: "1px solid var(--neutral-400)",
                  paddingTop: "12px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontWeight: "600" }}>Total general</span>
                <span
                  style={{
                    fontWeight: "700",
                    fontSize: "var(--font-title)",
                  }}
                >
                  {formatCOP(totalGeneral)}
                </span>
              </div>
            </>
          )}
        </div>
      </>
    );
  }

  if (!isOpen) return null;

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
          {contenidoAuditoria}
        </div>
      </dialog>
    </div>
  );
}
