import { useEffect, useRef, useState } from "react";
import { useGetDetalleNominaGenerada } from "./useObtenerNominaGenerada";
import { useGetTareasNomina } from "./useObtenerTareasNomina";
import { generarPDFNomina } from "../../../../utils/generarPDFNomina";
import { generarExcelNomina } from "../../../../utils/generarExcelNomina.js";
import { useToast } from "../../../../hooks/useToast";
import { getAppErrorMessage } from "../../../../shared/errors/getAppErrorMessage";

const MENSAJES_OK = {
  pdf: ["PDF generado", "La nómina se descargó correctamente."],
  excel: ["Excel generado", "Se descargó una hoja por cada trabajador."],
};

/**
 * Descarga una nómina ya generada (historial) en PDF o Excel.
 *   descargar("pdf") | descargar("excel")
 * - PDF: usa el detalle por trabajador.
 * - Excel: además necesita las tareas (cofres/fases) de la nómina.
 */
export function useDescargarNomina(nomina) {
  const [formatoActivo, setFormatoActivo] = useState(null);
  const generando = useRef(false);
  const { showError, showSuccess } = useToast();

  const nominaId = formatoActivo ? nomina.nominaId : null;
  const { detalleNominaGenerada, loading: cargandoDetalle } =
    useGetDetalleNominaGenerada(nominaId);
  // Las tareas solo se piden cuando el formato es Excel
  const { tareasNomina, loading: cargandoTareas } = useGetTareasNomina(
    formatoActivo === "excel" ? nomina.nominaId : null,
  );

  useEffect(() => {
    if (!formatoActivo || cargandoDetalle || !detalleNominaGenerada?.length) {
      return;
    }
    if (
      formatoActivo === "excel" &&
      (cargandoTareas || !Array.isArray(tareasNomina))
    ) {
      return;
    }
    // Evita generar dos veces (StrictMode o re-render mientras se arma el archivo)
    if (generando.current) return;
    generando.current = true;

    (async () => {
      try {
        if (formatoActivo === "pdf") {
          generarPDFNomina({
            cabecera: nomina,
            trabajadores: detalleNominaGenerada,
          });
        } else {
          await generarExcelNomina({
            cabecera: nomina,
            trabajadores: detalleNominaGenerada,
            tareas: tareasNomina,
          });
        }
        showSuccess(...MENSAJES_OK[formatoActivo]);
      } catch (error) {
        showError("No se pudo generar el archivo", getAppErrorMessage(error));
      } finally {
        generando.current = false;
        setFormatoActivo(null);
      }
    })();
  }, [
    formatoActivo,
    cargandoDetalle,
    cargandoTareas,
    detalleNominaGenerada,
    tareasNomina,
    nomina,
    showError,
    showSuccess,
  ]);

  return { descargar: setFormatoActivo, formatoActivo };
}
