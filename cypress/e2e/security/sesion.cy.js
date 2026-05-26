describe("SEGURIDAD - Sesion", () => {
  it("CP1: ruta privada redirige si no hay sesion", () => {
    cy.clearLocalStorage();
    cy.visit("/trabajador/inicio");
    cy.url().should("not.include", "/trabajador/inicio");
  });

  it("CP2: localStorage de sesion no guarda password", () => {
    cy.intercept("GET", "**/vw_fase_actual*", { body: [] });
    cy.intercept("GET", "**/vw_procesos_activos*", { body: [] });
    cy.intercept("GET", "**/vw_informacion_subproceso_actual*", { body: [] });
    cy.visitAuthenticated("/trabajador/inicio", "trabajador");
    cy.window().then((win) => {
      expect(win.localStorage.getItem("tallercontrol-auth")).not.to.include("password");
    });
  });

  it("CP3: limpiar sesion bloquea ruta privada", () => {
    cy.visitAuthenticated("/trabajador/inicio", "trabajador");
    cy.clearLocalStorage();
    cy.visit("/trabajador/inicio");
    cy.url().should("not.include", "/trabajador/inicio");
  });

  it("CP4: sesion trabajador conserva rol esperado", () => {
    cy.intercept("GET", "**/vw_fase_actual*", { body: [] });
    cy.intercept("GET", "**/vw_procesos_activos*", { body: [] });
    cy.intercept("GET", "**/vw_informacion_subproceso_actual*", { body: [] });
    cy.visitAuthenticated("/trabajador/inicio", "trabajador");
    cy.window().then((win) => {
      expect(win.localStorage.getItem("tallercontrol-auth")).to.include('"role":"trabajador"');
    });
  });

  it("CP5: sesion gerente conserva rol esperado", () => {
    cy.intercept("GET", "**/vista_dashboard_gerente*", { body: [] });
    cy.visitAuthenticated("/gerente", "gerente");
    cy.window().then((win) => {
      expect(win.localStorage.getItem("tallercontrol-auth")).to.include('"role":"gerente"');
    });
  });
});
