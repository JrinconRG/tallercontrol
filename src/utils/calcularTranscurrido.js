import { formatearMinutosA_DHMS } from "./timeFormatter";
import { normalizarFechaUTC } from "./dateUtils";

export function calcularTiempoTranscurrido(
  fechaInicio,
  fechaFin = null,
  textoVacio = "0m",
) {
  if (!fechaInicio) return textoVacio;

  // Preserva hora, minutos y segundos exactos
  const inicio = normalizarFechaUTC(fechaInicio);
  const fin = fechaFin ? normalizarFechaUTC(fechaFin) : new Date();

  if (Number.isNaN(inicio.getTime()) || Number.isNaN(fin.getTime())) {
    return "Fecha inválida";
  }

  // Diferencia exacta en milisegundos
  const diferenciaMs = fin.getTime() - inicio.getTime();
  if (diferenciaMs <= 0) return "0m";

  const minutosTotales = Math.floor(diferenciaMs / 60000);
  return formatearMinutosA_DHMS(minutosTotales);
}
