/**
 * generarExcelNomina.js
 *
 * Excel de nómina: UNA HOJA POR TRABAJADOR, siguiendo el formato de las
 * planillas reales (nombre, mes, días, año, listado de cajas, y al final
 * transporte / subtotal / descuentos / pagar).
 *
 *
 * Datos esperados
 *   cabecera:     { fechaInicio, fechaFin }         (ISO con hora, o "YYYY-MM-DD")
 *   trabajadores: [{ trabajadorId, nombre, transporte, seguridadSocial,
 *                    bonificacion, deduccion, observaciones }]
 *   tareas:       [{ trabajadorId, codigoCofre, referencia, color, cargo, valor, dia }]
 *                 (resultado de fn_nomina_tareas; `dia` = "YYYY-MM-DD",
 *                 `cargo` = fase realizada, ej. "Tapizador", "Alistador")
 *
 * Los conceptos en 0 (por ejemplo, quien no lleva EPS o transporte) no se
 * pintan en la hoja.
 */

const TZ = "America/Bogota";

const MESES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];
const MESES_CORTOS = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
];

const FORMATO_PESOS = '"$"#,##0';
const BORDE = {
  top: { style: "thin" },
  left: { style: "thin" },
  bottom: { style: "thin" },
  right: { style: "thin" },
};

// "YYYY-MM-DD" en hora de Bogotá. Si ya viene sin hora, se deja igual para que
// no se corra un día por la conversión a UTC.
const dia = (iso) => {
  if (!iso) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
  return new Date(iso).toLocaleDateString("en-CA", { timeZone: TZ });
};

const partes = (ymd) => {
  const [y, m, d] = ymd.split("-").map(Number);
  return { y, m, d };
};

const etiquetaPeriodo = (inicioYmd, finYmd) => {
  const a = partes(inicioYmd);
  const b = partes(finYmd);
  const mismoMes = a.y === b.y && a.m === b.m;
  return {
    mes: mismoMes ? MESES[a.m - 1] : `${MESES[a.m - 1]} - ${MESES[b.m - 1]}`,
    rango: mismoMes
      ? `${a.d} al ${b.d}`
      : `${a.d} ${MESES_CORTOS[a.m - 1]} al ${b.d} ${MESES_CORTOS[b.m - 1]}`,
    anio: a.y === b.y ? String(a.y) : `${a.y} - ${b.y}`,
  };
};

// Excel: máx. 31 caracteres, sin \ / * ? : [ ], y sin repetidos
const nombreHoja = (nombre, usados) => {
  const base =
    String(nombre || "Trabajador")
      .replace(/[\\/*?:[\]]/g, "")
      .trim()
      .slice(0, 27) || "Trabajador";
  let candidato = base;
  let i = 2;
  while (usados.has(candidato.toLowerCase())) {
    candidato = `${base} ${i++}`;
  }
  usados.add(candidato.toLowerCase());
  return candidato;
};

const num = (v) => Number(v ?? 0);

// Columnas de la tabla de tareas: SERIE | FASE | DETALLE | COLOR | VALOR
const COL_SERIE = 1;
const COL_FASE = 2;
const COL_DETALLE = 3;
const COL_COLOR = 4;
const COL_VALOR = 5;
const COL_LABEL_CIERRE = 4; // etiquetas del cierre (TRANSPORTE, SUBTOTAL, etc.)
const COL_VALOR_CIERRE = 5;

function construirHoja(wb, hojaNombre, trabajador, tareas, periodo, inicioYmd) {
  const ws = wb.addWorksheet(hojaNombre, {
    pageSetup: {
      orientation: "portrait",
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
    },
  });
  ws.columns = [
    { width: 14 }, // SERIE
    { width: 16 }, // FASE
    { width: 26 }, // DETALLE
    { width: 16 }, // COLOR
    { width: 16 }, // VALOR
  ];

  // ── Encabezado ──
  ws.getCell("A1").value = "NOMBRE:";
  ws.getCell("A1").font = { bold: true };
  ws.mergeCells("B1:E1");
  ws.getCell("B1").value = trabajador.nombre;
  ws.getCell("B1").font = { bold: true, size: 14 };

  ws.getCell("A2").value = "FECHA";
  ws.getCell("A2").font = { bold: true };
  ws.getCell("B2").value = periodo.mes;
  ws.getCell("C2").value = periodo.rango;
  ws.getCell("C2").font = { bold: true, size: 12 };
  ws.getCell("E2").value = periodo.anio;
  ws.getCell("E2").alignment = { horizontal: "right" };

  // ── Títulos de columnas ──
  const filaTitulos = 3;
  ["SERIE", "FASE", "DETALLE", "COLOR", "VALOR"].forEach((titulo, i) => {
    const celda = ws.getCell(filaTitulos, i + 1);
    celda.value = titulo;
    celda.font = { bold: true };
    celda.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFF1F5F9" },
    };
    celda.border = BORDE;
    if (i + 1 === COL_VALOR) celda.alignment = { horizontal: "right" };
  });

  // ── Listado de cajas ──
  const primera = filaTitulos + 1;
  tareas.forEach((t, i) => {
    const r = primera + i;
    // Si viene de un periodo anterior (pendiente incluido), se avisa en el detalle
    const esAnterior = t.dia && t.dia < inicioYmd;
    ws.getCell(r, COL_SERIE).value = t.codigoCofre ?? "";
    ws.getCell(r, COL_FASE).value = t.cargo ?? "";
    ws.getCell(r, COL_DETALLE).value =
      (t.referencia ?? "") + (esAnterior ? " (periodo anterior)" : "");
    ws.getCell(r, COL_COLOR).value = t.color ?? "";
    ws.getCell(r, COL_VALOR).value = num(t.valor);
    ws.getCell(r, COL_VALOR).numFmt = FORMATO_PESOS;
    for (let c = 1; c <= 5; c++) ws.getCell(r, c).border = BORDE;
  });
  const ultima = primera + tareas.length - 1;
  const baseTareas = tareas.reduce((acc, t) => acc + num(t.valor), 0);

  // ── Cierre: transporte, subtotal, descuentos y pagar ──
  let fila = ultima + 2; // deja una fila en blanco

  const linea = (etiqueta, valor, { fuerte = false, relleno = false } = {}) => {
    const rot = ws.getCell(fila, COL_LABEL_CIERRE);
    const val = ws.getCell(fila, COL_VALOR_CIERRE);
    rot.value = etiqueta;
    val.value = valor;
    val.numFmt = FORMATO_PESOS;
    rot.border = BORDE;
    val.border = BORDE;
    if (fuerte) {
      rot.font = { bold: true };
      val.font = { bold: true };
    }
    if (relleno) {
      [rot, val].forEach((c) => {
        c.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFE2F0D9" },
        };
      });
    }
    return fila++;
  };

  const transporte = num(trabajador.transporte);
  const eps = num(trabajador.seguridadSocial);
  const bonificacion = num(trabajador.bonificacion);
  const deduccion = num(trabajador.deduccion);

  const colValorLetra = "E"; // COL_VALOR
  const sumaTareas = tareas.length
    ? `SUM(${colValorLetra}${primera}:${colValorLetra}${ultima})`
    : "0";

  let filaTransporte = null;
  if (transporte > 0) filaTransporte = linea("TRANSPORTE", transporte);

  const filaSubtotal = linea(
    "SUBTOTAL",
    {
      formula: filaTransporte
        ? `${sumaTareas}+${colValorLetra}${filaTransporte}`
        : sumaTareas,
      result: baseTareas + transporte,
    },
    { fuerte: true },
  );

  const filaBonificacion =
    bonificacion > 0 ? linea("BONIFICACIÓN", bonificacion) : null;
  const filaDeduccion = deduccion > 0 ? linea("DEDUCCIONES", deduccion) : null;
  const filaEps = eps > 0 ? linea("EPS", eps) : null;

  let formulaPagar = `${colValorLetra}${filaSubtotal}`;
  if (filaBonificacion) formulaPagar += `+${colValorLetra}${filaBonificacion}`;
  if (filaDeduccion) formulaPagar += `-${colValorLetra}${filaDeduccion}`;
  if (filaEps) formulaPagar += `-${colValorLetra}${filaEps}`;

  linea(
    "PAGAR",
    {
      formula: formulaPagar,
      result: baseTareas + transporte + bonificacion - deduccion - eps,
    },
    { fuerte: true, relleno: true },
  );

  // ── Observaciones (qué debe, qué prestó, etc.) ──
  const obs = (trabajador.observaciones ?? "").trim();
  if (obs) {
    fila += 1;
    ws.mergeCells(`A${fila}:E${fila}`);
    const celda = ws.getCell(`A${fila}`);
    celda.value = `Observaciones: ${obs}`;
    celda.alignment = { wrapText: true, vertical: "top" };
    ws.getRow(fila).height = Math.max(20, Math.ceil(obs.length / 60) * 16);
  }

  return ws;
}

/** Construye el libro (sin descargarlo). Útil también para pruebas. */
export async function construirLibroNomina({ cabecera, trabajadores, tareas }) {
  const { default: ExcelJS } = await import("exceljs");
  const wb = new ExcelJS.Workbook();
  wb.created = new Date();

  const inicioYmd = dia(cabecera?.fechaInicio);
  const finYmd = dia(cabecera?.fechaFin);
  const periodo = etiquetaPeriodo(inicioYmd, finYmd);

  const porTrabajador = new Map();
  (tareas ?? []).forEach((t) => {
    if (!porTrabajador.has(t.trabajadorId))
      porTrabajador.set(t.trabajadorId, []);
    porTrabajador.get(t.trabajadorId).push(t);
  });

  const usados = new Set();
  trabajadores.forEach((trabajador) => {
    construirHoja(
      wb,
      nombreHoja(trabajador.nombre, usados),
      trabajador,
      porTrabajador.get(trabajador.trabajadorId) ?? [],
      periodo,
      inicioYmd,
    );
  });

  return { wb, inicioYmd, finYmd };
}

/** Genera y descarga el Excel en el navegador. */
export async function generarExcelNomina(datos) {
  const { wb, inicioYmd, finYmd } = await construirLibroNomina(datos);
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `nomina_${inicioYmd}_${finYmd}.xlsx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
