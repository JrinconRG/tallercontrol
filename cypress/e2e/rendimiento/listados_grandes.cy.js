describe("RENDIMIENTO - Listados grandes", () => {
  const historial = Array.from({ length: 50 }, (_, i) => ({
    sub_id_subproceso: i + 1,
    pro_codigo_cofre: `CF-${i}`,
    referencia_nombre: "Referencia",
    cargo_nombre: "Pulidor",
    sub_fecha_inicio: "2026-01-01T10:00:00",
    sub_fecha_fin: "2026-01-01T11:00:00",
    duracion_reloj: "01h",
    valor_pagar: 1000,
    sub_estado: "finalizado",
    sub_pagado: false,
    sub_fotos_evidencia: [],
  }));

  it("CP1: historial soporta 50 filas", () => {
    cy.intercept("GET", "**/vw_historial_subprocesos_pendientes*", { body: historial });
    cy.visitAuthenticated("/trabajador/historial", "trabajador");
    cy.get("tbody tr").should("have.length.at.least", 50);
  });

  it("CP2: historial no bloquea el scroll", () => {
    cy.intercept("GET", "**/vw_historial_subprocesos_pendientes*", { body: historial });
    cy.visitAuthenticated("/trabajador/historial", "trabajador");
    cy.get(".table-container").scrollTo("bottom", { ensureScrollable: false });
    cy.get("tbody tr").should("have.length.at.least", 50);
    cy.get("body").should("not.be.empty");
  });

  it("CP3: tabla mantiene encabezados visibles", () => {
    cy.intercept("GET", "**/vw_historial_subprocesos_pendientes*", { body: historial });
    cy.visitAuthenticated("/trabajador/historial", "trabajador");
    cy.get("thead").should("be.visible");
  });

  it("CP4: busqueda de empleados responde con lista grande", () => {
    cy.intercept("GET", "**/vw_trabajadores_con_cargos*", { body: Array.from({ length: 40 }, (_, i) => ({ t_id: i, t_nombre: `Empleado ${i}`, cargos: [] })) });
    cy.visitAuthenticated("/gerente/empleados", "gerente");
    cy.url().should("include", "/gerente/empleados");
  });

  it("CP5: inicio soporta 40 procesos", () => {
    cy.intercept("GET", "**/vw_fase_actual*", { body: [] });
    cy.intercept("GET", "**/vw_informacion_subproceso_actual*", { body: [] });
    cy.intercept("GET", "**/vw_procesos_activos*", { body: Array.from({ length: 40 }, (_, i) => ({ pro_id_proceso: i, pro_codigo_cofre: `CF-${i}`, rc_nombre: "Clasico" })) });
    cy.visitAuthenticated("/trabajador/inicio", "trabajador");
    cy.contains("CF-0").should("be.visible");
  });
});
