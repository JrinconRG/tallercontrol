/**
 * calculosNomina.js
 *
 * Cálculos automáticos de rubros de nómina (seguridad social y auxilio de
 * transporte) según la normativa colombiana vigente.
 *
 * IMPORTANTE — mantenimiento anual:
 * El SMMLV y el auxilio de transporte los fija el Gobierno cada año
 * (usualmente en diciembre, vigentes desde el 1 de enero). Cuando cambien,
 * actualiza SOLO las constantes de `VALORES_LEGALES_POR_ANIO` de abajo;
 * el resto del módulo no necesita tocarse.
 *
 * Estos valores son un PUNTO DE PARTIDA automático: en la UI siempre deben
 * quedar en un campo editable, porque cada nómina puede tener ajustes
 * manuales particulares.
 */

// ---------------------------------------------------------------------------
// Valores legales por año (fuente: Decretos del Ministerio de Trabajo)
// ---------------------------------------------------------------------------
const VALORES_LEGALES_POR_ANIO = {
  2026: {
    smmlv: 1_750_905,
    auxilioTransporteMensual: 249_095,
  },
  // 2027: { smmlv: ..., auxilioTransporteMensual: ... },
};

const ANIO_POR_DEFECTO = 2026;

// Porcentajes de aporte del trabajador (Ley 100 de 1993)
const PORCENTAJE_SALUD = 0.04;
const PORCENTAJE_PENSION = 0.04;

// Convención de "mes comercial" usada en nómina en Colombia: todo mes se
// asume de 30 días, y el periodo de pago (semanal) se calcula en 7 días
// CALENDARIO — no importa cuántos días se trabajen realmente esa semana
// (ej. lunes a sábado). Esta es la convención legal estándar, confirmada
// contra las planillas reales de la empresa (valores de EPS y transporte
// calzan exacto usando esta fórmula, no dividiendo por semanas reales).
const DIAS_MES_COMERCIAL = 30;
const DIAS_PERIODO_PAGO = 7;

// ---------------------------------------------------------------------------
// Helpers internos
// ---------------------------------------------------------------------------

/**
 * Obtiene los valores legales (SMMLV, auxilio de transporte) de un año.
 * Si el año no está registrado, cae al último año disponible y avisa por consola
 * en vez de romper la app con un cálculo en $0.
 */
function obtenerValoresLegales(anio = ANIO_POR_DEFECTO) {
  const valores = VALORES_LEGALES_POR_ANIO[anio];
  if (valores) return valores;

  const anioMasReciente = Math.max(
    ...Object.keys(VALORES_LEGALES_POR_ANIO).map(Number),
  );
  console.warn(
    `[calculosNomina] No hay valores legales registrados para ${anio}. ` +
      `Usando ${anioMasReciente} como referencia. Actualiza VALORES_LEGALES_POR_ANIO.`,
  );
  return VALORES_LEGALES_POR_ANIO[anioMasReciente];
}

/**
 * Convierte un valor mensual a su equivalente semanal, redondeado a pesos,
 * usando la convención de mes comercial (30 días) y periodo de pago de
 * 7 días calendario: valor mensual ÷ 30 × 7.
 */
function mensualASemanal(
  valorMensual,
  diasMesComercial = DIAS_MES_COMERCIAL,
  diasPeriodoPago = DIAS_PERIODO_PAGO,
) {
  return Math.round((valorMensual / diasMesComercial) * diasPeriodoPago);
}

// ---------------------------------------------------------------------------
// API pública
// ---------------------------------------------------------------------------

/**
 * Calcula el aporte semanal de salud (4% del SMMLV), prorrateado con la
 * convención de mes comercial de 30 días.
 * @param {number} [anio] - Año de referencia legal.
 */
export function calcularSaludSemanal(anio = ANIO_POR_DEFECTO) {
  const { smmlv } = obtenerValoresLegales(anio);
  return mensualASemanal(smmlv * PORCENTAJE_SALUD);
}

/**
 * Calcula el aporte semanal de pensión (4% del SMMLV), prorrateado con la
 * convención de mes comercial de 30 días.
 * @param {number} [anio] - Año de referencia legal.
 */
export function calcularPensionSemanal(anio = ANIO_POR_DEFECTO) {
  const { smmlv } = obtenerValoresLegales(anio);
  return mensualASemanal(smmlv * PORCENTAJE_PENSION);
}

/**
 * Calcula el auxilio de transporte semanal, prorrateado con la convención
 * de mes comercial de 30 días.
 * @param {number} [anio] - Año de referencia legal.
 */
export function calcularTransporteSemanal(anio = ANIO_POR_DEFECTO) {
  const { auxilioTransporteMensual } = obtenerValoresLegales(anio);
  return mensualASemanal(auxilioTransporteMensual);
}

/**
 * Calcula todos los valores automáticos de nómina de una sola vez.
 * Es la función que normalmente se llama desde la UI para prellenar
 * los campos editables de un trabajador.
 *
 * @param {Object} [opciones]
 * @param {number} [opciones.anio] - Año de referencia legal.
 * @returns {{ salud: number, pension: number, seguridadSocialTotal: number, transporte: number }}
 */
export function obtenerValoresAutomaticosNomina({
  anio = ANIO_POR_DEFECTO,
} = {}) {
  const salud = calcularSaludSemanal(anio);
  const pension = calcularPensionSemanal(anio);
  const transporte = calcularTransporteSemanal(anio);

  return {
    salud,
    pension,
    seguridadSocialTotal: salud + pension,
    transporte,
  };
}
