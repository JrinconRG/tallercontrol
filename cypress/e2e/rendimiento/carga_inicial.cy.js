describe("RENDIMIENTO - Carga inicial", () => {
  it("CP1: login renderiza en menos de 2 segundos", () => {
    const inicio = Date.now();
    cy.visit("/");
    cy.contains(/Iniciar Sesi/i).should("be.visible").then(() => expect(Date.now() - inicio).to.be.lessThan(2000));
  });

  it("CP2: trabajador inicio renderiza con datos vacios", () => {
    cy.intercept("GET", "**/vw_fase_actual*", { body: [] });
    cy.intercept("GET", "**/vw_procesos_activos*", { body: [] });
    cy.intercept("GET", "**/vw_informacion_subproceso_actual*", { body: [] });
    cy.visitAuthenticated("/trabajador/inicio", "trabajador");
    cy.contains(/procesos/i).should("be.visible");
  });

  it("CP3: historial renderiza con datos vacios", () => {
    cy.intercept("GET", "**/vw_historial_subprocesos_pendientes*", { body: [] });
    cy.visitAuthenticated("/trabajador/historial", "trabajador");
    cy.contains(/historial/i).should("be.visible");
  });

  it("CP4: dashboard gerente renderiza sin registros", () => {
    cy.intercept("GET", "**/vista_dashboard_gerente*", { body: [] });
    cy.visitAuthenticated("/gerente", "gerente");
    cy.url().should("include", "/gerente");
  });

  it("CP5: empleados renderiza sin registros", () => {
    cy.intercept("GET", "**/vw_trabajadores_con_cargos*", { body: [] });
    cy.visitAuthenticated("/gerente/empleados", "gerente");
    cy.url().should("include", "/gerente/empleados");
  });
});
