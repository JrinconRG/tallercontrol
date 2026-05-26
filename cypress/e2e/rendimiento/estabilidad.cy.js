describe("RENDIMIENTO - Estabilidad", () => {
  it("CP1: no muestra errores no controlados en login", () => {
    cy.visit("/");
    cy.contains(/error/i).should("not.exist");
  });

  it("CP2: inicio no queda con loader infinito", () => {
    cy.intercept("GET", "**/vw_fase_actual*", { body: [] });
    cy.intercept("GET", "**/vw_procesos_activos*", { body: [] });
    cy.intercept("GET", "**/vw_informacion_subproceso_actual*", { body: [] });
    cy.visitAuthenticated("/trabajador/inicio", "trabajador");
    cy.contains(/Cargando procesos/i).should("not.exist");
  });

  it("CP3: historial no queda con loader infinito", () => {
    cy.intercept("GET", "**/vw_historial_subprocesos_pendientes*", { body: [] });
    cy.visitAuthenticated("/trabajador/historial", "trabajador");
    cy.contains(/Cargando historial/i).should("not.exist");
  });

  it("CP4: empleados mantiene el documento cargado", () => {
    cy.intercept("GET", "**/vw_trabajadores_con_cargos*", { body: [] });
    cy.visitAuthenticated("/gerente/empleados", "gerente");
    cy.document().its("readyState").should("eq", "complete");
  });

  it("CP5: tarifas mantiene el documento cargado", () => {
    cy.intercept("POST", "**/rpc/sp_matriz_precios_json*", { body: [] });
    cy.intercept("GET", "**/vw_trabajadores_select*", { body: [] });
    cy.visitAuthenticated("/gerente/tarifas", "gerente");
    cy.document().its("readyState").should("eq", "complete");
  });
});
