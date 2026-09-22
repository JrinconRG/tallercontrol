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

export default function DetalleNomina() {
  const navigate = useNavigate();
  const location = useLocation();
  const [trabajadorSeleccionado, setTrabajadorSeleccionado] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [incluirPendientes, setIncluirPendientes] = useState({});
  const [search, setSearch] = useState("");
  const [ajustes, setAjustes] = useState({});

  useEffect(() => {
    setPage(1);
  }, [search]);

  const togglePendientes = (trabajadorId) => {
    setIncluirPendientes((prev) => ({
      ...prev,
      [trabajadorId]: !prev[trabajadorId],
    }));
  };

  const bloqueadorCaracteres = (e) => {
    if (["-", "e", "E", ".", ","].includes(e.key)) {
      e.preventDefault();
    }
  };

  const { fechaInicio, fechaFin } = location.state ?? {};

  const { detalleNominaPreview = [], loading } = useGetDetalleNominaPreview(
    fechaInicio,
    fechaFin,
  );

  const handleAjuste = (trabajadorId, campo, valor) => {
    setAjustes((prev) => ({
      ...prev,
      [trabajadorId]: {
        ...prev[trabajadorId],
        [campo]: valor === "" ? 0 : Number(valor),
      },
    }));
  };

  const dataConAjustes = useMemo(
    () =>
      detalleNominaPreview.map((t) => {
        const mapper = t;
        const bonificacion = ajustes[mapper.trabajadorId]?.bonificacion ?? 0;
        const deduccion = ajustes[mapper.trabajadorId]?.deduccion ?? 0;

        const conPendientes = incluirPendientes[mapper.trabajadorId] ?? false;

        // Base calculada: Si se incluyen pendientes, sumamos el valor acumulado al pagoPeriodo
        const baseCalculada = conPendientes
          ? mapper.pagoPeriodo + mapper.valorPendientes
          : mapper.pagoPeriodo;

        return {
          ...mapper,
          bonificacion,
          deduccion,
          baseCalculada,
          pagoReal: baseCalculada + bonificacion - deduccion,
        };
      }),
    [detalleNominaPreview, ajustes, incluirPendientes],
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

  // 2. TOTALES ACTUALIZADOS EN TIEMPO REAL
  const totales = datosFiltrados.reduce(
    (acc, t) => ({
      pagoBase: acc.pagoBase + t.baseCalculada,
      bonificacion: acc.bonificacion + t.bonificacion,
      deduccion: acc.deduccion + t.deduccion,
      pagoReal: acc.pagoReal + t.pagoReal,
    }),
    { pagoBase: 0, bonificacion: 0, deduccion: 0, pagoReal: 0 },
  );

  // 3. CONTROLADOR INTELIGENTE DE RENDERIZADO DEL DRAWER
  const handleRowClick = (row) => {
    const tieneTareasPeriodoActual = row.pagoPeriodo > 0;
    const tienePendientesIncluidos =
      row.valorPendientes > 0 && (incluirPendientes[row.trabajadorId] ?? false);

    // Si tiene liquidación en este mes, o si tiene acumulados viejos y el usuario los "Aceptó" con el checkbox
    if (tieneTareasPeriodoActual || tienePendientesIncluidos) {
      setTrabajadorSeleccionado(row);
    } else {
      // Feedback opcional: Aquí podrías disparar un toast o simplemente dejarlo inactivo (lo ideal)
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
      className: "col-num",
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
              type="number"
              min="0"
              onKeyDown={bloqueadorCaracteres}
              value={val ?? ""}
              placeholder="—"
              onChange={(e) =>
                handleAjuste(row.trabajadorId, "bonificacion", e.target.value)
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
              type="number"
              min="0"
              value={val ?? ""}
              onKeyDown={bloqueadorCaracteres}
              placeholder="—"
              onChange={(e) =>
                handleAjuste(row.trabajadorId, "deduccion", e.target.value)
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
      className: "col-num",
      render: (row) => formatCOP(row.pagoReal),
    },
  ];

  const formatCOP = (val) => "$" + Number(val).toLocaleString("es-CO");

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
              Revisa el pago correspondiente a cada empleado y aplica
              bonificaciones o deducciones cuando sea necesario
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
              <div className="table-responsive-wrapper">
                <Table
                  columns={columns}
                  data={datosPaginados}
                  rowKey="trabajadorId"
                  onRowClick={handleRowClick}
                  selectedId={trabajadorSeleccionado?.trabajadorId}
                />
                <Pagination
                  totalItems={datosFiltrados.length}
                  limit={limit}
                  page={page}
                  onPageChange={setPage}
                  onLimitChange={setLimit}
                />

                <div className="contenedor-totales-independiente">
                  <table className="custom-table tabla-totales-separada">
                    <tbody>
                      <tr className="table-footer-row">
                        <td className="col-sh celda-oculta"></td>
                        <td className="col-main table-footer-label">Total</td>
                        <td className="col-num">
                          {formatCOP(totales.pagoBase)}
                        </td>
                        <td className="col-num col-bonificacion table-footer-bon">
                          {formatCOP(totales.bonificacion)}
                        </td>
                        <td className="col-num col-deduccion table-footer-ded">
                          {formatCOP(totales.deduccion)}
                        </td>
                        <td className="col-num">
                          {formatCOP(totales.pagoReal)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
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
              incluir_pendientes: incluirPendientes[t.trabajadorId] ?? false,
            }));

            console.log("incluirPendientes estado:", incluirPendientes);
            console.log(
              "ajustes finales:",
              JSON.stringify(ajustesFinales, null, 2),
            );

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
