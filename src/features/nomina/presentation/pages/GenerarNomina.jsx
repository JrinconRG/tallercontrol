import StepperNomina from "../../../../components/Stepper/StepperNomina";
import Card from "../../../../components/card/Card";
import DatePicker from "../../../../components/DatePicker/DatePicker";
import { useNavigate, useLocation } from "react-router-dom";
import "./GenerarNomina.css";
import { Icon } from "../../../../components/ui/Icon";
import { useGetResumenNomina } from "../../application/hooks/useObtenerResumenNomina";
import { useGetHistorialNominas } from "../../application/hooks/useObtenerHistorialNominas";
import { useState, useMemo } from "react";
import { parseFechaLocal } from "../../../../utils/dateUtils";

export default function GenerarNomina() {
  const navigate = useNavigate();
  const location = useLocation();
  const { fechaInicio, fechaFin } = location.state ?? {};
  const { nominasHistoricas, loading: cargandoHistorial } =
    useGetHistorialNominas();

  console.log("nominasHistoricas", nominasHistoricas);

  const [fechas, setFechas] = useState({
    from: fechaInicio ?? null,
    to: fechaFin ?? null,
  });

  const rangosDeshabilitados = useMemo(() => {
    if (!nominasHistoricas || !Array.isArray(nominasHistoricas)) return [];

    return nominasHistoricas
      .map((nomina) => {
        const from = parseFechaLocal(nomina.fechaInicio);
        const to = parseFechaLocal(nomina.fechaFin);

        if (!from || !to) return null;
        return { from, to };
      })
      .filter(Boolean);
  }, [nominasHistoricas]);

  console.log("rangosDeshabilitados", rangosDeshabilitados);

  const { resumenNomina, loading } = useGetResumenNomina(
    fechas.from,
    fechas.to,
  );

  const handlePaso = (numero) => {
    const rutas = {
      1: "/gerente/nomina/fecha",
      2: "/gerente/nomina/detalle",
      3: "/gerente/nomina/exportar",
    };
    navigate(rutas[numero]);
  };

  return (
    <div className="page-conten-nomina">
      <div className="header-page">
        <h1 className="page-tittle">Generar nueva nomina</h1>
        <p className="page-mini-info">Liquidación y pagos automáticos</p>
      </div>
      <div className="page-nomina-stepper">
        <StepperNomina pasoActual={1} onSelectPaso={handlePaso} />
      </div>
      <div className="page-nomina-info">
        <div className="page-nomina-calendario">
          <Card>
            <div className="page-nomina-calendario-contenedor">
              {" "}
              <div className="page-nomina-calendario-header">
                <h3
                  className="page-nomina-subtittle"
                  style={{ marginBottom: "0.7rem" }}
                >
                  Días incluídos
                </h3>
                <p className="page-nomina-calendario-info">
                  Elige los días que formarán parte de esta nómina
                </p>
              </div>
              <div className="page-nomina-calendario-body">
                {cargandoHistorial ? (
                  <p>Cargando fechas de nóminas anteriores...</p>
                ) : (
                  <DatePicker
                    mode="range"
                    onChange={setFechas}
                    initialRange={fechas}
                    disabledRanges={rangosDeshabilitados}
                  />
                )}
              </div>
            </div>
          </Card>
        </div>
        <Card>
          <div className="page-nomina-info-contenedor">
            <h3 className="page-nomina-subtittle">
              Información general de la nómina generada
            </h3>
            <div className="page-nomina-info-general">
              <div className="page-nomina-info-item">
                <p className="page-nomina-info-label">
                  <Icon
                    name="CircleDollarSign"
                    color="var(--neutral-700)"
                    size={25}
                  />{" "}
                  Valor acumulado:
                </p>
                <p className="page-nomina-info-value">
                  {loading ? "..." : (resumenNomina?.totalValor ?? "—")}
                </p>
              </div>
              <div className="page-nomina-info-item">
                <p className="page-nomina-info-label">
                  <Icon name="Users" color="var(--neutral-700)" size={25} />{" "}
                  Total de trabajadores:
                </p>
                <p className="page-nomina-info-value">
                  {loading ? "..." : (resumenNomina?.totalTrabajadores ?? "—")}
                </p>
              </div>
              <div className="page-nomina-info-item">
                <p className="page-nomina-info-label">
                  <Icon name="BookCheck" color="var(--neutral-700)" size={25} />{" "}
                  Procesos realizados:
                </p>
                <p className="page-nomina-info-value">
                  {loading ? "..." : (resumenNomina?.totalProcesos ?? "—")}
                </p>
              </div>
            </div>

            {/* Celda de pendientes — solo aparece si hay */}
            {fechas.from &&
              fechas.to &&
              resumenNomina?.tienePendientesAnteriores && (
                <div className="nomina-alerta-pendientes">
                  <Icon name="TriangleAlert" size={18} color="var(--warning)" />
                  <div>
                    <p className="nomina-alerta-titulo">
                      Hay tareas sin pagar de periodos anteriores
                    </p>
                    <p className="nomina-alerta-detalle">
                      {resumenNomina.totalPendientesTareas} tareas · $
                      {resumenNomina.totalPendientesValor.toLocaleString(
                        "es-CO",
                      )}{" "}
                      pendientes — Podrás decidir si incluirlas en el siguiente
                      paso
                    </p>
                  </div>
                </div>
              )}
          </div>
        </Card>
      </div>
      {fechas.from && fechas.to && (
        <div className="page-nomina-footer">
          <button
            className="btn btn-primary nomina-btn-continuar"
            onClick={() =>
              navigate("/gerente/nomina/detalle", {
                state: { fechaInicio: fechas.from, fechaFin: fechas.to },
              })
            }
            disabled={loading}
          >
            {loading ? "Cargando..." : "Continuar"}
          </button>
        </div>
      )}
    </div>
  );
}
