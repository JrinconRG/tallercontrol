const pad = (n) => String(n).padStart(2, "0");

const aFecha = (valor) => {
  if (!valor) return null;
  // "2026-08-19" sin hora: se arma en hora local para que no retroceda un día
  const fecha = /^\d{4}-\d{2}-\d{2}$/.test(String(valor))
    ? new Date(`${valor}T00:00:00`)
    : new Date(valor);
  return Number.isNaN(fecha.getTime()) ? null : fecha;
};

/** dd/mm/yy  →  21/11/26 */
export const formatFechaCorta = (valor) => {
  const f = aFecha(valor);
  if (!f) return "—";
  return `${pad(f.getDate())}/${pad(f.getMonth() + 1)}/${String(f.getFullYear()).slice(-2)}`;
};

/** dd/mm/yy HH:mm  →  21/11/26 20:20 */
export const formatFechaHora = (valor) => {
  const f = aFecha(valor);
  if (!f) return "—";
  return `${formatFechaCorta(f)} ${pad(f.getHours())}:${pad(f.getMinutes())}`;
};

/** dd/mm/yy — dd/mm/yy */
export const formatPeriodo = (inicio, fin) => {
  if (!aFecha(inicio) || !aFecha(fin)) return "—";
  return `${formatFechaCorta(inicio)} — ${formatFechaCorta(fin)}`;
};
