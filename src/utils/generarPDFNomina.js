import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const TZ = "America/Bogota";

const cop = (val) => "$" + Number(val ?? 0).toLocaleString("es-CO");
// Cero se muestra como guion: así se nota quién no lleva transporte o EPS
const copOGuion = (val) => (Number(val ?? 0) === 0 ? "—" : cop(val));

// Devuelve YYYY-MM-DD en hora de Bogotá. Si ya viene como fecha sin hora,
// la deja igual (evita que se corra un día por la conversión a UTC).
const dia = (iso) => {
  if (!iso) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
  return new Date(iso).toLocaleDateString("en-CA", { timeZone: TZ });
};

export const generarPDFNomina = ({ cabecera, trabajadores }) => {
  // Horizontal: ahora hay 9 columnas
  const doc = new jsPDF({ orientation: "landscape" });

  const inicio = dia(cabecera?.fechaInicio);
  const fin = dia(cabecera?.fechaFin);

  // ── Título ──
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Nómina de Trabajadores", 14, 20);

  // ── Periodo y totales ──
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`Periodo: ${inicio} — ${fin}`, 14, 32);
  doc.text(`Total trabajadores: ${cabecera?.totalTrabajadores}`, 14, 39);
  doc.text(`Total a pagar: ${cop(cabecera?.totalPago)}`, 14, 46);

  // ── Totales por columna ──
  const suma = (campo) =>
    trabajadores.reduce((acc, t) => acc + Number(t[campo] ?? 0), 0);

  // ── Tabla ──
  autoTable(doc, {
    startY: 55,
    head: [
      [
        "Nombre",
        "Cédula",
        "Valor base",
        "Transporte",
        "EPS",
        "Bonificación",
        "Deducción",
        "Total a pagar",
        "Observaciones",
      ],
    ],
    body: trabajadores.map((t) => [
      t.nombre,
      t.documento,
      cop(t.valorBase),
      copOGuion(t.transporte),
      Number(t.seguridadSocial ?? 0) === 0 ? "—" : "-" + cop(t.seguridadSocial),
      copOGuion(t.bonificacion),
      copOGuion(t.deduccion),
      cop(t.totalPagar),
      t.observaciones ?? "",
    ]),
    foot: [
      [
        "Total",
        "",
        cop(suma("valorBase")),
        cop(suma("transporte")),
        "-" + cop(suma("seguridadSocial")),
        cop(suma("bonificacion")),
        cop(suma("deduccion")),
        cop(cabecera?.totalPago),
        "",
      ],
    ],
    styles: {
      fontSize: 9,
      cellPadding: 3,
      overflow: "linebreak",
    },
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontStyle: "bold",
    },
    footStyles: {
      fillColor: [240, 240, 240],
      textColor: [30, 30, 30],
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 42 }, // Nombre
      1: { cellWidth: 24 }, // Cédula
      2: { halign: "right", cellWidth: 27 },
      3: { halign: "right", cellWidth: 25 },
      4: { halign: "right", cellWidth: 24 },
      5: { halign: "right", cellWidth: 26 },
      6: { halign: "right", cellWidth: 26 },
      7: { halign: "right", cellWidth: 29, fontStyle: "bold" },
      8: { cellWidth: "auto" }, // Observaciones ocupa lo que sobra
    },
  });

  // ── Pie de página ──
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text(
      `Página ${i} de ${pageCount}`,
      doc.internal.pageSize.getWidth() - 14,
      doc.internal.pageSize.getHeight() - 10,
      { align: "right" },
    );
    doc.text(
      `Generado el ${new Date().toLocaleDateString("es-CO", { timeZone: TZ })}`,
      14,
      doc.internal.pageSize.getHeight() - 10,
    );
  }

  doc.save(`nomina_${inicio}_${fin}.pdf`);
};
