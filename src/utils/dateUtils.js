/**
 * Convierte cualquier string de fecha de la BD (con/sin hora, UTC o local)
 * a un objeto Date local respetando el año, mes y día textuales.
 * Evita desfasajes de zona horaria (UTC-5 Colombia, etc).
 *
 * @param {string | Date} fecha
 * @returns {Date | null}
 */
export function parseFechaLocal(fecha) {
  if (!fecha) return null;
  if (fecha instanceof Date) return fecha;

  // Si viene algo como "2026-08-06 05:00:00+00" o "2026-08-10"
  const str = String(fecha).trim();
  const fechaLimpia = str.split("T")[0].split(" ")[0]; // Obtiene solo "YYYY-MM-DD"
  const [year, month, day] = fechaLimpia.split("-").map(Number);

  if (!year || !month || !day) return null;

  // Retorna Date local exacto a medianoche 00:00:00
  return new Date(year, month - 1, day);
}

/**
 * Normaliza un string ISO/PostgreSQL para cálculos de diferencia de tiempo.
 * Reemplaza espacios por 'T' para evitar errores de parseo en Safari/Firefox.
 *
 * @param {string | Date} fecha
 * @returns {Date}
 */
export function normalizarFechaUTC(fecha) {
  if (!fecha) return new Date();
  if (fecha instanceof Date) return fecha;

  let str = String(fecha).trim();

  // Reemplazar espacio entre fecha y hora por 'T' si existe
  if (str.includes(" ") && !str.includes("T")) {
    str = str.replace(" ", "T");
  }

  // Si no especifica zona horaria, asumimos UTC agregando 'Z'
  if (!str.includes("Z") && !str.includes("+") && !str.includes("-", 10)) {
    str += "Z";
  }

  return new Date(str);
}

export const aFechaYMD = (valor) => {
  if (!valor) return null;
  if (typeof valor === "string" && /^\d{4}-\d{2}-\d{2}$/.test(valor))
    return valor;
  const d = valor instanceof Date ? valor : new Date(valor);
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};
