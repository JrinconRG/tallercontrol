/**
 * Convierte minutos acumulados en un string legible de días (24h), horas y minutos.
 * @param {number | string} minutosTotales - Cantidad de minutos a formatear
 * @returns {string} Ej: "47d 10h 58m", "15m", "0m"
 */
export const formatearMinutosA_DHMS = (minutosTotales) => {
  const minutos = Math.round(Number(minutosTotales));

  if (Number.isNaN(minutos) || minutos <= 0) return "0m";

  // 1. Obtener las horas completas y los minutos que sobran
  const horasTotales = Math.floor(minutos / 60);
  const minutosRestantes = minutos % 60;

  // 2. Obtener los días reales (de 24 horas continuas) y las horas que sobran
  const dias = Math.floor(horasTotales / 24);
  const horasRestantes = horasTotales % 24;

  // 3. Construir el string dinámico para no mostrar "0d" o "0h" si no es necesario
  let resultado = "";
  if (dias > 0) resultado += `${dias}d `;
  if (horasRestantes > 0 || dias > 0) resultado += `${horasRestantes}h `;
  resultado += `${minutosRestantes}m`;

  return resultado.trim();
};
