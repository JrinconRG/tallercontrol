describe("RENDIMIENTO - Respuestas API", () => {
  it("CP1: procesos responde antes del timeout visual", () => {
    cy.intercept("GET", "**/vw_procesos_activos*", { delay: 100, body: [] }).as("api");
    cy.intercept("GET", "**/vw_fase_actual*", { body: [] });
    cy.intercept("GET", "**/vw_informacion_subproceso_actual*", { body: [] });
    cy.visitAuthenticated("/trabajador/inicio", "trabajador");
    cy.wait("@api").its("response.statusCode").should("eq", 200);
  });

  it("CP2: historial responde antes del timeout visual", () => {
    cy.intercept("GET", "**/vw_historial_subprocesos_pendientes*", { delay: 100, body: [] }).as("api");
    cy.visitAuthenticated("/trabajador/historial", "trabajador");
    cy.wait("@api").its("response.statusCode").should("eq", 200);
  });

  it("CP3: empleados responde antes del timeout visual", () => {
    cy.intercept("GET", "**/vw_trabajadores_con_cargos*", { delay: 100, body: [] }).as("api");
    cy.visitAuthenticated("/gerente/empleados", "gerente");
    cy.wait("@api").its("response.statusCode").should("eq", 200);
  });

  it("CP4: tarifas responde antes del timeout visual", () => {
    cy.intercept("GET", "**/vw_trabajadores_select*", { body: [] });
    cy.visitAuthenticated("/gerente/tarifas", "gerente");
    cy.contains("Tarifas").should("be.visible");
    cy.contains(/Cargando tarifas/i).should("not.exist");
  });

  it("CP5: dashboard responde antes del timeout visual", () => {
    cy.intercept("GET", "**/vista_dashboard_gerente*", { delay: 100, body: [] }).as("api");
    cy.visitAuthenticated("/gerente", "gerente");
    cy.wait("@api").its("response.statusCode").should("eq", 200);
  });
});
