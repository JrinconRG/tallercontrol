describe("REGRESION - Navegacion principal", () => {
  it("CP1: trabajador autenticado entra a inicio", () => {
    cy.intercept("GET", "**/vw_fase_actual*", { body: [] });
    cy.intercept("GET", "**/vw_procesos_activos*", { body: [] });
    cy.intercept("GET", "**/vw_informacion_subproceso_actual*", { body: [] });
    cy.visitAuthenticated("/trabajador/inicio", "trabajador");
    cy.url().should("include", "/trabajador/inicio");
  });

  it("CP2: trabajador autenticado entra a historial", () => {
    cy.intercept("GET", "**/vw_historial_subprocesos_pendientes*", { body: [] });
    cy.visitAuthenticated("/trabajador/historial", "trabajador");
    cy.url().should("include", "/trabajador/historial");
  });

  it("CP3: gerente autenticado entra al dashboard", () => {
    cy.intercept("GET", "**/vista_dashboard_gerente*", { body: [] });
    cy.visitAuthenticated("/gerente", "gerente");
    cy.url().should("include", "/gerente");
  });

  it("CP4: gerente autenticado entra a empleados", () => {
    cy.intercept("GET", "**/vw_trabajadores_con_cargos*", { body: [] });
    cy.visitAuthenticated("/gerente/empleados", "gerente");
    cy.url().should("include", "/gerente/empleados");
  });

  it("CP5: gerente autenticado entra a tarifas", () => {
    cy.intercept("POST", "**/rpc/sp_matriz_precios_json*", { body: [] });
    cy.intercept("GET", "**/vw_trabajadores_select*", { body: [] });
    cy.visitAuthenticated("/gerente/tarifas", "gerente");
    cy.url().should("include", "/gerente/tarifas");
  });
});
