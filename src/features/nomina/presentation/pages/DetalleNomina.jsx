import StepperNomina from "../../../../components/Stepper/StepperNomina";
import Card from "../../../../components/card/Card";
import { useNavigate, useLocation } from "react-router-dom";
import "./DetalleNomina.css";
import Table from "../../../../components/Table/Table";
import TableHeader from "../../../../components/Table/TableHeader";
import { useState, useMemo, useEffect } from "react";
import { useGetDetalleNominaPreview } from "../../application/hooks/useObtenerDetalleNominaPreview";
import AuditoriaNominaDrawer from "../components/AuditoriaNominaDrawer";
import Pagination from "../../../../components/pagination/Pagination";
import { obtenerValoresAutomaticosNomina } from "../../../../utils/calculoNomina";

export default function DetalleNomina() {
  const navigate = useNavigate();
  const location = useLocation();
  const [trabajadorSeleccionado, setTrabajadorSeleccionado] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [incluirPendientes, setIncluirPendientes] = useState({});
  const [search, setSearch] = useState("");

  // ajustes[trabajadorId] = { bonificacion, deduccion, transporte, segSocial, observaciones }
  const [ajustes, setAjustes] = useState({});

  useEffect(() => {
    setPage(1);
  }, [search]);

  const valoresAutoNomina = useMemo(
    () => obtenerValoresAutomaticosNomina(),
    [],
  );

  const togglePendientes = (trabajadorId) => {
    setIncluirPendientes((prev) => ({
      ...prev,
      [trabajadorId]: !prev[trabajadorId],
    }));
  };

  const { fechaInicio, fechaFin } = location.state ?? {};

  const { detalleNominaPreview = [], loading } = useGetDetalleNominaPreview(
    fechaInicio,
    fechaFin,
  );

  // Formateador estándar COP estático
  const formatCOP = (val) => "$" + Number(val || 0).toLocaleString("es-CO");

  // Formatea números con puntos de miles para los inputs de texto
  const formatDisplayNumber = (val) => {
    if (val === "" || val === undefined || val === null) return "";
    const num = Number(String(val).replace(/\D/g, ""));
    return isNaN(num) || num === 0 ? "" : num.toLocaleString("es-CO");
  };

  // Parsea cadenas formateadas con puntos de nuevo a enteros
  const parseNumberValue = (rawValue) => {
    const cleanStr = String(rawValue).replace(/\D/g, "");
    return cleanStr === "" ? 0 : Number(cleanStr);
  };

  // Actualiza un campo NUMÉRICO editable
  const handleAjusteNumerico = (trabajadorId, campo, valorTexto) => {
    const numValue = parseNumberValue(valorTexto);
    setAjustes((prev) => ({
      ...prev,
      [trabajadorId]: {
        ...prev[trabajadorId],
        [campo]: numValue,
      },
    }));
  };

  // Actualiza el campo de texto libre (observaciones)
  const handleObservacion = (trabajadorId, valor) => {
    setAjustes((prev) => ({
      ...prev,
      [trabajadorId]: {
        ...prev[trabajadorId],
        observaciones: valor,
      },
    }));
  };

  const dataConAjustes = useMemo(
    () =>
      detalleNominaPreview.map((t) => {
        const mapper = t;
        const ajusteTrabajador = ajustes[mapper.trabajadorId] ?? {};

        const bonificacion = ajusteTrabajador.bonificacion ?? 0;
        const deduccion = ajusteTrabajador.deduccion ?? 0;

        const transporte =
          ajusteTrabajador.transporte ?? valoresAutoNomina.transporte;
        const segSocial =
          ajusteTrabajador.segSocial ?? valoresAutoNomina.seguridadSocialTotal;

        const observaciones = ajusteTrabajador.observaciones ?? "";

        const conPendientes = incluirPendientes[mapper.trabajadorId] ?? false;

        const baseCalculada = conPendientes
          ? mapper.pagoPeriodo + mapper.valorPendientes
          : mapper.pagoPeriodo;

        const pagoReal =
          baseCalculada + transporte - segSocial + bonificacion - deduccion;

        return {
          ...mapper,
          bonificacion,
          deduccion,
          transporte,
          segSocial,
          observaciones,
          baseCalculada,
          pagoReal,
        };
      }),
    [detalleNominaPreview, ajustes, incluirPendientes, valoresAutoNomina],
  );

  const datosFiltrados = useMemo(() => {
    return dataConAjustes.filter(
      (t) =>
        t.nombre.toLowerCase().includes(search.toLowerCase()) ||
        t.documento.includes(search),
    );
  }, [dataConAjustes, search]);

  const datosPaginados = useMemo(() => {
    const offset = (page - 1) * limit;
    return datosFiltrados.slice(offset, offset + limit);
  }, [datosFiltrados, page, limit]);

  // TOTALES ACTUALIZADOS EN TIEMPO REAL
  const totales = datosFiltrados.reduce(
    (acc, t) => ({
      pagoBase: acc.pagoBase + t.baseCalculada,
      transporte: acc.transporte + t.transporte,
      segSocial: acc.segSocial + t.segSocial,
      bonificacion: acc.bonificacion + t.bonificacion,
      deduccion: acc.deduccion + t.deduccion,
      pagoReal: acc.pagoReal + t.pagoReal,
    }),
    {
      pagoBase: 0,
      transporte: 0,
      segSocial: 0,
      bonificacion: 0,
      deduccion: 0,
      pagoReal: 0,
    },
  );

  const handleRowClick = (row) => {
    const tieneTareasPeriodoActual = row.pagoPeriodo > 0;
    const tienePendientesIncluidos =
      row.valorPendientes > 0 && (incluirPendientes[row.trabajadorId] ?? false);

    if (tieneTareasPeriodoActual || tienePendientesIncluidos) {
      setTrabajadorSeleccionado(row);
    } else {
      console.log(
        "No hay información de tareas para auditar en este empleado.",
      );
    }
  };

  const columns = [
    {
      key: "documento",
      label: "Identificación",
      className: "col-sh",
    },
    {
      key: "nombre",
      label: "Nombre",
      className: "col-main",
    },
    {
      key: "pagoPeriodo",
      label: "Pago base",
      className: "col-num col-pago-base",
      render: (row) => (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: "4px",
          }}
        >
          <span style={{ fontWeight: "600" }}>
            {formatCOP(row.baseCalculada)}
          </span>

          {row.valorPendientes > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "var(--font-small)",
                background: "#f3f4f6",
                padding: "4px 8px",
                borderRadius: "6px",
              }}
            >
              <span style={{ color: "#6b7280", fontWeight: "500" }}>
                Pendientes: {formatCOP(row.valorPendientes)}
              </span>
              <label
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  cursor: "pointer",
                  position: "relative",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  type="checkbox"
                  checked={incluirPendientes[row.trabajadorId] ?? false}
                  onChange={() => togglePendientes(row.trabajadorId)}
                  style={{
                    cursor: "pointer",
                    width: "15px",
                    height: "15px",
                    accentColor: "var(--neutral-600)",
                  }}
                />
                <span
                  style={{
                    marginLeft: "4px",
                    fontSize: "var(--font-small)",
                    fontWeight: "700",
                    color: incluirPendientes[row.trabajadorId]
                      ? "#16a34a"
                      : "#4b5563",
                  }}
                >
                  {incluirPendientes[row.trabajadorId] ? "INCLUIDO" : "INCLUIR"}
                </span>
              </label>
            </div>
          )}
        </div>
      ),
    },
    {
      key: "transporte",
      label: "Transporte",
      className: "col-num col-transporte",
      render: (row) => (
        <div className="input-wrapper">
          <span className="currency-prefix">$</span>
          <input
            className="nomina-input-ajuste nomina-input-transporte"
            type="text"
            inputMode="numeric"
            value={formatDisplayNumber(row.transporte)}
            onChange={(e) =>
              handleAjusteNumerico(
                row.trabajadorId,
                "transporte",
                e.target.value,
              )
            }
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      ),
    },
    {
      key: "segSocial",
      label: "EPS",
      className: "col-num col-seg-social",
      render: (row) => (
        <div className="input-wrapper">
          <span className="currency-prefix">−$</span>
          <input
            className="nomina-input-ajuste nomina-input-seg-social"
            type="text"
            inputMode="numeric"
            value={formatDisplayNumber(row.segSocial)}
            onChange={(e) =>
              handleAjusteNumerico(
                row.trabajadorId,
                "segSocial",
                e.target.value,
              )
            }
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      ),
    },
    {
      key: "bonificacion",
      label: "Bonificaciones",
      className: "col-num col-bonificacion",
      render: (row) => {
        const val = ajustes[row.trabajadorId]?.bonificacion;
        return (
          <div className="input-wrapper">
            {val > 0 && <span className="currency-prefix">$</span>}
            <input
              className="nomina-input-ajuste nomina-input-bonificacion"
              type="text"
              inputMode="numeric"
              value={formatDisplayNumber(val)}
              placeholder="—"
              onChange={(e) =>
                handleAjusteNumerico(
                  row.trabajadorId,
                  "bonificacion",
                  e.target.value,
                )
              }
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        );
      },
    },
    {
      key: "deduccion",
      label: "Deducciones",
      className: "col-num col-deduccion",
      render: (row) => {
        const val = ajustes[row.trabajadorId]?.deduccion;
        return (
          <div className="input-wrapper">
            {val > 0 && <span className="currency-prefix">$</span>}
            <input
              className="nomina-input-ajuste nomina-input-deduccion"
              type="text"
              inputMode="numeric"
              value={formatDisplayNumber(val)}
              placeholder="—"
              onChange={(e) =>
                handleAjusteNumerico(
                  row.trabajadorId,
                  "deduccion",
                  e.target.value,
                )
              }
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        );
      },
    },
    {
      key: "pagoReal",
      label: "Pago real",
      className: "col-num col-pago-real",
      render: (row) => (
        <span style={{ fontWeight: "700" }}>{formatCOP(row.pagoReal)}</span>
      ),
    },
    {
      key: "observaciones",
      label: "Observaciones",
      className: "col-observaciones",
      render: (row) => (
        <textarea
          className="nomina-textarea-observaciones"
          rows={2}
          placeholder={"Ej: debe $10.000\nreparación $39.000"}
          value={row.observaciones}
          onChange={(e) => handleObservacion(row.trabajadorId, e.target.value)}
          onClick={(e) => e.stopPropagation()}
        />
      ),
    },
  ];

  const footer = [
    { className: "col-sh celda-oculta", content: "" },
    { className: "col-main table-footer-label", content: "Total" },
    {
      className: "col-num col-pago-base",
      content: formatCOP(totales.pagoBase),
    },
    {
      className: "col-num col-transporte",
      content: formatCOP(totales.transporte),
    },
    {
      className: "col-num col-seg-social",
      content: `−${formatCOP(totales.segSocial)}`,
    },
    {
      className: "col-num col-bonificacion",
      content: formatCOP(totales.bonificacion),
    },
    {
      className: "col-num col-deduccion",
      content: formatCOP(totales.deduccion),
    },
    {
      className: "col-num col-pago-real",
      content: formatCOP(totales.pagoReal),
    },
    { className: "col-observaciones", content: "" },
  ];

  const handlePaso = (numero) => {
    const rutas = {
      1: "/gerente/nomina/fecha",
      2: "/gerente/nomina/detalle",
      3: "/gerente/nomina/exportar",
    };
    navigate(rutas[numero], { state: { fechaInicio, fechaFin } });
  };

  return (
    <div className="page-conten-nomina">
      <div className="header-page">
        <h1 className="page-tittle">Generar nueva nómina</h1>
        <p className="page-mini-info">
          Revisión de salarios, novedades y previsualización de pagos
        </p>
      </div>
      <div className="page-nomina-stepper">
        <StepperNomina pasoActual={2} onSelectPaso={handlePaso} />
      </div>
      <div className="page-detalle-nomina-body">
        <Card>
          <div className="page-detalle-nomina-card">
            <h3 className="page-detalle-nomina-subtittle">Pagos y ajustes</h3>
            <p className="page-detalle-nomina-info">
              Revisa el pago correspondiente a cada empleado.
            </p>
            <TableHeader searchValue={search} onSearchChange={setSearch} />

            {loading ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "60px 0",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    border: "4px solid var(--neutral-200)",
                    borderTop: "4px solid var(--neutral-600)",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                  }}
                />
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                <p
                  style={{
                    color: "var(--neutral-600)",
                    fontSize: "var(--font-body)",
                    fontWeight: "500",
                  }}
                >
                  Cargando previsualización de nómina...
                </p>
              </div>
            ) : (
              <>
                <Table
                  columns={columns}
                  data={datosPaginados}
                  rowKey="trabajadorId"
                  onRowClick={handleRowClick}
                  selectedId={trabajadorSeleccionado?.trabajadorId}
                  footer={footer}
                  footerSpacer
                />
                <div className="nomina-paginacion">
                  <Pagination
                    totalItems={datosFiltrados.length}
                    limit={limit}
                    page={page}
                    onPageChange={setPage}
                    onLimitChange={setLimit}
                  />
                </div>
              </>
            )}
          </div>
        </Card>
      </div>
      <AuditoriaNominaDrawer
        isOpen={!!trabajadorSeleccionado}
        onClose={() => setTrabajadorSeleccionado(null)}
        trabajador={trabajadorSeleccionado}
        fechaInicio={fechaInicio}
        fechaFin={fechaFin}
        incluirPendientes={
          incluirPendientes[trabajadorSeleccionado?.trabajadorId] ?? false
        }
      />
      <div className="page-nomina-footer">
        <button
          className="btn btn-primary nomina-btn-continuar"
          onClick={() => {
            const ajustesFinales = dataConAjustes.map((t) => ({
              trabajador_id: t.trabajadorId,
              bonificacion: t.bonificacion,
              deduccion: t.deduccion,
              transporte: t.transporte,
              seguridad_social: t.segSocial,
              observaciones: t.observaciones,
              incluir_pendientes: incluirPendientes[t.trabajadorId] ?? false,
            }));

            navigate("/gerente/nomina/exportar", {
              state: { fechaInicio, fechaFin, ajustes: ajustesFinales },
            });
          }}
          disabled={loading}
        >
          {loading ? "Cargando..." : "Generar nómina"}
        </button>
      </div>
    </div>
  );
}
