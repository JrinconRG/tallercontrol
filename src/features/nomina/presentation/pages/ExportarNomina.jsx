import StepperNomina from "../../../../components/Stepper/StepperNomina";
import Card from "../../../../components/card/Card";
import { useNavigate, useLocation } from "react-router-dom";
import { Icon } from "../../../../components/ui/Icon";
import { useEffect, useRef, useState } from "react";
import { useGenerarNomina } from "../../application/hooks/useGenerarNomina";
import { useGetDetalleNominaGenerada } from "../../application/hooks/useObtenerNominaGenerada";
import { useGetTareasNomina } from "../../application/hooks/useObtenerTareasNomina";
import { generarPDFNomina } from "../../../../utils/generarPDFNomina";
import { generarExcelNomina } from "../../../../utils/generarExcelNomina";
import "./ExportarNomina.css";
import { useAuthStore } from "../../../../stores/authStore";
import { useToast } from "../../../../hooks/useToast";
import { getAppErrorMessage } from "../../../../shared/errors/getAppErrorMessage";

const formatCOP = (val) => "$" + Number(val).toLocaleString("es-CO");

export default function ExportarNomina() {
  const ejecucionIniciada = useRef(false);
  const [dataNomina, setDataNomina] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [generandoExcel, setGenerandoExcel] = useState(false);
  const { showError, showSuccess } = useToast();

  const { user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { fechaInicio, fechaFin, ajustes } = location.state ?? {};

  const { generarNomina, errorMessage } = useGenerarNomina();

  const resultado = Array.isArray(dataNomina) ? dataNomina[0] : dataNomina;
  const nominaId = resultado?.nominaId ?? null;

  const { detalleNominaGenerada, loading: loadingDetalle } =
    useGetDetalleNominaGenerada(nominaId);

  const { tareasNomina, loading: loadingTareas } = useGetTareasNomina(nominaId);

  useEffect(() => {
    if (fechaInicio && fechaFin && !ejecucionIniciada.current) {
      ejecucionIniciada.current = true;
      setCargando(true);
      generarNomina({ fechaInicio, fechaFin, generadaPor: user?.id, ajustes })
        .then((res) => {
          setDataNomina(res);
          setCargando(false);
        })
        .catch((error) => {
          showError("No se pudo generar la nómina", getAppErrorMessage(error));
          setCargando(false);
        });
    }
  }, []);

  const handleDescargarPDF = () => {
    if (!resultado || !detalleNominaGenerada?.length) {
      showError(
        "PDF no disponible",
        "Los datos de la nómina aún no están listos.",
      );
      return;
    }
    generarPDFNomina({
      cabecera: resultado,
      trabajadores: detalleNominaGenerada,
    });
    showSuccess("PDF generado", "La nómina se descargó correctamente.");
  };

  const handleDescargarExcel = async () => {
    if (!resultado || !detalleNominaGenerada?.length) {
      showError(
        "Excel no disponible",
        "Los datos de la nómina aún no están listos.",
      );
      return;
    }
    try {
      setGenerandoExcel(true);
      await generarExcelNomina({
        cabecera: resultado,
        trabajadores: detalleNominaGenerada,
        tareas: tareasNomina,
      });
      showSuccess(
        "Excel generado",
        "Se descargó una hoja por cada trabajador.",
      );
    } catch (error) {
      showError("No se pudo generar el Excel", getAppErrorMessage(error));
    } finally {
      setGenerandoExcel(false);
    }
  };

  // — ESTADO: Cargando —
  if (cargando && !errorMessage) {
    return (
      <div className="page-conten-nomina">
        <div className="header-page">
          <h1 className="page-tittle">Generar nueva nómina</h1>
          <p className="page-mini-info">
            Procesando la nómina, por favor espera...
          </p>
        </div>
        <div className="page-nomina-stepper">
          <StepperNomina pasoActual={3} />
        </div>
        <div className="nomina-estado-centrado">
          <div className="nomina-spinner" />
          <p className="nomina-estado-texto">Generando nómina...</p>
        </div>
      </div>
    );
  }

  // — ESTADO: Error —
  if (errorMessage) {
    return (
      <div className="page-conten-nomina">
        <div className="header-page">
          <h1 className="page-tittle">Generar nueva nómina</h1>
          <p className="page-mini-info">
            Ocurrió un problema al generar la nómina
          </p>
        </div>
        <div className="page-nomina-stepper">
          <StepperNomina pasoActual={3} />
        </div>
        <div className="nomina-estado-centrado">
          <div className="error-card">
            <Icon name="CircleX" size={48} color="var(--error-600)" />
            <h2 className="error-titulo">No se pudo generar la nómina</h2>
            <p className="error-mensaje">{errorMessage}</p>
            <div className="error-acciones">
              <button
                className="btn btn-secondary"
                onClick={() => navigate("/gerente/nomina/fecha")}
              >
                Volver al inicio
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // — ESTADO: Éxito —
  return (
    <div className="page-conten-nomina">
      <div className="header-page">
        <h1 className="page-tittle">Generar nueva nómina</h1>
        <p className="page-mini-info">
          Aquí podrás exportar la nómina generada
        </p>
      </div>
      <div className="page-nomina-stepper">
        <StepperNomina pasoActual={3} />
      </div>

      <div className="page-detalle-nomina-body">
        <div className="mensaje-confirmacion">
          <div className="confirmacion-card">
            <Icon name="Check" size={50} color="var(--success-600)" />
            <h2 className="confirmacion-nomina">
              La nómina ha sido generada con éxito
            </h2>
          </div>
        </div>

        <Card>
          <div className="page-nomina-info-contenedor">
            <h3 className="page-nomina-subtittle">
              Información general de la nómina generada
            </h3>
            <div className="page-nomina-info-general">
              <div className="page-nomina-info-item">
                <p className="page-nomina-info-label">
                  <Icon name="Users" color="var(--neutral-700)" size="25" />
                  Total de empleados:
                </p>
                <p className="page-nomina-info-value">
                  {resultado?.totalTrabajadores ?? 0}
                </p>
              </div>
              <div className="page-nomina-info-item">
                <p className="page-nomina-info-label">
                  <Icon
                    name="CircleDollarSign"
                    color="var(--neutral-700)"
                    size="25"
                  />
                  Total a pagar:
                </p>
                <p className="page-nomina-info-value">
                  {formatCOP(resultado?.totalPago ?? 0)}
                </p>
              </div>
              <div className="page-nomina-info-item">
                <p className="page-nomina-info-label">
                  <Icon
                    name="CalendarDays"
                    color="var(--neutral-700)"
                    size="25"
                  />
                  Periodo:
                </p>
                <p className="page-nomina-info-value">
                  {resultado?.fechaInicio?.slice(0, 10)} —{" "}
                  {resultado?.fechaFin?.slice(0, 10)}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="page-nomina-info-general">
            <div className="titulo-nomina-info">
              <h3 className="page-nomina-subtittle">Exportar archivos</h3>
              <p className="page-nomina-exportar-info">
                El PDF trae el resumen general de la nómina. El Excel trae una
                hoja por cada trabajador, con el detalle de lo que realizó.
              </p>
            </div>
            <div
              className="page-nomina-exportar-boton"
              style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}
            >
              <button
                className="btn btn-primary"
                onClick={handleDescargarPDF}
                disabled={loadingDetalle || !detalleNominaGenerada?.length}
              >
                <Icon name="Download" color="white" size="20" />
                {loadingDetalle ? "Obteniendo datos..." : "Descargar PDF"}
              </button>

              <button
                className="btn btn-secondary"
                onClick={handleDescargarExcel}
                disabled={
                  loadingDetalle ||
                  loadingTareas ||
                  generandoExcel ||
                  !detalleNominaGenerada?.length
                }
              >
                <Icon name="FileSpreadsheet" size="20" />
                {generandoExcel
                  ? "Generando..."
                  : loadingTareas
                    ? "Obteniendo datos..."
                    : "Descargar Excel"}
              </button>
            </div>
          </div>
        </Card>
      </div>

      <div className="page-nomina-footer">
        <button
          className="btn btn-primary nomina-btn-continuar"
          onClick={() => navigate("/gerente/nomina/fecha")}
        >
          Finalizar
        </button>
      </div>
    </div>
  );
}
