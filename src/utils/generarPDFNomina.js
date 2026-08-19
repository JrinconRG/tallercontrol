import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generarPDFNomina = ({ cabecera, trabajadores }) => {
  const doc = new jsPDF();

  // ── Título ──
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Nómina de Trabajadores", 14, 20);

  // ── Periodo y totales ──
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Periodo: ${cabecera?.fechaInicio?.slice(0, 10)} — ${cabecera?.fechaFin?.slice(0, 10)}`,
    14,
    32,
  );
  doc.text(`Total trabajadores: ${cabecera?.totalTrabajadores}`, 14, 39);
  doc.text(
    `Total a pagar: $${Number(cabecera?.totalPago ?? 0).toLocaleString("es-CO")}`,
    14,
    46,
  );

  // ── Tabla ──
  autoTable(doc, {
    startY: 55,
    head: [
      [
        "Nombre",
        "Cédula",
        "Valor base",
        "Bonificación",
        "Deducción",
        "Total a pagar",
      ],
    ],
    body: trabajadores.map((t) => [
      t.nombre,
      t.documento,
      "$" + Number(t.valorBase).toLocaleString("es-CO"),
      "$" + Number(t.bonificacion).toLocaleString("es-CO"),
      "$" + Number(t.deduccion).toLocaleString("es-CO"),
      "$" + Number(t.totalPagar).toLocaleString("es-CO"),
    ]),
    foot: [
      [
        "Total",
        "",
        "",
        "",
        "",
        "$" + Number(cabecera?.totalPago ?? 0).toLocaleString("es-CO"),
      ],
    ],
    styles: {
      fontSize: 10,
      cellPadding: 4,
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
      0: { cellWidth: 50 }, // Nombre
      1: { cellWidth: 25 }, // Cédula
      2: { halign: "right" },
      3: { halign: "right" },
      4: { halign: "right" },
      5: { halign: "right", fontStyle: "bold" },
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
      `Generado el ${new Date().toLocaleDateString("es-CO")}`,
      14,
      doc.internal.pageSize.getHeight() - 10,
    );
  }

  doc.save(
    `nomina_${cabecera?.fechaInicio?.slice(0, 10)}_${cabecera?.fechaFin?.slice(0, 10)}.pdf`,
  );
};
